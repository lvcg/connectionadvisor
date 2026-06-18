import { Download, FileText, TableProperties } from "lucide-react";
import { PremiumLock } from "@/components/ui/premium-lock";

const reportTypes = [
  "Home improvement expense report",
  "Warranty and appliance report",
  "Maintenance history report",
  "Vehicle repair report",
  "Tax credit and rebate packet",
];

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
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Preview the report type now. Upgrade to generate downloadable exports.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">
                <TableProperties className="h-4 w-4" />
                CSV
              </button>
              <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
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
