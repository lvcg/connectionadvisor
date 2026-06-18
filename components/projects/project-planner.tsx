"use client";

import { useState } from "react";
import { Pencil, Plus, Target, Trash2, X } from "lucide-react";
import { projects as seedProjects } from "@/lib/demo-data";
import { formatCurrency, formatTimestamp } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TaxCreditGuidance } from "@/components/ui/tax-credit-guidance";
import type { Project } from "@/types/homey";

const emptyProject = {
  name: "",
  area: "",
  budget: "",
  spent: "",
  status: "planning" as Project["status"],
};

export function ProjectPlanner() {
  const [projects, setProjects] = useState(seedProjects);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("Project planner budgets are separate from actual expense totals.");

  const plannedBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const plannedSpend = projects.reduce((sum, project) => sum + project.spent, 0);
  const remaining = Math.max(0, plannedBudget - plannedSpend);

  const resetForm = () => {
    setForm(emptyProject);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const editProject = (project: Project) => {
    setEditingId(project.id);
    setForm({
      name: project.name,
      area: project.area,
      budget: String(project.budget),
      spent: String(project.spent),
      status: project.status,
    });
    setIsModalOpen(true);
  };

  const deleteProject = (project: Project) => {
    setProjects((current) => current.filter((item) => item.id !== project.id));
    setMessage(`${project.name} removed from project planner.`);
  };

  const saveProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const nextProject: Project = {
      id: editingId || crypto.randomUUID(),
      name: form.name.trim(),
      area: form.area.trim() || "Home",
      budget: Number(form.budget) || 0,
      spent: Number(form.spent) || 0,
      status: form.status,
    };

    setProjects((current) => {
      if (!editingId) return [nextProject, ...current];
      return current.map((project) => (project.id === editingId ? nextProject : project));
    });
    setMessage(`${nextProject.name} ${editingId ? "updated" : "added"} in project planner at ${formatTimestamp(new Date().toISOString())}. Form cleared.`);
    resetForm();
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Project planner</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Budget planning separate from actual expenses</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Plan remodel budgets, track estimated progress, and keep actual expense totals on the expense dashboard.
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950" type="button">
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Planned budget" value={formatCurrency(plannedBudget)} />
        <SummaryCard label="Planned spend" value={formatCurrency(plannedSpend)} />
        <SummaryCard label="Remaining plan" value={formatCurrency(remaining)} />
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
        {message}
      </div>

      <TaxCreditGuidance context="projects" />

      <div className="grid gap-4 xl:grid-cols-3">
        {projects.map((project) => {
          const percent = project.budget > 0 ? Math.min(100, Math.round((project.spent / project.budget) * 100)) : 0;
          return (
            <article key={project.id} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05]">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
                  <Target className="h-5 w-5" />
                </div>
                <Badge tone={project.status === "completed" ? "emerald" : "indigo"}>{project.status}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{project.name}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{project.area}</p>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(project.spent)}</span>
                  <span className="text-slate-500">of {formatCurrency(project.budget)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => editProject(project)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button onClick={() => deleteProject(project)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 text-sm font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-50 dark:border-rose-400/20 dark:text-rose-200 dark:hover:bg-rose-400/10">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={saveProject} className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white p-6 shadow-glass dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{editingId ? "Edit plan" : "New plan"}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{editingId ? "Update project plan" : "Add project plan"}</h3>
              </div>
              <button onClick={resetForm} type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Project name">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input" placeholder="Kitchen remodel" />
              </Field>
              <Field label="Area">
                <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} className="input" placeholder="Kitchen, roof, bathroom" />
              </Field>
              <Field label="Planned budget">
                <input value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} className="input" inputMode="decimal" placeholder="0.00" />
              </Field>
              <Field label="Planned spend / progress">
                <input value={form.spent} onChange={(event) => setForm({ ...form, spent: event.target.value })} className="input" inputMode="decimal" placeholder="0.00" />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Project["status"] })} className="input">
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetForm} type="button" className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
                {editingId ? "Update project" : "Save project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
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
