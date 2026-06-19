"use client";

import { Download, FileText, TableProperties } from "lucide-react";
import { PremiumLock } from "@/components/ui/premium-lock";
import { formatTimestamp } from "@/lib/utils";

const reportTypes = [
  "Home improvement expense report",
  "Warranty and appliance report",
  "Maintenance history report",
  "Vehicle repair report",
  "Tax credit and rebate packet",
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function downloadBlob(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadCsv(report: string) {
  const generatedAt = new Date().toISOString();
  const rows = [
    ["Report", "Generated At", "Status", "Notes"],
    [report, generatedAt, "Ready", "Connect live Supabase records for complete export packets."],
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  downloadBlob(`${slugify(report)}.csv`, csv, "text/csv;charset=utf-8");
}

function downloadPdf(report: string) {
  const generatedAt = formatTimestamp(new Date().toISOString()).replace(/[()]/g, "");
  const text = `DomiVault ${report}\nGenerated: ${generatedAt}\n\nThis export confirms the report workflow is active. Connect live Supabase data to include full records, receipts, warranties, and service history.`;
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
  downloadBlob(`${slugify(report)}.pdf`, pdf, "application/pdf");
}

export function ExportReportPanel() {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Export reports</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Create polished PDFs and CSV packets for your records.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Export receipts, warranties, maintenance history, vehicle service records, and tax-credit review packets from one vault.
        </p>
      </div>

      <PremiumLock title="Report exports" description="PDF, CSV, and document-packet exports are included with DomiVault Plus." />

      <div className="grid gap-4 lg:grid-cols-2">
        {reportTypes.map((report) => (
          <article key={report} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{report}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Generate a quick export packet for this report type.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button onClick={() => downloadCsv(report)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                <TableProperties className="h-4 w-4" />
                CSV
              </button>
              <button onClick={() => downloadPdf(report)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
