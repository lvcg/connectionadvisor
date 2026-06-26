import { createClient } from "@/lib/supabase/server";

export async function requireVaultPlus() {
  const supabase = await createClient();

  if (!supabase) {
    return {
      ok: false as const,
      status: 501,
      message: "Cloud auth is not configured.",
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return {
      ok: false as const,
      status: 401,
      message: "Login is required for this DomiVault Plus feature.",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("plan_tier")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return {
      ok: false as const,
      status: 500,
      message: error.message,
    };
  }

  if (data?.plan_tier !== "vault_plus") {
    return {
      ok: false as const,
      status: 402,
      message: "Upgrade to DomiVault Plus to use this feature.",
    };
  }

  return {
    ok: true as const,
    user,
    supabase,
  };
}
