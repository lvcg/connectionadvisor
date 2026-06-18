"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, FileText, Plus, Search, X } from "lucide-react";
import { expenses as seedExpenses, projects } from "@/lib/demo-data";
import { cn, formatCurrency } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/types/homey";
import { Badge } from "@/components/ui/badge";

const categories: Array<"all" | ExpenseCategory> = ["all", "materials", "labor", "permits", "utilities", "inspection", "design"];

const categoryTone = {
  materials: "emerald",
  labor: "indigo",
  permits: "amber",
  utilities: "slate",
  inspection: "rose",
  design: "indigo",
} as const;

const emptyExpense = {
  vendor: "",
  description: "",
  amount: "",
  category: "materials" as ExpenseCategory,
  projectId: "",
  date: new Date().toISOString().slice(0, 10),
  taxDeductible: false,
  documentUrl: "",
};

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState(seedExpenses);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [projectId, setProjectId] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyExpense);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesQuery = `${expense.vendor} ${expense.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || expense.category === category;
      const matchesProject = projectId === "all" || expense.projectId === projectId;
      return matchesQuery && matchesCategory && matchesProject;
    });
  }, [category, expenses, projectId, query]);

  const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const addExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.vendor.trim() || !form.description.trim() || !Number.isFinite(amount)) return;

    const nextExpense: Expense = {
      id: crypto.randomUUID(),
      vendor: form.vendor.trim(),
      description: form.description.trim(),
      amount,
      category: form.category,
      projectId: form.projectId || undefined,
      date: form.date,
      taxDeductible: form.taxDeductible,
      documentUrl: form.documentUrl || undefined,
    };

    setExpenses((current) => [nextExpense, ...current]);
    setForm(emptyExpense);
    setIsModalOpen(false);
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Expense organizer</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Projects, utility bills, receipts, and deductions</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Track renovation spend, recurring utility bills, receipt metadata, and tax-deductible home expenses from one refined workspace.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Expense / Bill
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vendor or description"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5"
            />
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item === "all" ? "All categories" : item}</option>
            ))}
          </select>
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5"
          >
            <option value="all">All projects and bills</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <div className="rounded-2xl bg-slate-950 px-4 py-2 text-white dark:bg-white dark:text-slate-950">
            <p className="text-xs opacity-70">Filtered total</p>
            <p className="font-semibold">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-slate-200/70 text-xs uppercase tracking-[0.18em] text-slate-500 dark:border-white/10">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Vendor</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">
                  <span className="inline-flex items-center gap-2">Amount <ArrowUpDown className="h-3.5 w-3.5" /></span>
                </th>
                <th className="px-5 py-4">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {filteredExpenses.map((expense) => {
                const project = projects.find((item) => item.id === expense.projectId);
                return (
                  <tr key={expense.id} className="transition-colors duration-200 hover:bg-emerald-50/60 dark:hover:bg-emerald-400/5">
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{expense.date}</td>
                    <td className="px-5 py-4 font-semibold text-slate-950 dark:text-white">{expense.vendor}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{expense.description}</td>
                    <td className="px-5 py-4"><Badge tone={categoryTone[expense.category]}>{expense.category}</Badge></td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{project?.name || "Utility / home bill"}</td>
                    <td className="px-5 py-4 font-semibold text-slate-950 dark:text-white">{formatCurrency(expense.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex items-center gap-2 text-sm", expense.documentUrl ? "text-emerald-600" : "text-slate-400")}>
                        <FileText className="h-4 w-4" />
                        {expense.documentUrl ? "Attached" : "Missing"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={addExpense} className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white p-6 shadow-glass dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">New record</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Add expense or utility bill</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Vendor">
                <input value={form.vendor} onChange={(event) => setForm({ ...form, vendor: event.target.value })} className="input" placeholder="Vendor name" />
              </Field>
              <Field label="Amount">
                <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="input" inputMode="decimal" placeholder="0.00" />
              </Field>
              <Field label="Date">
                <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })} className="input">
                  {categories.filter((item) => item !== "all").map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Project">
                <select value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })} className="input">
                  <option value="">Utility / home bill</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </Field>
              <Field label="Receipt URL">
                <input value={form.documentUrl} onChange={(event) => setForm({ ...form, documentUrl: event.target.value })} className="input" placeholder="Supabase Storage URL" />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="input min-h-24 md:col-span-2" placeholder="What was purchased or paid?" />
              </Field>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm font-medium dark:border-white/10">
              <input
                checked={form.taxDeductible}
                onChange={(event) => setForm({ ...form, taxDeductible: event.target.checked })}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
              />
              Mark as tax-deductible
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} type="button" className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
                Save record
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      {children}
    </label>
  );
}
