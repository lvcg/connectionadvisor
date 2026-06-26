"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Chrome, Home, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError, isValidEmail, passwordPolicyMessage, safeNextPath, sanitizeEmail } from "@/lib/auth/security";

type AuthMode = "login" | "signup";

export function LoginPanel() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Sign in to sync expenses, vendors, reminders, and receipt records.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error === "auth_callback") {
      setMessage("Google sign-in could not be completed. Check that Google is enabled in Supabase and the callback URL is allowed.");
    }

    if (params.get("account") === "deleted") {
      setMessage("Your DomiVault account has been deleted.");
    }
  }, []);

  const getNextPath = () => {
    if (typeof window === "undefined") return "/dashboard";
    return safeNextPath(new URLSearchParams(window.location.search).get("next"));
  };

  const getRedirectUrl = () => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(getNextPath())}`;
  };

  const getPasswordRecoveryUrl = () => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/callback?next=/auth/update-password`;
  };

  const submitAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setMessage("Add cloud auth env keys to .env.local to enable auth.");
      return;
    }

    const cleanEmail = sanitizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      setMessage("Enter a valid email address.");
      return;
    }

    if (mode === "signup") {
      const policyError = passwordPolicyMessage(password);
      if (policyError) {
        setMessage(policyError);
        return;
      }
    }

    if (mode === "login" && password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email: cleanEmail, password })
        : await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              emailRedirectTo: getRedirectUrl(),
              data: { full_name: name.trim() || cleanEmail.split("@")[0] },
            },
          });

    setIsSubmitting(false);

    if (result.error) {
      setMessage(friendlyAuthError(result.error.message));
      return;
    }

    if (mode === "login") {
      setMessage("Signed in. Opening your DomiVault dashboard.");
      router.replace(getNextPath());
      router.refresh();
      return;
    }

    setMessage("Signup created. Check your email if confirmation is enabled.");
  };

  const sendMagicLink = async () => {
    const cleanEmail = sanitizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      setMessage("Enter your email first, then send a magic login link.");
      return;
    }

    if (!supabase) {
      setMessage("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to enable magic links.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });
    setIsSubmitting(false);
    setMessage(error ? friendlyAuthError(error.message) : "If that email can sign in, a magic link is on the way.");
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      setMessage("Add cloud auth env keys and enable the provider in your auth settings first.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Opening Google sign-in.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl(),
        scopes: "openid email profile",
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setIsSubmitting(false);
      setMessage(friendlyAuthError(error.message));
    }
  };

  const sendPasswordRecovery = async () => {
    const cleanEmail = sanitizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      setMessage("Enter your email first, then request a password reset.");
      return;
    }

    if (!supabase) {
      setMessage("Add cloud auth env keys to .env.local to enable password recovery.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: getPasswordRecoveryUrl(),
    });
    setIsSubmitting(false);
    setMessage(error ? friendlyAuthError(error.message) : "If that email has an account, a password reset link is on the way.");
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1fr_480px]">
        <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
          <Link href="/dashboard" className="inline-flex items-center gap-3 rounded-3xl bg-slate-950 p-3 pr-5 text-white dark:bg-white dark:text-slate-950">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
              <Home className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">DomiVault</span>
              <span className="text-xs opacity-60">Home and vehicle vault</span>
            </span>
          </Link>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Private home command center</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Login or create an account to keep your home records synced.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 dark:text-slate-400">
            Manage improvement costs, recurring bills, appliances, preferred vendors, service history, and reminders from one polished dashboard.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Expenses", "Vendors", "Reminders"].map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-white/10">
            <button
              onClick={() => setMode("login")}
              className={`h-11 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === "login" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-300"}`}
              type="button"
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`h-11 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === "signup" ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-300"}`}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submitAuth} className="space-y-4">
            {mode === "signup" && (
              <Field label="Full name">
                <input value={name} onChange={(event) => setName(event.target.value)} className="input" placeholder="Your name" />
              </Field>
            )}
            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="input pl-10" placeholder="you@example.com" type="email" autoComplete="email" required />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} className="input pl-10" placeholder={mode === "signup" ? "12+ chars, number, symbol" : "Your password"} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "signup" ? 12 : 8} required />
              </div>
            </Field>

            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
              {message}
            </p>

            <button disabled={isSubmitting} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950" type="submit">
              {isSubmitting ? "Working..." : mode === "login" ? "Login" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {mode === "login" && (
            <button
              onClick={sendPasswordRecovery}
              disabled={isSubmitting}
              className="mt-3 w-full rounded-2xl px-4 py-2 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-300 dark:hover:bg-emerald-400/10"
              type="button"
            >
              Forgot password?
            </button>
          )}

          <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            Easier sign in
            <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <div className="grid gap-3">
            <button
              onClick={sendMagicLink}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              type="button"
            >
              <Mail className="h-4 w-4" />
              Send magic link
            </button>
            <div className="grid gap-3">
              <button
                onClick={signInWithGoogle}
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                type="button"
              >
                <Chrome className="h-4 w-4" />
                {isSubmitting ? "Opening Google..." : "Continue with Google"}
              </button>
            </div>
          </div>
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
