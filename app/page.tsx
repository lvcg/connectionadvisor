"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const isRecoveryHash = hash.includes("type=recovery") || hash.includes("access_token=");

    if (isRecoveryHash) {
      window.location.replace(`/auth/update-password${hash}`);
      return;
    }

    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Homey</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Opening your home dashboard...</h1>
      </div>
    </main>
  );
}
