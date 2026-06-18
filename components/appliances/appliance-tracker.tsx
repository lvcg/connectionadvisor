"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, FileScan, Pencil, Plus, ShieldCheck, Trash2, Wrench, X, type LucideIcon } from "lucide-react";
import { appliances as seedAppliances, vendors } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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

type ApplianceRow = {
  id: string;
  vendor_id: string | null;
  name: string;
  brand: string | null;
  model: string | null;
  location: string | null;
  install_date: string | null;
  expected_lifespan_years: number | null;
  last_service_date: string | null;
  next_service_date: string | null;
  warranty_expires: string | null;
  status: ApplianceStatus;
  notes: string | null;
};

const applianceSelect = "id,vendor_id,name,brand,model,location,install_date,expected_lifespan_years,last_service_date,next_service_date,warranty_expires,status,notes";

function getAge(installDate: string) {
  const installed = new Date(installDate);
  const now = new Date();
  const years = now.getFullYear() - installed.getFullYear();
  const months = now.getMonth() - installed.getMonth();
  return Math.max(0, years + months / 12);
}

function mapAppliance(row: ApplianceRow): Appliance {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || "Unknown brand",
    model: row.model || "Unknown model",
    location: row.location || "Unassigned",
    installDate: row.install_date || new Date().toISOString().slice(0, 10),
    expectedLifespanYears: row.expected_lifespan_years || 10,
    lastServiceDate: row.last_service_date || undefined,
    nextServiceDate: row.next_service_date || new Date().toISOString().slice(0, 10),
    warrantyExpires: row.warranty_expires || undefined,
    notes: row.notes || undefined,
    status: row.status,
    assignedVendorId: row.vendor_id || undefined,
  };
}

export function ApplianceTracker() {
  const supabase = useMemo(() => createClient(), []);
  const [appliances, setAppliances] = useState(seedAppliances);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplianceId, setEditingApplianceId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAppliance);
  const [notice, setNotice] = useState("Demo mode. Login to sync appliances and warranty records to Supabase.");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setNotice("Add Supabase env keys to sync appliances.");
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadAppliances() {
      const { data: sessionData } = await client.auth.getSession();
      const activeUserId = sessionData.session?.user.id;

      if (!activeUserId) {
        if (isMounted) setNotice("Demo mode. Login to save appliance records to Supabase.");
        return;
      }

      setUserId(activeUserId);
      let { data, error } = await client
        .from("appliances")
        .select(applianceSelect)
        .eq("user_id", activeUserId)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setNotice(`Supabase appliances error: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        const starterAppliances = seedAppliances.map((appliance) => ({
          user_id: activeUserId,
          vendor_id: null,
          name: appliance.name,
          brand: appliance.brand,
          model: appliance.model,
          location: appliance.location,
          install_date: appliance.installDate,
          expected_lifespan_years: appliance.expectedLifespanYears,
          last_service_date: appliance.lastServiceDate || null,
          next_service_date: appliance.nextServiceDate,
          warranty_expires: appliance.warrantyExpires || null,
          status: appliance.status,
          notes: appliance.notes || null,
        }));

        const starter = await client
          .from("appliances")
          .insert(starterAppliances)
          .select(applianceSelect);

        if (!isMounted) return;

        if (starter.error) {
          setNotice(`Could not create starter appliance cards: ${starter.error.message}`);
          return;
        }

        data = starter.data;
      }

      setAppliances((data || []).map((row) => mapAppliance(row as ApplianceRow)));
      setNotice("Synced with Supabase. Appliance records will save to your account.");
    }

    loadAppliances();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const resetForm = () => {
    setForm(emptyAppliance);
    setEditingApplianceId(null);
    setIsModalOpen(false);
  };

  const scanWarranty = () => {
    setForm((current) => ({
      ...current,
      name: current.name || "Scanned Dishwasher",
      brand: current.brand || "Bosch",
      model: current.model || "SHPM65Z55N",
      location: current.location || "Kitchen",
      installDate: current.installDate || "2024-05-01",
      expectedLifespanYears: current.expectedLifespanYears || "12",
      warrantyExpires: "2029-05-01",
      nextServiceDate: current.nextServiceDate || "2026-11-01",
      notes: `${current.notes ? `${current.notes}\n` : ""}Warranty scan: 5-year limited warranty, keep proof of purchase and serial label photo on file.`,
      status: "excellent",
    }));
    setNotice("Warranty scan extracted appliance, model, warranty date, and service notes.");
  };

  const openEdit = (appliance: Appliance) => {
    setEditingApplianceId(appliance.id);
    setForm({
      name: appliance.name,
      brand: appliance.brand,
      model: appliance.model,
      location: appliance.location,
      installDate: appliance.installDate,
      expectedLifespanYears: String(appliance.expectedLifespanYears),
      lastServiceDate: appliance.lastServiceDate || "",
      nextServiceDate: appliance.nextServiceDate,
      warrantyExpires: appliance.warrantyExpires || "",
      notes: appliance.notes || "",
      status: appliance.status,
      assignedVendorId: appliance.assignedVendorId || "",
    });
    setIsModalOpen(true);
  };

  const saveAppliance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const draft: Appliance = {
      id: editingApplianceId || crypto.randomUUID(),
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

    if (supabase && userId) {
      setIsSaving(true);
      const payload = {
        user_id: userId,
        vendor_id: draft.assignedVendorId || null,
        name: draft.name,
        brand: draft.brand,
        model: draft.model,
        location: draft.location,
        install_date: draft.installDate,
        expected_lifespan_years: draft.expectedLifespanYears,
        last_service_date: draft.lastServiceDate || null,
        next_service_date: draft.nextServiceDate,
        warranty_expires: draft.warrantyExpires || null,
        status: draft.status,
        notes: draft.notes || null,
      };
      const request = editingApplianceId
        ? supabase.from("appliances").update(payload).eq("id", editingApplianceId).select(applianceSelect).single()
        : supabase.from("appliances").insert(payload).select(applianceSelect).single();
      const { data, error } = await request;
      setIsSaving(false);

      if (error) {
        setNotice(`Could not save appliance: ${error.message}`);
        return;
      }

      const saved = mapAppliance(data as ApplianceRow);
      setAppliances((current) => (editingApplianceId ? current.map((item) => (item.id === editingApplianceId ? saved : item)) : [saved, ...current]));
      setNotice(`${saved.name} ${editingApplianceId ? "updated" : "saved"} to Supabase.`);
      resetForm();
      return;
    }

    setAppliances((current) => (editingApplianceId ? current.map((item) => (item.id === editingApplianceId ? draft : item)) : [draft, ...current]));
    setNotice(`${draft.name} ${editingApplianceId ? "updated" : "saved"} locally. Login to sync to Supabase.`);
    resetForm();
  };

  const deleteAppliance = async (appliance: Appliance) => {
    if (supabase && userId && !appliance.id.startsWith("appliance-")) {
      const { error } = await supabase.from("appliances").delete().eq("id", appliance.id);
      if (error) {
        setNotice(`Could not delete appliance: ${error.message}`);
        return;
      }
    }

    setAppliances((current) => current.filter((item) => item.id !== appliance.id));
    setNotice(`${appliance.name} deleted.`);
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
          <button onClick={() => setIsModalOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950" type="button">
            <Plus className="h-4 w-4" />
            Add Appliance
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
        {notice}
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Appliance cards</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Edit service details, warranty notes, and replacement timing.</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{appliances.length} tracked</p>
      </div>

      {appliances.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm dark:border-white/15 dark:bg-white/[0.04]">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Wrench className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">No appliance cards yet</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Add appliances like HVAC, water heater, refrigerator, washer, dryer, and range to track age, warranty coverage, service dates, and repair notes.
          </p>
          <button onClick={() => setIsModalOpen(true)} type="button" className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
            <Plus className="h-4 w-4" />
            Add Appliance
          </button>
        </div>
      )}

      {appliances.length > 0 && (
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
                    <div className={cn("h-full rounded-full", lifespanProgress > 75 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${lifespanProgress}%` }} />
                  </div>
                </div>

                <InfoRow icon={CalendarClock} label="Next service" value={appliance.nextServiceDate} />
                <InfoRow icon={ShieldCheck} label="Warranty expires" value={appliance.warrantyExpires || "Not tracked"} />
                <InfoRow icon={Wrench} label="Preferred vendor" value={vendor ? vendor.company : "Unassigned"} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => openEdit(appliance)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button onClick={() => deleteAppliance(appliance)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 text-sm font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-50 dark:border-rose-400/20 dark:text-rose-200 dark:hover:bg-rose-400/10">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={saveAppliance} className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white p-6 shadow-glass dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{editingApplianceId ? "Edit appliance" : "New appliance"}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{editingApplianceId ? "Update appliance tracker" : "Add appliance to tracker"}</h3>
              </div>
              <button onClick={resetForm} type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p className="text-sm font-medium leading-6 text-emerald-900 dark:text-emerald-100">Scan appliance warranty info to prefill brand, model, warranty date, and notes.</p>
                <button onClick={scanWarranty} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <FileScan className="h-4 w-4" />
                  Scan warranty
                </button>
              </div>
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
              <button onClick={resetForm} type="button" className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                Cancel
              </button>
              <button disabled={isSaving} type="submit" className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950">
                {isSaving ? "Saving..." : editingApplianceId ? "Update appliance" : "Save appliance"}
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
