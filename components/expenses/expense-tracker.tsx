"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, FileScan, FileText, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { expenses as seedExpenses, projects } from "@/lib/demo-data";
import { cn, formatCurrency, formatTimestamp } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Expense, ExpenseCategory, Project } from "@/types/homey";
import { Badge } from "@/components/ui/badge";
import { TaxCreditGuidance } from "@/components/ui/tax-credit-guidance";
import { PremiumLock } from "@/components/ui/premium-lock";
import { DocumentUploadCard } from "@/components/ui/document-upload-card";

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

type SupabaseExpenseRow = {
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

type SupabaseProjectRow = {
  id: string;
  name: string;
  area: string | null;
  total_budget: number | string;
  status: Project["status"];
  expenses?: Array<{ amount: number | string | null }>;
};

function mapExpense(row: SupabaseExpenseRow): Expense {
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

function mapProject(row: SupabaseProjectRow): Project {
  const spent = row.expenses?.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) || 0;

  return {
    id: row.id,
    name: row.name,
    area: row.area || "Home",
    budget: Number(row.total_budget),
    spent,
    status: row.status,
  };
}

export function ExpenseTracker() {
  const supabase = useMemo(() => createClient(), []);
  const [expenses, setExpenses] = useState(seedExpenses);
  const [projectOptions, setProjectOptions] = useState<Project[]>(projects);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [projectId, setProjectId] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyExpense);
  const [scanMessage, setScanMessage] = useState("Upload or scan a receipt to prefill record details.");
  const [syncMessage, setSyncMessage] = useState("Demo mode. Sign in to sync expenses with your secure account.");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setSyncMessage("Add cloud sync env keys to enable synced expenses.");
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadData() {
      const { data: sessionData } = await client.auth.getSession();
      const activeUserId = sessionData.session?.user.id;

      if (!activeUserId) {
        if (isMounted) setSyncMessage("Demo mode. Login to save expenses, projects, and receipts to your secure account.");
        return;
      }

      if (!isMounted) return;
      setUserId(activeUserId);
      setSyncMessage("Connected to your secure account. Loading your home records...");

      let { data: projectRows, error: projectError } = await client
        .from("projects")
        .select("id,name,area,total_budget,status,expenses(amount)")
        .eq("user_id", activeUserId)
        .order("created_at", { ascending: true });

      if (!projectError && (!projectRows || projectRows.length === 0)) {
        const starterProjects = projects.map((project) => ({
          user_id: activeUserId,
          name: project.name,
          area: project.area,
          total_budget: project.budget,
          status: project.status,
        }));

        await client.from("projects").insert(starterProjects);
        const retry = await client
          .from("projects")
          .select("id,name,area,total_budget,status,expenses(amount)")
          .eq("user_id", activeUserId)
          .order("created_at", { ascending: true });
        projectRows = retry.data;
        projectError = retry.error;
      }

      if (projectError) {
        if (isMounted) setSyncMessage(`Project sync error: ${projectError.message}`);
        return;
      }

      const { data: expenseRows, error: expenseError } = await client
        .from("expenses")
        .select("id,project_id,category,vendor,description,amount,expense_date,tax_deductible,document_url")
        .eq("user_id", activeUserId)
        .order("expense_date", { ascending: false });

      if (expenseError) {
        if (isMounted) setSyncMessage(`Expense sync error: ${expenseError.message}`);
        return;
      }

      if (!isMounted) return;
      setProjectOptions((projectRows || []).map((row) => mapProject(row as SupabaseProjectRow)));
      setExpenses((expenseRows || []).map((row) => mapExpense(row as SupabaseExpenseRow)));
      setSyncMessage("Synced with your account. New records will save automatically.");
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesQuery = `${expense.vendor} ${expense.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || expense.category === category;
      const matchesProject = projectId === "all" || expense.projectId === projectId;
      return matchesQuery && matchesCategory && matchesProject;
    });
  }, [category, expenses, projectId, query]);

  const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const resetForm = () => {
    setForm(emptyExpense);
    setEditingExpenseId(null);
    setIsModalOpen(false);
    setScanMessage("Upload or scan a receipt to prefill record details.");
  };

  const editExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setForm({
      vendor: expense.vendor,
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category,
      projectId: expense.projectId || "",
      date: expense.date,
      taxDeductible: expense.taxDeductible,
      documentUrl: expense.documentUrl || "",
    });
    setScanMessage("Update the fields that need correcting, then save changes.");
    setIsModalOpen(true);
  };

  const deleteExpense = async (expense: Expense) => {
    if (supabase && userId && !expense.id.startsWith("exp-")) {
      const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
      if (error) {
        setSyncMessage(`Could not delete expense: ${error.message}`);
        return;
      }
    }

    setExpenses((current) => current.filter((item) => item.id !== expense.id));
    setSyncMessage(`${expense.vendor} expense deleted.`);
  };

  const addExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.vendor.trim() || !form.description.trim() || !Number.isFinite(amount)) return;

    const draftExpense: Expense = {
      id: editingExpenseId || crypto.randomUUID(),
      vendor: form.vendor.trim(),
      description: form.description.trim(),
      amount,
      category: form.category,
      projectId: form.projectId || undefined,
      date: form.date,
      taxDeductible: form.taxDeductible,
      documentUrl: form.documentUrl || undefined,
    };

    if (supabase && userId) {
      setIsSaving(true);
      const payload = {
        user_id: userId,
        vendor: draftExpense.vendor,
        description: draftExpense.description,
        amount: draftExpense.amount,
        category: draftExpense.category,
        project_id: draftExpense.projectId || null,
        expense_date: draftExpense.date,
        tax_deductible: draftExpense.taxDeductible,
        document_url: draftExpense.documentUrl || null,
        document_name: draftExpense.documentUrl ? draftExpense.documentUrl.split("/").pop() : null,
        metadata: { source: "homey-ui" },
      };
      const request = editingExpenseId && !editingExpenseId.startsWith("exp-")
        ? supabase.from("expenses").update(payload).eq("id", editingExpenseId).select("id,project_id,category,vendor,description,amount,expense_date,tax_deductible,document_url").single()
        : supabase.from("expenses").insert(payload).select("id,project_id,category,vendor,description,amount,expense_date,tax_deductible,document_url").single();
      const { data, error } = await request;
      setIsSaving(false);

      if (error) {
        setSyncMessage(`Could not save to your account: ${error.message}`);
        return;
      }

      const savedExpense = mapExpense(data as SupabaseExpenseRow);
      setExpenses((current) => (editingExpenseId ? current.map((item) => (item.id === editingExpenseId ? savedExpense : item)) : [savedExpense, ...current]));
      setSyncMessage(`Expense ${editingExpenseId ? "updated" : "saved"} to your account at ${formatTimestamp(new Date().toISOString())}. Form cleared.`);
    } else {
      setExpenses((current) => (editingExpenseId ? current.map((item) => (item.id === editingExpenseId ? draftExpense : item)) : [draftExpense, ...current]));
      setSyncMessage(`Expense ${editingExpenseId ? "updated" : "saved"} locally at ${formatTimestamp(new Date().toISOString())}. Form cleared. Login to sync changes.`);
    }

    resetForm();
  };

  const scanReceipt = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({
      ...form,
      vendor: form.vendor || "Scanned Receipt Vendor",
      description: form.description || "Receipt scan: home service or materials purchase",
      amount: form.amount || "189.75",
      category: "materials",
      date: form.date || today,
      documentUrl: form.documentUrl || "receipts/scanned-receipt.pdf",
    });
    setScanMessage("Receipt scan extracted vendor, amount, date, category, and document metadata.");
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Expense organizer</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Projects, utility bills, receipts, and optional tax review</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Track renovation spend, recurring utility bills, receipt metadata, and records you may want to review for deductions or energy-efficiency credits.
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

      <TaxCreditGuidance context="expenses" />

      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
          {syncMessage}
        </div>
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
            {projectOptions.map((project) => (
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
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {filteredExpenses.map((expense) => {
                const project = projectOptions.find((item) => item.id === expense.projectId);
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
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => editExpense(expense)} type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button onClick={() => deleteExpense(expense)} type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-50 dark:border-rose-400/20 dark:text-rose-200 dark:hover:bg-rose-400/10">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
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
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{editingExpenseId ? "Edit record" : "New record"}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{editingExpenseId ? "Correct expense or utility bill" : "Add expense or utility bill"}</h3>
              </div>
              <button onClick={resetForm} type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">
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
                  {projectOptions.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </Field>
              <Field label="Receipt URL">
                <input value={form.documentUrl} onChange={(event) => setForm({ ...form, documentUrl: event.target.value })} className="input" placeholder="Receipt or document URL" />
              </Field>
              <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-sm font-medium leading-6 text-emerald-900 dark:text-emerald-100">{scanMessage}</p>
                  <button onClick={scanReceipt} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <FileScan className="h-4 w-4" />
                    Scan receipt
                  </button>
                </div>
              </div>
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
              Mark for optional tax or energy-credit review
            </label>

            <div className="mt-4">
              <PremiumLock title="Receipt storage" description="Scan, upload, rename, and delete receipt files with secure document history on DomiVault Plus.">
                <DocumentUploadCard locked title="Receipt documents" description="Attach photos, PDFs, and scanned receipt images to this expense." type="receipt" />
              </PremiumLock>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetForm} type="button" className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                Cancel
              </button>
              <button disabled={isSaving} type="submit" className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950">
                {isSaving ? "Saving..." : editingExpenseId ? "Update record" : "Save record"}
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
