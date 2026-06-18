import { LockKeyhole, Sparkles } from "lucide-react";

type PremiumLockProps = {
  title: string;
  description: string;
  cta?: string;
  children?: React.ReactNode;
};

export function PremiumLock({ title, description, cta = "Upgrade to DomiVault Plus", children }: PremiumLockProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm dark:border-amber-300/20 dark:bg-amber-300/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200">Plus feature</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-950/80 dark:text-amber-50/85">{description}</p>
          </div>
        </div>
        <button type="button" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
          <Sparkles className="h-4 w-4" />
          {cta}
        </button>
      </div>
      {children && <div className="mt-5 opacity-60">{children}</div>}
    </section>
  );
}
