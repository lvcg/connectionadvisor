"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, ClipboardList, Gauge, Home, LogIn, Refrigerator, ReceiptText, Settings, ShieldCheck, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTimestamp } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Project Planner", href: "/projects", icon: ClipboardList },
  { label: "Expenses", href: "/expenses", icon: ReceiptText },
  { label: "Maintenance", href: "/maintenance", icon: CalendarCheck },
  { label: "Appliances", href: "/appliances", icon: Refrigerator },
  { label: "Vendors", href: "/vendors", icon: UsersRound },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Login / Signup", href: "/login", icon: LogIn },
];

function formatUsername(nameOrEmail?: string | null) {
  if (!nameOrEmail) return "there";
  const cleaned = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
  const username = cleaned.trim().replace(/[._-]+/g, " ");
  return username ? username.charAt(0).toUpperCase() + username.slice(1) : "there";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [username, setUsername] = useState("Flowfxdesignsonline");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const localSettings = localStorage.getItem("homey-settings");
    if (localSettings) {
      const parsed = JSON.parse(localSettings);
      setUsername(formatUsername(parsed.username || parsed.fullName || parsed.email));
      setLastSavedAt(parsed.savedAt || null);
    }

    const handleSettingsSaved = (event: Event) => {
      const detail = (event as CustomEvent<{ username?: string; email?: string; savedAt?: string }>).detail;
      setUsername(formatUsername(detail?.username || detail?.email));
      setLastSavedAt(detail?.savedAt || new Date().toISOString());
    };

    window.addEventListener("homey-settings-saved", handleSettingsSaved);

    if (!supabase) {
      return () => window.removeEventListener("homey-settings-saved", handleSettingsSaved);
    }

    const client = supabase;
    let isMounted = true;

    async function loadProfile() {
      const { data: sessionData } = await client.auth.getSession();
      const activeUser = sessionData.session?.user;
      if (!activeUser || !isMounted) return;

      const { data } = await client
        .from("profiles")
        .select("full_name,notification_email,settings_saved_at,updated_at")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (!isMounted) return;

      const profile = data as { full_name?: string | null; notification_email?: string | null; settings_saved_at?: string | null; updated_at?: string | null } | null;
      const displaySource = profile?.full_name || activeUser.user_metadata?.username || activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || profile?.notification_email || activeUser.email;
      setUsername(formatUsername(displaySource));
      setLastSavedAt(profile?.settings_saved_at || profile?.updated_at || null);
    }

    loadProfile();

    return () => {
      isMounted = false;
      window.removeEventListener("homey-settings-saved", handleSettingsSaved);
    };
  }, [supabase]);

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-3xl bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
              <Home className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">Homey</span>
              <span className="text-xs text-white/60 dark:text-slate-500">Home intelligence</span>
            </span>
          </Link>

          <nav className="mt-6 grid gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-950 hover:text-white dark:text-slate-300 dark:hover:bg-white dark:hover:text-slate-950"
              >
                <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-emerald-200/80 bg-emerald-50/80 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="font-semibold">Private by design</p>
            <p className="mt-1 leading-6 opacity-80">Secure account rules keep every home, project, bill, and receipt scoped to its owner.</p>
          </div>
        </aside>

        <main className="min-w-0 rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
          <header className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200/70 pb-6 dark:border-white/10 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Home command center</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Welcome back, {username}.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Stay ahead of your home's costs, upkeep, and next priorities.
                <span className="mt-1 block font-medium text-slate-700 dark:text-slate-300">Last saved: {formatTimestamp(lastSavedAt)}</span>
              </p>
            </div>
            <Link href="/settings" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
