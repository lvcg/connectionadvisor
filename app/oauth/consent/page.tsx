import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, ShieldCheck } from "lucide-react";

const permissions = [
  "Create and update your DomiVault profile",
  "Sync expenses, vendors, appliances, and maintenance reminders",
  "Keep your records protected by secure account access and owner-only data rules",
];

export default function OAuthConsentPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
          <Link href="/dashboard" className="inline-flex items-center gap-3 rounded-3xl bg-slate-950 p-3 pr-5 text-white dark:bg-white dark:text-slate-950">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
              <Home className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">DomiVault</span>
              <span className="text-xs opacity-60">OAuth preview</span>
            </span>
          </Link>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Authorization consent</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Connect your DomiVault workspace.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 dark:text-slate-400">
            This preview route is ready for OAuth consent testing. Continue to login, then return to the dashboard.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">Allow DomiVault access</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            DomiVault will only access records scoped to your authenticated account.
          </p>

          <div className="mt-6 grid gap-3">
            {permissions.map((permission) => (
              <div key={permission} className="flex gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                <span>{permission}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            <Link href="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
              Continue to login
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
              Back to dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
