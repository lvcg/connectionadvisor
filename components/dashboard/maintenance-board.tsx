"use client";

import { useState } from "react";
import { Bell, CalendarDays, CalendarPlus, Mail, MessageSquareText, Plus, UsersRound, X } from "lucide-react";
import { maintenanceTasks, vendors } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import type { MaintenancePriority, MaintenanceStatus, MaintenanceTask, ReminderChannel } from "@/types/homey";

const priorityTone = {
  critical: "rose",
  recommended: "indigo",
  seasonal: "amber",
} as const;

const statusTone = {
  pending: "slate",
  overdue: "rose",
  completed: "emerald",
} as const;

const emptyTask = {
  title: "",
  area: "",
  cadence: "Every 3 months",
  dueDate: new Date().toISOString().slice(0, 10),
  reminderDate: "",
  reminderChannel: "email" as ReminderChannel,
  assignedVendorId: "",
  priority: "recommended" as MaintenancePriority,
  status: "pending" as MaintenanceStatus,
};

export function MaintenanceBoard() {
  const [tasks, setTasks] = useState(maintenanceTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyTask);
  const [notice, setNotice] = useState("Reminder delivery is ready for email, SMS, push, and calendar export.");

  const addTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.area.trim()) return;

    const nextTask: MaintenanceTask = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      area: form.area.trim(),
      cadence: form.cadence,
      dueDate: form.dueDate,
      reminderDate: form.reminderDate || undefined,
      reminderChannel: form.reminderChannel,
      assignedVendorId: form.assignedVendorId || undefined,
      priority: form.priority,
      status: form.status,
    };

    setTasks((current) => [nextTask, ...current]);
    setForm(emptyTask);
    setIsModalOpen(false);
    setNotice(`${nextTask.title} scheduled with ${nextTask.reminderChannel || "email"} reminder delivery.`);
  };

  const sendTestReminder = (task: MaintenanceTask) => {
    const channel = task.reminderChannel || "email";
    setNotice(`Prepared ${channel.toUpperCase()} reminder for "${task.title}". Connect provider keys in Settings to send automatically.`);
  };

  const downloadCalendarEvent = (task: MaintenanceTask) => {
    const start = task.dueDate.replaceAll("-", "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Homey//Maintenance//EN",
      "BEGIN:VEVENT",
      `UID:${task.id}@homey.local`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `SUMMARY:${task.title}`,
      `DESCRIPTION:${task.area} - ${task.cadence}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    link.download = `${task.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice(`Calendar file created for "${task.title}".`);
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Maintenance scheduler</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Recurring routines, reminders, and service contacts</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Schedule repairs, assign vendors, and set reminder channels before tasks become urgent.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Schedule Reminder
          </button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {tasks.map((task) => {
          const vendor = vendors.find((item) => item.id === task.assignedVendorId);

          return (
            <article key={task.id} className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05]">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <Badge tone={statusTone[task.status]}>{task.status}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{task.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {task.area} - {task.cadence}
              </p>
              <div className="mt-5 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Bell className="h-4 w-4" />
                    Reminder
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{task.reminderDate || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    {(task.reminderChannel || "email") === "sms" ? <MessageSquareText className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    Delivery
                  </span>
                  <span className="font-semibold uppercase text-slate-900 dark:text-white">{task.reminderChannel || "email"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <UsersRound className="h-4 w-4" />
                    Vendor
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{vendor?.company || "Unassigned"}</span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Due {task.dueDate}</span>
                <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => sendTestReminder(task)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                  <Bell className="h-4 w-4" />
                  Test
                </button>
                <button onClick={() => downloadCalendarEvent(task)} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
                  <CalendarPlus className="h-4 w-4" />
                  Calendar
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
        {notice}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={addTask} className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-white p-6 shadow-glass dark:border-white/10 dark:bg-slate-950">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">New reminder</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Schedule repair or maintenance</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Task title">
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="input" placeholder="Service HVAC system" />
              </Field>
              <Field label="Area">
                <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} className="input" placeholder="Mechanical, Kitchen, Exterior" />
              </Field>
              <Field label="Cadence">
                <select value={form.cadence} onChange={(event) => setForm({ ...form, cadence: event.target.value })} className="input">
                  <option>One-time repair</option>
                  <option>Monthly</option>
                  <option>Every 3 months</option>
                  <option>Every 6 months</option>
                  <option>Annually</option>
                </select>
              </Field>
              <Field label="Assigned vendor">
                <select value={form.assignedVendorId} onChange={(event) => setForm({ ...form, assignedVendorId: event.target.value })} className="input">
                  <option value="">Unassigned</option>
                  {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.company}</option>)}
                </select>
              </Field>
              <Field label="Due date">
                <input value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Reminder date">
                <input value={form.reminderDate} onChange={(event) => setForm({ ...form, reminderDate: event.target.value })} className="input" type="date" />
              </Field>
              <Field label="Reminder channel">
                <select value={form.reminderChannel} onChange={(event) => setForm({ ...form, reminderChannel: event.target.value as ReminderChannel })} className="input">
                  <option value="email">Email</option>
                  <option value="push">Push</option>
                  <option value="sms">SMS</option>
                </select>
              </Field>
              <Field label="Priority">
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as MaintenancePriority })} className="input">
                  <option value="recommended">Recommended</option>
                  <option value="critical">Critical</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} type="button" className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
                Save reminder
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
