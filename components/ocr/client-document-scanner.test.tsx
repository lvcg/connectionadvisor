import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createWorker } from "tesseract.js";
import { ClientDocumentScanner } from "./client-document-scanner";

const mockLoadLanguage = jest.fn();
const mockInitialize = jest.fn();
const mockRecognize = jest.fn();
const mockTerminate = jest.fn();

jest.mock("tesseract.js", () => ({
  createWorker: jest.fn(),
}));

function deferredRecognize(text = "Hello World from Mock OCR") {
  let resolve!: (value: { data: { text: string } }) => void;
  const promise = new Promise<{ data: { text: string } }>((innerResolve) => {
    resolve = innerResolve;
  });

  mockRecognize.mockReturnValueOnce(promise);

  return {
    resolve: () => resolve({ data: { text } }),
  };
}

function installCanvasMocks() {
  const drawImage = jest.fn();
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
  jest.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function toBlob(callback) {
    callback(new Blob(["camera frame"], { type: "image/png" }));
  });
}

describe("ClientDocumentScanner", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    (createWorker as jest.Mock).mockImplementation(async (_language, _oem, options) => {
      options?.logger?.({ progress: 0.42, status: "recognizing text" });
      return {
        loadLanguage: mockLoadLanguage.mockResolvedValue(undefined),
        initialize: mockInitialize.mockResolvedValue(undefined),
        recognize: mockRecognize,
        terminate: mockTerminate.mockResolvedValue(undefined),
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("processes an uploaded image file and renders editable OCR text", async () => {
    const user = userEvent.setup();
    const recognition = deferredRecognize();
    render(<ClientDocumentScanner />);

    const file = new File(["mock image"], "receipt.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Upload document image"), file);

    expect(screen.getByText("Reading document")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();

    recognition.resolve();

    const textarea = await screen.findByLabelText("Extracted text");
    expect(textarea).toHaveValue("Hello World from Mock OCR");
    expect(screen.getByText("Text extracted")).toBeInTheDocument();
    expect(createWorker).toHaveBeenCalledWith("eng", undefined, expect.objectContaining({ logger: expect.any(Function) }));
    expect(mockLoadLanguage).toHaveBeenCalledWith("eng");
    expect(mockInitialize).toHaveBeenCalledWith("eng");
    expect(mockTerminate).toHaveBeenCalled();
  });

  it("captures a camera frame and sends it through OCR", async () => {
    const user = userEvent.setup();
    installCanvasMocks();
    const recognition = deferredRecognize("Camera OCR result");
    const stop = jest.fn();
    const play = jest.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{ stop }],
        }),
      },
    });

    render(<ClientDocumentScanner />);

    await user.click(screen.getByRole("button", { name: "Use camera" }));
    expect(await screen.findByText("Camera active")).toBeInTheDocument();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: { facingMode: "environment" } });
    expect(play).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Capture" }));
    expect(screen.getByText("Reading document")).toBeInTheDocument();
    expect(stop).toHaveBeenCalled();

    recognition.resolve();

    expect(await screen.findByDisplayValue("Camera OCR result")).toBeInTheDocument();
    expect(mockRecognize).toHaveBeenCalledWith(expect.any(Blob));
  });

  it("shows a friendly error when OCR processing fails", async () => {
    const user = userEvent.setup();
    mockRecognize.mockRejectedValueOnce(new Error("OCR exploded"));
    render(<ClientDocumentScanner />);

    const file = new File(["mock image"], "bad.jpeg", { type: "image/jpeg" });
    await user.upload(screen.getByLabelText("Upload document image"), file);

    expect(await screen.findByRole("alert")).toHaveTextContent("We could not read text from this document.");
    expect(screen.getByText("Scan failed")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockTerminate).toHaveBeenCalled();
    });
  });
});
