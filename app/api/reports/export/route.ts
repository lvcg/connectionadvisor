import { NextResponse } from "next/server";
import { requireVaultPlus } from "@/lib/auth/server-plan";
import { formatTimestamp } from "@/lib/utils";

const allowedFormats = new Set(["csv", "pdf"]);

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function createCsv(report: string) {
  const generatedAt = new Date().toISOString();
  const rows = [
    ["Report", "Generated At", "Status", "Notes"],
    [report, generatedAt, "Ready", "Plus export generated from a trusted server route."],
  ];

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function createPdf(report: string) {
  const generatedAt = formatTimestamp(new Date().toISOString()).replace(/[()]/g, "");
  const text = `DomiVault ${report}\nGenerated: ${generatedAt}\n\nThis Plus export confirms the report workflow is active. Connect live Supabase data to include full records, receipts, warranties, and service history.`;
  const escaped = text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\n/g, ") Tj T* (");
  const stream = `BT /F1 14 Tf 54 760 Td (${escaped}) Tj ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

export async function POST(request: Request) {
  const plus = await requireVaultPlus();

  if (!plus.ok) {
    return NextResponse.json({ message: plus.message }, { status: plus.status });
  }

  const body = await request.json().catch(() => null) as { report?: string; format?: string } | null;
  const report = body?.report?.trim();
  const format = body?.format?.toLowerCase();

  if (!report || !format || !allowedFormats.has(format)) {
    return NextResponse.json({ message: "Choose a report and export format." }, { status: 400 });
  }

  const filename = `${slugify(report)}.${format}`;
  const content = format === "csv" ? createCsv(report) : createPdf(report);
  const contentType = format === "csv" ? "text/csv;charset=utf-8" : "application/pdf";

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
