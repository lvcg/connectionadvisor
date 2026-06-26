"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { createRevenueCatPurchaseUrl, hasRevenueCatPurchaseLink } from "@/lib/revenuecat";

type RevenueCatUpgradeButtonProps = {
  className?: string;
  label?: string;
  fallbackHref?: string;
};

export function RevenueCatUpgradeButton({
  className,
  label = "Upgrade to DomiVault Plus",
  fallbackHref = "/plus",
}: RevenueCatUpgradeButtonProps) {
  const supabase = useMemo(() => createClient(), []);
  const [href, setHref] = useState(fallbackHref);

  useEffect(() => {
    if (!hasRevenueCatPurchaseLink()) {
      setHref(fallbackHref);
      return;
    }

    let isMounted = true;

    async function loadPurchaseLink() {
      const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
      const user = data.session?.user;
      const nextHref = createRevenueCatPurchaseUrl({
        appUserId: user?.id,
        email: user?.email,
      });

      if (isMounted) setHref(nextHref);
    }

    loadPurchaseLink();

    return () => {
      isMounted = false;
    };
  }, [fallbackHref, supabase]);

  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950",
        className,
      )}
    >
      <Sparkles className="h-4 w-4" />
      {label}
    </a>
  );
}
