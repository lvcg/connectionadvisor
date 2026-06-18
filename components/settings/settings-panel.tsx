"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Home, Mail, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SettingsPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [settings, setSettings] = useState({
    homeName: "QA Test Home",
    address: "100 Test Lane",
    email: "flowfxdesignsonline@gmail.com",
    reminderChannel: "email",
    calendarSync: true,
    receiptScan: true,
  });
  const [message, setMessage] = useState("Login to sync settings to Supabase.");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const localSettings = localStorage.getItem("homey-settings");
    if (localSettings) {
      setSettings((current) => ({ ...current, ...JSON.parse(localSettings) }));
    }

    if (!supabase) {
      setMessage("Add Supabase env keys to sync settings.");
      return;
    }

    const client = supabase;

    async function loadProfile() {
      const { data: sessionData } = await client.auth.getSession();
      const activeUser = sessionData.session?.user;

      if (!activeUser) {
        setMessage("Local settings mode. Login to sync settings to Supabase.");
        return;
      }

      setUserId(activeUser.id);
      const { data, error } = await client
        .from("profiles")
        .select("full_name,home_name,home_address,home_type")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (error) {
        setMessage(`Could not load profile: ${error.message}`);
        return;
      }

      setSettings((current) => ({
        ...current,
        homeName: data?.home_name || current.homeName,
        address: data?.home_address || current.address,
        email: activeUser.email || current.email,
      }));
      setMessage("Settings connected to Supabase profile.");
    }

    loadProfile();
  }, [supabase]);

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem("homey-settings", JSON.stringify(settings));

    if (!supabase || !userId) {
      setMessage("Settings saved locally. Login to sync them to Supabase.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      home_name: settings.homeName,
      home_address: settings.address,
      home_type: "single_family",
      full_name: settings.email,
    });
    setIsSaving(false);

    setMessage(error ? `Could not save profile: ${error.message}` : "Settings saved to Supabase profile.");
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Workspace settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Home profile, reminders, and integrations</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Configure the default home profile, reminder delivery, receipt scanning, and calendar sync behavior.
        </p>
      </div>

      <form onSubmit={saveSettings} className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Home profile</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Used for reports, reminders, and records.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Home name">
              <input value={settings.homeName} onChange={(event) => setSettings({ ...settings, homeName: event.target.value })} className="input" />
            </Field>
            <Field label="Notification email">
              <input value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} className="input" type="email" />
            </Field>
            <Field label="Address">
              <input value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} className="input md:col-span-2" />
            </Field>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500 p-3 text-white">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Automation defaults</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Control how Homey prepares reminders.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <Field label="Default reminder channel">
              <select value={settings.reminderChannel} onChange={(event) => setSettings({ ...settings, reminderChannel: event.target.value })} className="input">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
            </Field>
            <Toggle icon={CalendarDays} label="Calendar sync" checked={settings.calendarSync} onChange={(checked) => setSettings({ ...settings, calendarSync: checked })} />
            <Toggle icon={Mail} label="Receipt scan suggestions" checked={settings.receiptScan} onChange={(checked) => setSettings({ ...settings, receiptScan: checked })} />
          </div>
        </div>

        <div className="xl:col-span-2 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
          {message}
        </div>

        <div className="xl:col-span-2 flex justify-end">
          <button disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950" type="submit">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
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

function Toggle({ icon: Icon, label, checked, onChange }: { icon: typeof Bell; label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
      <span className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
        {label}
      </span>
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" type="checkbox" />
    </label>
  );
}
