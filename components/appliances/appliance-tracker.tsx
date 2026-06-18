"use client";

import { useState } from "react";
import { CalendarClock, Plus, ShieldCheck, Wrench, X, type LucideIcon } from "lucide-react";
import { appliances as seedAppliances, vendors } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Appliance, ApplianceStatus } from "@/types/homey";

const statusTone = {
  excellent: "emerald",
  monitor: "amber",
  "service-soon": "rose",
  replace: "rose",
} as const;

const emptyAppliance = {
  name: "",
  brand: "",
  model: "",
  location: "",
  installDate: new Date().toISOString().slice(0, 10),
  expectedLifespanYears: "10",
  lastServiceDate: "",
  nextServiceDate: new Date().toISOString().slice(0, 10),
  warrantyExpires: "",
  notes: "",
  status: "excellent" as ApplianceStatus,
  assignedVendorId: "",
};

function getAge(installDate: string) {
  const installed = new Date(installDate);
  const now = new Date();
  const years = now.getFullYear() - installed.getFullYear();
  const months = now.getMonth() - installed.getMonth();
  return Math.max(0, years + months / 12);
}

export function ApplianceTracker() {
  const [appliances, setAppliances] = useState(seedAppliances);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyAppliance);

  const addAppliance = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const nextAppliance: Appliance = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      brand: form.brand.trim() || "Unknown brand",
      model: form.model.trim() || "Unknown model",
      location: form.location.trim() || "Unassigned",
      installDate: form.installDate,
      expectedLifespanYears: Number(form.expectedLifespanYears) || 10,
      notes: form.notes.trim() || undefined,
      lastServiceDate: form.lastServiceDate || undefined,
      nextServiceDate: form.nextServiceDate,
      warrantyExpires: form.warrantyExpires || undefined,
      status: form.status,
      assignedVendorId: form.assignedVendorId || undefined,
    };

    setAppliances((current) => [nextAppliance, ...current]);
    setForm(emptyAppliance);
    setIsModalOpen(false);
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Appliance lifecycle</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Age, warranty, and service date tracker</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Track install dates, expected lifespan, warranty windows, preferred service providers, and upcoming maintenance reminders.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Appliance
          </button>
        </div>
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
              {appliance.notes && (
                <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Notes: </span>
                  {appliance.notes}
                </div>
              )}

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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={addAppliance} className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white p-6 shadow-glass dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">New appliance</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Add appliance to tracker</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input" placeholder="Washer, HVAC, water heater" />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="input" placeholder="Kitchen, garage, attic" />
              </Field>
              <Field label="Brand">
                <input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className="input" placeholder="LG, Trane, Rheem" />
              </Field>
              <Field label="Model">
                <input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} className="input" placeholder="Model number" />
              </Field>
              <Field label="Install date">
                <input value={form.installDate} onChange={(event) => setForm({ ...form, installDate: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Expected lifespan">
                <input value={form.expectedLifespanYears} onChange={(event) => setForm({ ...form, expectedLifespanYears: event.target.value })} className="input" inputMode="numeric" />
              </Field>
              <Field label="Last service">
                <input value={form.lastServiceDate} onChange={(event) => setForm({ ...form, lastServiceDate: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Next service">
                <input value={form.nextServiceDate} onChange={(event) => setForm({ ...form, nextServiceDate: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Warranty expires">
                <input value={form.warrantyExpires} onChange={(event) => setForm({ ...form, warrantyExpires: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Preferred vendor">
                <select value={form.assignedVendorId} onChange={(event) => setForm({ ...form, assignedVendorId: event.target.value })} className="input">
                  <option value="">Unassigned</option>
                  {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.company}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ApplianceStatus })} className="input">
                  <option value="excellent">Excellent</option>
                  <option value="monitor">Monitor</option>
                  <option value="service-soon">Service soon</option>
                  <option value="replace">Replace</option>
                </select>
              </Field>
              <Field label="Notes">
                <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="input min-h-24 md:col-span-2" placeholder="Service history, filter size, sounds, warranty notes, or repair details" />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} type="button" className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
                Save appliance
              </button>
            </div>
          </form>
        </div>
      )}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      {children}
    </label>
  );
}
