import { ExternalLink, Leaf, ShieldCheck } from "lucide-react";

type TaxCreditGuidanceProps = {
  context: "expenses" | "projects";
};

const contextCopy = {
  expenses: "Use the optional tax marker for receipts you want to review later with your tax preparer.",
  projects: "Use project planning to flag upgrades that may deserve a tax-credit check before you hire or buy.",
};

export function TaxCreditGuidance({ context }: TaxCreditGuidanceProps) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-200">Energy efficiency tax credits</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Keep receipts, product details, and install dates together.</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-950/80 dark:text-emerald-50/85">
              {contextCopy[context]} Federal home energy credits can apply to qualifying efficiency upgrades, but eligibility depends on the home, product standards, install date, rebates, and IRS rules.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a href="https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
            IRS 25C
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a href="https://www.energystar.gov/about/federal-tax-credits" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white/70 px-3 text-xs font-semibold text-emerald-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-300/30 dark:bg-white/10 dark:text-emerald-50">
            ENERGY STAR
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <GuidanceItem title="Common categories" body="Heat pumps, heat pump water heaters, insulation, air sealing, windows, exterior doors, energy audits, panels, solar, geothermal, wind, and battery storage may be worth reviewing." />
        <GuidanceItem title="What to capture" body="Receipt, contractor invoice, install date, manufacturer/model info, product certification, QMID or manufacturer code when required, rebates, and utility incentives." />
        <GuidanceItem title="How to claim" body="Credits are generally claimed with IRS Form 5695 for the tax year the qualified property is installed. Confirm eligibility before relying on an estimate." />
      </div>
      <div className="mt-4 flex gap-3 rounded-2xl border border-emerald-300/70 bg-white/70 p-3 text-sm leading-6 text-emerald-950 dark:border-emerald-300/20 dark:bg-white/10 dark:text-emerald-50">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Homey helps organize records for review. It does not provide tax advice or certify that an expense qualifies for a credit.</p>
      </div>
    </section>
  );
}

function GuidanceItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white/75 p-4 dark:border-emerald-300/20 dark:bg-white/[0.07]">
      <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
    </div>
  );
}
