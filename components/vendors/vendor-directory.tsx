"use client";

import { useState } from "react";
import { Mail, MapPin, Pencil, Phone, Plus, Star, Trash2, Wrench, X, type LucideIcon } from "lucide-react";
import { vendors as seedVendors } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import type { Vendor, VendorType } from "@/types/homey";
import { formatTimestamp } from "@/lib/utils";

const vendorTone = {
  plumbing: "indigo",
  electrical: "amber",
  hvac: "emerald",
  roofing: "rose",
  landscaping: "emerald",
  general: "slate",
  appliance: "indigo",
  cleaning: "slate",
} as const;

const vendorTypes: VendorType[] = ["plumbing", "electrical", "hvac", "roofing", "landscaping", "general", "appliance", "cleaning"];

const emptyVendor = {
  company: "",
  name: "",
  type: "general" as VendorType,
  phone: "",
  email: "",
  address: "",
  rating: "5",
  preferred: false,
  notes: "",
};

export function VendorDirectory() {
  const [vendors, setVendors] = useState(seedVendors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyVendor);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("Vendor records are ready for repair scheduling and reminders.");

  const resetForm = () => {
    setForm(emptyVendor);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openAdd = () => {
    setForm(emptyVendor);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (vendor: Vendor) => {
    setForm({
      company: vendor.company,
      name: vendor.name,
      type: vendor.type,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      rating: String(vendor.rating),
      preferred: vendor.preferred,
      notes: vendor.notes,
    });
    setEditingId(vendor.id);
    setIsModalOpen(true);
  };

  const saveVendor = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.company.trim() || !form.name.trim()) return;

    const nextVendor: Vendor = {
      id: editingId || crypto.randomUUID(),
      company: form.company.trim(),
      name: form.name.trim(),
      type: form.type,
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      rating: Number(form.rating) || 5,
      preferred: form.preferred,
      notes: form.notes.trim(),
    };

    setVendors((current) => editingId ? current.map((vendor) => vendor.id === editingId ? nextVendor : vendor) : [nextVendor, ...current]);
    setNotice(`${nextVendor.company} ${editingId ? "updated" : "saved"} at ${formatTimestamp(new Date().toISOString())}. Form cleared.`);
    resetForm();
  };

  const deleteVendor = (vendor: Vendor) => {
    setVendors((current) => current.filter((item) => item.id !== vendor.id));
    setNotice(`${vendor.company} deleted from the vendor address book.`);
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Vendor address book</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Preferred contractors and service contacts</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Keep plumbers, HVAC techs, roofers, appliance repair, and trusted home service pros organized for quick repair scheduling.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Vendor
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
        {notice}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {vendors.map((vendor) => (
          <article key={vendor.id} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge tone={vendorTone[vendor.type]}>{vendor.type}</Badge>
                  {vendor.preferred && <Badge tone="emerald">preferred</Badge>}
                </div>
                <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{vendor.company}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{vendor.name}</p>
              </div>
              <div className="flex flex-wrap items-start justify-end gap-2">
                <div className="inline-flex items-center gap-1 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
                  <Star className="h-4 w-4 fill-current" />
                  {vendor.rating}
                </div>
                <button onClick={() => openEdit(vendor)} type="button" className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10" aria-label={`Edit ${vendor.company}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteVendor(vendor)} type="button" className="rounded-xl border border-rose-200 p-2 text-rose-600 transition-all duration-200 hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10" aria-label={`Delete ${vendor.company}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              <ContactRow icon={Phone} value={vendor.phone} />
              <ContactRow icon={Mail} value={vendor.email} />
              <ContactRow icon={MapPin} value={vendor.address} />
              <ContactRow icon={Wrench} value={vendor.notes} />
            </div>
          </article>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={saveVendor} className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white p-6 shadow-glass dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{editingId ? "Edit contact" : "New contact"}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{editingId ? "Update vendor contact" : "Add vendor to address book"}</h3>
              </div>
              <button onClick={resetForm} type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company">
                <input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="input" placeholder="Brightline HVAC" />
              </Field>
              <Field label="Contact name">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input" placeholder="Taylor Morgan" />
              </Field>
              <Field label="Type">
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as VendorType })} className="input">
                  {vendorTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </Field>
              <Field label="Rating">
                <input value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} className="input" inputMode="decimal" placeholder="4.8" />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="input" placeholder="(555) 000-0000" />
              </Field>
              <Field label="Email">
                <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="input" placeholder="service@example.com" type="email" />
              </Field>
              <Field label="Address">
                <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="input" placeholder="Street, city, state" />
              </Field>
              <Field label="Notes">
                <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="input" placeholder="Best for annual service plans" />
              </Field>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm font-medium dark:border-white/10">
              <input
                checked={form.preferred}
                onChange={(event) => setForm({ ...form, preferred: event.target.checked })}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600"
              />
              Mark as preferred vendor
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetForm} type="button" className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
                {editingId ? "Save changes" : "Save vendor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function ContactRow({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
      <span className="leading-6">{value}</span>
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
