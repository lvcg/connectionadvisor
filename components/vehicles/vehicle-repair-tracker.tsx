"use client";

import { CalendarClock, Car, Download, Gauge, Plus, Wrench, type LucideIcon } from "lucide-react";
import { vehicles } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { PremiumLock } from "@/components/ui/premium-lock";
import { DocumentUploadCard } from "@/components/ui/document-upload-card";

const statusTone = {
  excellent: "emerald",
  monitor: "amber",
  "service-soon": "rose",
  repair: "rose",
} as const;

export function VehicleRepairTracker() {
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
          <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      <PremiumLock title="Vehicle repair records" description="Vehicle repair tracking is included with DomiVault Plus. Free accounts can preview the vault structure before upgrading." />

      <div className="grid gap-4 xl:grid-cols-2">
        {vehicles.map((vehicle) => (
          <article key={vehicle.id} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
                <Car className="h-5 w-5" />
              </div>
              <Badge tone={statusTone[vehicle.status]}>{vehicle.status.replace("-", " ")}</Badge>
            </div>
            <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{vehicle.name}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{vehicle.year} {vehicle.make} {vehicle.model}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{vehicle.notes}</p>

            <div className="mt-5 grid gap-2 text-sm">
              <Info icon={Gauge} label="Mileage" value={`${vehicle.mileage.toLocaleString()} mi`} />
              <Info icon={CalendarClock} label="Next service" value={vehicle.nextServiceDate} />
              <Info icon={Wrench} label="Last service" value={vehicle.lastServiceDate || "Not tracked"} />
            </div>

            <div className="mt-5">
              <DocumentUploadCard locked title="Vehicle repair documents" description="Upload repair receipts, registration files, insurance cards, inspection photos, and warranty documents." type="vehicle" />
            </div>

            <button type="button" className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">
              <Download className="h-4 w-4" />
              Export vehicle report
            </button>
          </article>
        ))}
      </div>
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
