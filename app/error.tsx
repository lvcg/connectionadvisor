"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/monitoring";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError({
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-950">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">DomiVault</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Something needs attention.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">The app logged this issue. You can retry the page now.</p>
        <button onClick={reset} className="mt-5 h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950" type="button">
          Try again
        </button>
      </section>
    </main>
  );
}
