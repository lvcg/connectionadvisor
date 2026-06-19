"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlanTier } from "@/types/homey";

export function usePlanTier() {
  const supabase = useMemo(() => createClient(), []);
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadPlan() {
      const { data: sessionData } = await client.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      const { data } = await client
        .from("profiles")
        .select("plan_tier")
        .eq("id", userId)
        .maybeSingle();

      if (!isMounted) return;
      setPlanTier((data?.plan_tier as PlanTier | null) || "free");
      setIsLoading(false);
    }

    loadPlan();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return {
    isLoading,
    isPlus: planTier === "vault_plus",
    planTier,
  };
}
