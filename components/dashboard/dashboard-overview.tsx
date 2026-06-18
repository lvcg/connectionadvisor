"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, ClipboardList, Hammer, ReceiptText, Refrigerator } from "lucide-react";
import { appliances, expenses as seedExpenses, maintenanceTasks } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/ui/metric-card";
import { SpendingChart } from "./spending-chart";
import { createClient } from "@/lib/supabase/client";
import type { Expense, ExpenseCategory } from "@/types/homey";

type ExpenseRow = {
  id: string;
  project_id: string | null;
  category: ExpenseCategory;
  vendor: string;
  description: string | null;
  amount: number | string;
  expense_date: string;
  tax_deductible: boolean;
  document_url: string | null;
};

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    projectId: row.project_id || undefined,
    category: row.category,
    vendor: row.vendor,
    description: row.description || "",
    amount: Number(row.amount),
    date: row.expense_date,
    taxDeductible: row.tax_deductible,
    documentUrl: row.document_url || undefined,
  };
}

export function DashboardOverview() {
  const supabase = useMemo(() => createClient(), []);
  const [expenses, setExpenses] = useState(seedExpenses);
  const [syncMessage, setSyncMessage] = useState("Dashboard is using demo expense data. Login and run the Supabase schema to sync.");

  useEffect(() => {
    if (!supabase) return;

    const client = supabase;
    let isMounted = true;

    async function loadExpenses() {
      const { data: sessionData } = await client.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;

      const { data, error } = await client
        .from("expenses")
        .select("id,project_id,category,vendor,description,amount,expense_date,tax_deductible,document_url")
        .eq("user_id", userId)
        .order("expense_date", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setSyncMessage(`Dashboard could not load Supabase expenses: ${error.message}`);
        return;
      }

      setExpenses((data || []).map((row) => mapExpense(row as ExpenseRow)));
      setSyncMessage("Dashboard totals are calculated from your Supabase expense records.");
    }

    loadExpenses();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const totalInvested = expenses.filter((expense) => expense.category !== "utilities").reduce((sum, expense) => sum + expense.amount, 0);
  const utilitySpend = expenses.filter((expense) => expense.category === "utilities").reduce((sum, expense) => sum + expense.amount, 0);
  const upcomingTasks = maintenanceTasks.filter((task) => task.status !== "completed").length;
  const serviceSoon = appliances.filter((appliance) => appliance.status === "service-soon" || appliance.status === "replace").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total invested" value={formatCurrency(totalInvested)} caption="Non-utility expense records" icon={Hammer} href="/expenses" />
        <MetricCard title="Utility spend" value={formatCurrency(utilitySpend)} caption="Review monthly bills" icon={ReceiptText} accent="indigo" href="/expenses" />
        <MetricCard title="Upcoming tasks" value={`${upcomingTasks}`} caption="Open maintenance schedule" icon={CalendarClock} accent="amber" href="/maintenance" />
        <MetricCard title="Service watch" value={`${serviceSoon}`} caption="Open appliance list" icon={Refrigerator} accent="rose" href="/appliances" />
      </section>

      <Link
        href="/projects"
        className="group flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] md:flex-row md:items-center"
      >
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Project planner</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Plan budgets separately from actual expenses</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Create remodel plans, estimate budgets, track planned progress, and keep dashboard totals focused on real expense records.
            </p>
          </div>
        </div>
        <span className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white transition-all duration-200 group-hover:gap-3 dark:bg-white dark:text-slate-950">
          Open planner
          <ArrowRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
        {syncMessage}
      </div>

      <section className="grid gap-4">
        <SpendingChart />
      </section>
    </div>
  );
}
