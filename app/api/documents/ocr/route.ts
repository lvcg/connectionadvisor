import { NextResponse } from "next/server";
import { createWorker } from "tesseract.js";
import { requireVaultPlus } from "@/lib/auth/server-plan";

type OcrPayload = {
  text: string;
  status: "processed" | "unavailable" | "failed";
  extracted?: Record<string, string | number | boolean>;
  message: string;
};

const textTypes = new Set([
  "application/json",
  "application/xml",
  "text/csv",
  "text/markdown",
  "text/plain",
  "text/xml",
]);

function extractReceiptFields(text: string) {
  const amountMatch = text.match(/(?:total|amount|paid|balance)\D{0,12}(\$?\s?\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/i);
  const dateMatch = text.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/);
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const vendor = lines.find((line) => /[A-Za-z]/.test(line) && !/receipt|invoice|total/i.test(line));

  return {
    ...(vendor ? { vendor } : {}),
    ...(amountMatch ? { amount: amountMatch[1].replace(/\s/g, "") } : {}),
    ...(dateMatch ? { date: dateMatch[1] } : {}),
  };
}

async function extractWithTesseract(file: File): Promise<OcrPayload> {
  const imageTypes = new Set(["image/bmp", "image/gif", "image/jpeg", "image/png", "image/tiff", "image/webp"]);
  const isImage = imageTypes.has(file.type) || file.name.match(/\.(bmp|gif|jpe?g|png|tiff?|webp)$/i);

  if (!isImage) {
    return {
      text: "",
      status: "unavailable",
      message: "Tesseract OCR currently supports uploaded images. Upload a receipt/warranty photo or camera scan for OCR.",
    };
  }

  const worker = await createWorker(process.env.TESSERACT_LANG || "eng");
  const bytes = Buffer.from(await file.arrayBuffer());
  const result = await worker.recognize(bytes);
  await worker.terminate();
  const text = result.data.text.trim();

  return {
    text,
    status: text ? "processed" : "unavailable",
    extracted: text ? extractReceiptFields(text) : undefined,
    message: text ? "Tesseract OCR text extracted." : "Tesseract OCR completed but no text was detected.",
  };
}

export async function POST(request: Request) {
  try {
    const plus = await requireVaultPlus();

    if (!plus.ok) {
      return NextResponse.json({ text: "", status: "failed", message: plus.message } satisfies OcrPayload, { status: plus.status });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ text: "", status: "failed", message: "No document file was provided." }, { status: 400 });
    }

    if (textTypes.has(file.type) || file.name.match(/\.(csv|json|md|txt|xml)$/i)) {
      const text = (await file.text()).trim();
      return NextResponse.json({
        text,
        status: text ? "processed" : "unavailable",
        extracted: text ? extractReceiptFields(text) : undefined,
        message: text ? "Text extracted from document." : "The document did not contain readable text.",
      } satisfies OcrPayload);
    }

    const result = await extractWithTesseract(file);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      text: "",
      status: "failed",
      message: error instanceof Error ? error.message : "OCR failed.",
    } satisfies OcrPayload, { status: 500 });
  }
}
