"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Home, Mail, Moon, Save, Sparkles, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PlanTier, ReminderChannel } from "@/types/homey";
import { formatTimestamp } from "@/lib/utils";
import { createRevenueCatPurchaseUrl, hasRevenueCatPurchaseLink } from "@/lib/revenuecat";

type SettingsState = {
  username: string;
  homeName: string;
  address: string;
  email: string;
  reminderChannel: ReminderChannel;
  calendarSync: boolean;
  receiptScan: boolean;
  darkMode: boolean;
  planTier: PlanTier;
};

type ProfileRow = {
  full_name?: string | null;
  home_name?: string | null;
  home_address?: string | null;
  home_type?: string | null;
  notification_email?: string | null;
  reminder_channel?: ReminderChannel | null;
  calendar_sync?: boolean | null;
  receipt_scan?: boolean | null;
  dark_mode?: boolean | null;
  plan_tier?: PlanTier | null;
  settings_saved_at?: string | null;
  updated_at?: string | null;
};

const defaultSettings: SettingsState = {
  username: "",
  homeName: "",
  address: "",
  email: "",
  reminderChannel: "email",
  calendarSync: true,
  receiptScan: true,
  darkMode: false,
  planTier: "free",
};

function applyTheme(darkMode: boolean) {
  document.documentElement.classList.toggle("dark", darkMode);
  document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  window.dispatchEvent(new CustomEvent("homey-theme-changed", { detail: { darkMode } }));
}

function saveLocalSettings(settings: SettingsState, savedAt?: string) {
  localStorage.setItem("homey-settings", JSON.stringify({ ...settings, savedAt }));
}

export function SettingsPanel() {
  const supabase = useMemo(() => createClient(), []);
  const revenueCatReady = hasRevenueCatPurchaseLink();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [message, setMessage] = useState("Login to sync settings to your secure account.");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const updateSetting = <Key extends keyof SettingsState>(key: Key, value: SettingsState[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const localSettings = localStorage.getItem("homey-settings");
    if (localSettings) {
      const parsedSettings = JSON.parse(localSettings);
      setSettings((current) => ({ ...current, ...parsedSettings }));
      setLastSavedAt(parsedSettings.savedAt || null);
      applyTheme(Boolean(parsedSettings.darkMode));
    }

    if (!supabase) {
      setMessage("Add cloud sync env keys to sync settings.");
      return;
    }

    const client = supabase;

    async function loadProfile() {
      const { data: sessionData } = await client.auth.getSession();
      const activeUser = sessionData.session?.user;

      if (!activeUser) {
        setMessage("Local settings mode. Login to sync settings to your secure account.");
        return;
      }

      setUserId(activeUser.id);
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (error) {
        setMessage(`Could not load profile: ${error.message}`);
        return;
      }

      const profile = (data || {}) as ProfileRow;
      setSettings((current) => {
        const nextSettings = {
          ...current,
          homeName: profile.home_name || current.homeName,
          address: profile.home_address || current.address,
          username: profile.full_name && !profile.full_name.includes("@") ? profile.full_name : current.username,
          email: profile.notification_email || activeUser.email || current.email,
          reminderChannel: profile.reminder_channel || current.reminderChannel,
          calendarSync: typeof profile.calendar_sync === "boolean" ? profile.calendar_sync : current.calendarSync,
          receiptScan: typeof profile.receipt_scan === "boolean" ? profile.receipt_scan : current.receiptScan,
          darkMode: typeof profile.dark_mode === "boolean" ? profile.dark_mode : current.darkMode,
          planTier: profile.plan_tier || current.planTier,
        };
        applyTheme(nextSettings.darkMode);
        saveLocalSettings(nextSettings, profile.settings_saved_at || profile.updated_at || undefined);
        return nextSettings;
      });
      const loadedAt = profile.settings_saved_at || profile.updated_at || null;
      setLastSavedAt(loadedAt);
      setLastLoadedAt(new Date().toISOString());
      setMessage(`Settings loaded from your profile at ${formatTimestamp(new Date().toISOString())}.`);
    }

    loadProfile();
  }, [supabase]);

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const savedAt = new Date().toISOString();
    saveLocalSettings(settings, savedAt);
    window.dispatchEvent(new CustomEvent("homey-settings-saved", { detail: { ...settings, savedAt } }));
    applyTheme(settings.darkMode);

    if (!supabase || !userId) {
      setLastSavedAt(savedAt);
      setMessage(`Settings saved locally at ${formatTimestamp(savedAt)}. Login to sync them to your secure account.`);
      return;
    }

    const fullProfilePayload = {
      id: userId,
      home_name: settings.homeName,
      home_address: settings.address,
      home_type: "single_family",
      full_name: settings.username,
      notification_email: settings.email,
      reminder_channel: settings.reminderChannel,
      calendar_sync: settings.calendarSync,
      receipt_scan: settings.receiptScan,
      dark_mode: settings.darkMode,
      settings_saved_at: savedAt,
    };
    const coreProfilePayload = {
      id: userId,
      home_name: settings.homeName,
      home_address: settings.address,
      home_type: "single_family",
      full_name: settings.username,
    };

    setIsSaving(true);
    let { error } = await supabase.from("profiles").upsert(fullProfilePayload);

    if (error && (error.message.includes("schema cache") || error.message.includes("column"))) {
      const retry = await supabase.from("profiles").upsert(coreProfilePayload);
      error = retry.error;

      if (!error) {
        setIsSaving(false);
        setLastSavedAt(savedAt);
        setMessage(`Username and basic profile saved at ${formatTimestamp(savedAt)}. Optional settings need the latest Supabase schema before they can sync.`);
        return;
      }
    }

    setIsSaving(false);

    if (error) {
      setMessage(`Could not save profile: ${error.message}. Run the latest database schema if the new profile settings columns are missing.`);
      return;
    }

    setLastSavedAt(savedAt);
    setMessage(`Settings backed up to your profile at ${formatTimestamp(savedAt)}.`);
  };

  const deleteAccount = async () => {
    if (deleteConfirmation.trim() !== "DELETE") {
      setMessage("Type DELETE to confirm account deletion.");
      return;
    }

    setIsDeleting(true);
    const response = await fetch("/api/account", { method: "DELETE" });
    const payload = await response.json().catch(() => ({ message: "Could not delete account." }));
    setIsDeleting(false);

    if (!response.ok) {
      setMessage(payload.message || "Could not delete account.");
      return;
    }

    localStorage.removeItem("homey-settings");
    await supabase?.auth.signOut();
    window.location.href = "/login?account=deleted";
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
            <Field label="Username">
              <input value={settings.username} onChange={(event) => updateSetting("username", event.target.value)} className="input" placeholder="username" />
            </Field>
            <Field label="Home name">
              <input value={settings.homeName} onChange={(event) => updateSetting("homeName", event.target.value)} className="input" />
            </Field>
            <Field label="Notification email">
              <input value={settings.email} onChange={(event) => updateSetting("email", event.target.value)} className="input" type="email" />
            </Field>
            <Field label="Address">
              <input value={settings.address} onChange={(event) => updateSetting("address", event.target.value)} className="input md:col-span-2" />
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Control how DomiVault prepares reminders.</p>
            </div>
          </div>

          <div className="grid gap-4">
            <Field label="Default reminder channel">
              <select value={settings.reminderChannel} onChange={(event) => updateSetting("reminderChannel", event.target.value as ReminderChannel)} className="input">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
            </Field>
            <Toggle icon={CalendarDays} label="Calendar sync" checked={settings.calendarSync} onChange={(checked) => updateSetting("calendarSync", checked)} />
            <Toggle icon={Mail} label="Receipt scan suggestions" checked={settings.receiptScan} onChange={(checked) => updateSetting("receiptScan", checked)} />
            <Toggle icon={Moon} label="Dark mode" checked={settings.darkMode} onChange={(checked) => {
              const nextSettings = { ...settings, darkMode: checked };
              setSettings(nextSettings);
              saveLocalSettings(nextSettings, lastSavedAt || undefined);
              applyTheme(checked);
            }} />
          </div>
        </div>

        <div className="xl:col-span-2 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
          {message}
        </div>

        <div id="plan" className="xl:col-span-2 rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Plan</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{settings.planTier === "free" ? "DomiVault Free" : "DomiVault Plus"}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Free includes core home records. Plus unlocks warranty tracking, receipt storage, maintenance history, Google Calendar sync, vehicle repair records, expiration alerts, and export reports. Plan changes are controlled by RevenueCat billing and are not editable from profile settings.
          </p>
          {!revenueCatReady && (
            <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-50">
              Add <span className="font-semibold">NEXT_PUBLIC_REVENUECAT_PURCHASE_LINK</span> to your hosting environment after creating the RevenueCat Web Purchase Link.
            </p>
          )}
          <a
            href={createRevenueCatPurchaseUrl({ appUserId: userId, email: settings.email })}
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade with RevenueCat
          </a>
        </div>

        <div className="xl:col-span-2 grid gap-3 rounded-3xl border border-slate-200/70 bg-white/85 p-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/[0.05] md:grid-cols-2">
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">Last profile backup</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{formatTimestamp(lastSavedAt)}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">Last settings load</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{formatTimestamp(lastLoadedAt)}</p>
          </div>
        </div>

        <div className="xl:col-span-2 flex justify-end">
          <button disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950" type="submit">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>

      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm dark:border-rose-400/20 dark:bg-rose-400/10">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-700 dark:text-rose-200">Danger zone</p>
            <h3 className="mt-2 text-xl font-semibold text-rose-950 dark:text-white">Delete my account</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-900/80 dark:text-rose-50/85">
              This permanently deletes your DomiVault account and account-owned records. This action requires server-side account deletion to be configured with Supabase.
            </p>
          </div>
          <div className="grid w-full gap-3 lg:w-80">
            <label className="grid gap-2 text-sm font-semibold text-rose-900 dark:text-rose-50">
              Type DELETE to confirm
              <input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="input" placeholder="DELETE" />
            </label>
            <button
              disabled={isDeleting || deleteConfirmation.trim() !== "DELETE"}
              onClick={deleteAccount}
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete my account"}
            </button>
          </div>
        </div>
      </section>
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
