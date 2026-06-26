"use client";

import { useState } from "react";
import { Download, FileText, TableProperties } from "lucide-react";
import { PremiumLock } from "@/components/ui/premium-lock";

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

export function ExportReportPanel() {
  const [notice, setNotice] = useState("Exports are verified server-side as a DomiVault Plus feature.");
  const [isExporting, setIsExporting] = useState("");

  const exportReport = async (report: string, format: "csv" | "pdf") => {
    const exportKey = `${report}-${format}`;
    setIsExporting(exportKey);
    setNotice(`Preparing ${format.toUpperCase()} export...`);

    const response = await fetch("/api/reports/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report, format }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: "Export failed." }));
      setNotice(response.status === 402 ? "Upgrade to DomiVault Plus to export reports." : payload.message || "Export failed.");
      setIsExporting("");
      return;
    }

    const blob = await response.blob();
    downloadBlob(`${slugify(report)}.${format}`, blob, response.headers.get("Content-Type") || "application/octet-stream");
    setNotice(`${report} ${format.toUpperCase()} exported.`);
    setIsExporting("");
  };

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

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
        {notice}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {reportTypes.map((report) => (
          <article key={report} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{report}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Generate a quick export packet for this report type.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button disabled={Boolean(isExporting)} onClick={() => exportReport(report, "csv")} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                <TableProperties className="h-4 w-4" />
                {isExporting === `${report}-csv` ? "Preparing..." : "CSV"}
              </button>
              <button disabled={Boolean(isExporting)} onClick={() => exportReport(report, "pdf")} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950">
                <Download className="h-4 w-4" />
                {isExporting === `${report}-pdf` ? "Preparing..." : "PDF"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
