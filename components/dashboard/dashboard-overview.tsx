import { CalendarClock, CircleDollarSign, Hammer, ReceiptText, Refrigerator } from "lucide-react";
import { appliances, expenses, maintenanceTasks, projects } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/ui/metric-card";
import { SpendingChart } from "./spending-chart";
import { Badge } from "@/components/ui/badge";

export function DashboardOverview() {
  const totalInvested = projects.reduce((sum, project) => sum + project.spent, 0);
  const utilitySpend = expenses.filter((expense) => expense.category === "utilities").reduce((sum, expense) => sum + expense.amount, 0);
  const taxDeductible = expenses.filter((expense) => expense.taxDeductible).reduce((sum, expense) => sum + expense.amount, 0);
  const upcomingTasks = maintenanceTasks.filter((task) => task.status !== "completed").length;
  const serviceSoon = appliances.filter((appliance) => appliance.status === "service-soon" || appliance.status === "replace").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Total invested" value={formatCurrency(totalInvested)} caption="Across active and completed projects" icon={Hammer} />
        <MetricCard title="Utility spend" value={formatCurrency(utilitySpend)} caption="Current month tracked bills" icon={ReceiptText} accent="indigo" />
        <MetricCard title="Upcoming tasks" value={`${upcomingTasks}`} caption="Maintenance items need attention" icon={CalendarClock} accent="amber" />
        <MetricCard title="Tax deductible" value={formatCurrency(taxDeductible)} caption="Potentially deductible expenses" icon={CircleDollarSign} accent="emerald" />
        <MetricCard title="Service watch" value={`${serviceSoon}`} caption="Appliances need service review" icon={Refrigerator} accent="rose" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <SpendingChart />
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Project budgets</p>
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Budget progress</h2>
          <div className="mt-6 space-y-5">
            {projects.map((project) => {
              const percent = Math.min(100, Math.round((project.spent / project.budget) * 100));
              return (
                <div key={project.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{project.name}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(project.spent)} of {formatCurrency(project.budget)}</p>
                    </div>
                    <Badge tone={project.status === "completed" ? "emerald" : "indigo"}>{project.status}</Badge>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
