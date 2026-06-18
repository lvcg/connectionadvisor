import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  accent?: "emerald" | "indigo" | "amber" | "rose";
  href?: string;
};

const accents = {
  emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-300",
  indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-600 dark:text-indigo-300",
  amber: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-300",
  rose: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-300",
};

export function MetricCard({ title, value, caption, icon: Icon, accent = "emerald", href }: MetricCardProps) {
  const content = (
    <article className="group h-full rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.06]">
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br", accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium leading-tight text-slate-500 dark:text-slate-400">{title}</p>
        </div>
        <div>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{caption}</p>
        </div>
      </div>
    </article>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block focus:outline-none focus:ring-4 focus:ring-emerald-500/15">
      {content}
    </Link>
  );
}
