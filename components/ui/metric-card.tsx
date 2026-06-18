import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  accent?: "emerald" | "indigo" | "amber" | "rose";
};

const accents = {
  emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-300",
  indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-600 dark:text-indigo-300",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-300",
  rose: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-300",
};

export function MetricCard({ title, value, caption, icon: Icon, accent = "emerald" }: MetricCardProps) {
  return (
    <article className="group rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
        </div>
        <div className={cn("rounded-2xl bg-gradient-to-br p-3", accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
