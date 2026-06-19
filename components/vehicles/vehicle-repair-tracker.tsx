"use client";

import { useState } from "react";
import { CalendarClock, Car, Download, Gauge, Pencil, Plus, Trash2, Wrench, X, type LucideIcon } from "lucide-react";
import { vehicles as seedVehicles } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { PremiumLock } from "@/components/ui/premium-lock";
import { DocumentUploadCard } from "@/components/ui/document-upload-card";
import type { Vehicle, VehicleStatus } from "@/types/homey";

const statusTone = {
  excellent: "emerald",
  monitor: "amber",
  "service-soon": "rose",
  repair: "rose",
} as const;

const vehicleStatuses: VehicleStatus[] = ["excellent", "monitor", "service-soon", "repair"];

const emptyVehicle = {
  name: "",
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  mileage: "",
  vin: "",
  lastServiceDate: "",
  nextServiceDate: "",
  notes: "",
  status: "monitor" as VehicleStatus,
};

type VehicleFormState = typeof emptyVehicle;

function vehicleToForm(vehicle: Vehicle): VehicleFormState {
  return {
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    year: String(vehicle.year),
    mileage: String(vehicle.mileage),
    vin: vehicle.vin || "",
    lastServiceDate: vehicle.lastServiceDate || "",
    nextServiceDate: vehicle.nextServiceDate,
    notes: vehicle.notes || "",
    status: vehicle.status,
  };
}

export function VehicleRepairTracker() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [form, setForm] = useState<VehicleFormState>(emptyVehicle);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState("Vehicle records are ready for reminders, service dates, and repair history.");

  const resetForm = () => {
    setForm(emptyVehicle);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openAdd = () => {
    setForm(emptyVehicle);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setForm(vehicleToForm(vehicle));
    setEditingId(vehicle.id);
    setIsModalOpen(true);
  };

  const saveVehicle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.make.trim() || !form.model.trim()) return;

    const nextVehicle: Vehicle = {
      id: editingId || crypto.randomUUID(),
      name: form.name.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      mileage: Number(form.mileage) || 0,
      vin: form.vin.trim() || undefined,
      lastServiceDate: form.lastServiceDate || undefined,
      nextServiceDate: form.nextServiceDate,
      notes: form.notes.trim(),
      status: form.status,
    };

    setVehicles((current) => editingId ? current.map((vehicle) => vehicle.id === editingId ? nextVehicle : vehicle) : [nextVehicle, ...current]);
    setNotice(`${nextVehicle.name} ${editingId ? "updated" : "saved"}.`);
    resetForm();
  };

  const deleteVehicle = (vehicle: Vehicle) => {
    setVehicles((current) => current.filter((item) => item.id !== vehicle.id));
    setNotice(`${vehicle.name} deleted from the vehicle vault.`);
  };

  const exportVehicle = (vehicle: Vehicle) => {
    const csv = [
      ["Name", "Year", "Make", "Model", "Mileage", "Last Service", "Next Service", "Status", "Notes"],
      [vehicle.name, vehicle.year, vehicle.make, vehicle.model, vehicle.mileage, vehicle.lastServiceDate || "", vehicle.nextServiceDate, vehicle.status, vehicle.notes || ""],
    ].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${vehicle.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-vehicle-report.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Vehicle repair vault</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Car repairs, reminders, documents, and service history</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Track mileage, service dates, repair receipts, warranty notes, registration reminders, and exportable vehicle records.
            </p>
          </div>
          <button onClick={openAdd} type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      <PremiumLock title="Vehicle repair records" description="Vehicle repair tracking is included with DomiVault Plus. Free accounts can preview the vault structure before upgrading." />

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
        {notice}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {vehicles.map((vehicle) => (
          <article key={vehicle.id} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
                <Car className="h-5 w-5" />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge tone={statusTone[vehicle.status]}>{vehicle.status.replace("-", " ")}</Badge>
                <button onClick={() => openEdit(vehicle)} type="button" className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10" aria-label={`Edit ${vehicle.name}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteVehicle(vehicle)} type="button" className="rounded-xl border border-rose-200 p-2 text-rose-600 transition-all duration-200 hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10" aria-label={`Delete ${vehicle.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{vehicle.name}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{vehicle.year} {vehicle.make} {vehicle.model}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{vehicle.notes}</p>

            <div className="mt-5 grid gap-2 text-sm">
              <Info icon={Gauge} label="Mileage" value={`${vehicle.mileage.toLocaleString()} mi`} />
              <Info icon={CalendarClock} label="Next service" value={vehicle.nextServiceDate || "Not scheduled"} />
              <Info icon={Wrench} label="Last service" value={vehicle.lastServiceDate || "Not tracked"} />
            </div>

            <div className="mt-5">
              <DocumentUploadCard title="Vehicle repair documents" description="Upload repair receipts, registration files, insurance cards, inspection photos, and warranty documents." type="vehicle" linkedId={vehicle.id} />
            </div>

            <button onClick={() => exportVehicle(vehicle)} type="button" className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
              <Download className="h-4 w-4" />
              Export vehicle report
            </button>
          </article>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={saveVehicle} className="w-full max-w-3xl rounded-[2rem] border border-white/60 bg-white p-6 shadow-glass dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{editingId ? "Edit vehicle" : "New vehicle"}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{editingId ? "Update vehicle record" : "Add vehicle to vault"}</h3>
              </div>
              <button onClick={resetForm} type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Vehicle name">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input" placeholder="Family SUV" />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as VehicleStatus })} className="input">
                  {vehicleStatuses.map((status) => <option key={status} value={status}>{status.replace("-", " ")}</option>)}
                </select>
              </Field>
              <Field label="Make">
                <input value={form.make} onChange={(event) => setForm({ ...form, make: event.target.value })} className="input" placeholder="Toyota" />
              </Field>
              <Field label="Model">
                <input value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} className="input" placeholder="RAV4" />
              </Field>
              <Field label="Year">
                <input value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} className="input" inputMode="numeric" />
              </Field>
              <Field label="Mileage">
                <input value={form.mileage} onChange={(event) => setForm({ ...form, mileage: event.target.value })} className="input" inputMode="numeric" />
              </Field>
              <Field label="Last service date">
                <input value={form.lastServiceDate} onChange={(event) => setForm({ ...form, lastServiceDate: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Next service date">
                <input value={form.nextServiceDate} onChange={(event) => setForm({ ...form, nextServiceDate: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="VIN">
                <input value={form.vin} onChange={(event) => setForm({ ...form, vin: event.target.value })} className="input" />
              </Field>
              <Field label="Notes">
                <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="input" placeholder="Warranty, repair, or reminder notes" />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetForm} type="button" className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
                {editingId ? "Save changes" : "Save vehicle"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
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
