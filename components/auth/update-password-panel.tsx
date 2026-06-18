"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Home, LockKeyhole, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError, passwordPolicyMessage } from "@/lib/auth/security";

export function UpdatePasswordPanel() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Enter a new password for your Homey account.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const type = hash.get("type");

    if (!accessToken || !refreshToken) return;
    if (type && type !== "recovery") {
      setMessage("Open a valid password recovery link to update your password.");
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setMessage(friendlyAuthError(error.message));
          return;
        }

        window.history.replaceState(null, "", window.location.pathname);
        setMessage("Recovery verified. Enter a new Homey password.");
      });
  }, [supabase]);

  const updatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setMessage("Add cloud auth env keys to .env.local to update your password.");
      return;
    }

    const policyError = passwordPolicyMessage(password);
    if (policyError) {
      setMessage(policyError);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);
    if (error) {
      setMessage(friendlyAuthError(error.message));
      return;
    }

    setMessage("Password updated. Opening your Homey dashboard.");
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1fr_440px]">
        <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
          <Link href="/dashboard" className="inline-flex items-center gap-3 rounded-3xl bg-slate-950 p-3 pr-5 text-white dark:bg-white dark:text-slate-950">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
              <Home className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">Homey</span>
              <span className="text-xs opacity-60">Secure recovery</span>
            </span>
          </Link>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Password recovery</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Reset your Homey password.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 dark:text-slate-400">
            Use the recovery email to create a new password, then continue managing your home records.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Create new password</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            This page only works after opening a valid password recovery link.
          </p>

          <form onSubmit={updatePassword} className="mt-6 space-y-4">
            <Field label="New password">
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} className="input pl-10" placeholder="12+ chars, number, symbol" type="password" autoComplete="new-password" minLength={12} required />
              </div>
            </Field>
            <Field label="Confirm password">
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input pl-10" placeholder="Re-enter password" type="password" autoComplete="new-password" minLength={12} required />
              </div>
            </Field>

            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
              {message}
            </p>

            <button disabled={isSubmitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950" type="submit">
              {isSubmitting ? "Updating..." : "Update password"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <Link href="/login" className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
            Back to login
          </Link>
        </section>
      </div>
    </main>
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
