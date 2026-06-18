import { CalendarClock, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { appliances, vendors } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusTone = {
  excellent: "emerald",
  monitor: "amber",
  "service-soon": "rose",
  replace: "rose",
} as const;

function getAge(installDate: string) {
  const installed = new Date(installDate);
  const now = new Date();
  const years = now.getFullYear() - installed.getFullYear();
  const months = now.getMonth() - installed.getMonth();
  return Math.max(0, years + months / 12);
}

export function ApplianceTracker() {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Appliance lifecycle</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Age, warranty, and service date tracker</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Track install dates, expected lifespan, warranty windows, preferred service providers, and upcoming maintenance reminders.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {appliances.map((appliance) => {
          const vendor = vendors.find((item) => item.id === appliance.assignedVendorId);
          const age = getAge(appliance.installDate);
          const lifespanProgress = Math.min(100, Math.round((age / appliance.expectedLifespanYears) * 100));

          return (
            <article key={appliance.id} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05]">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
                  <Wrench className="h-5 w-5" />
                </div>
                <Badge tone={statusTone[appliance.status]}>{appliance.status.replace("-", " ")}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{appliance.name}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{appliance.brand} - {appliance.model}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{appliance.location}</p>

              <div className="mt-5 space-y-3">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{age.toFixed(1)} years old</span>
                    <span className="text-slate-500">{appliance.expectedLifespanYears} yr lifespan</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className={cn("h-full rounded-full", lifespanProgress > 75 ? "bg-amber-500" : "bg-emerald-500")}
                      style={{ width: `${lifespanProgress}%` }}
                    />
                  </div>
                </div>

                <InfoRow icon={CalendarClock} label="Next service" value={appliance.nextServiceDate} />
                <InfoRow icon={ShieldCheck} label="Warranty expires" value={appliance.warrantyExpires || "Not tracked"} />
                <InfoRow icon={Wrench} label="Preferred vendor" value={vendor ? vendor.company : "Unassigned"} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
      <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
