import { NextResponse } from "next/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ message: "Account deletion is not configured." }, { status: 500 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return NextResponse.json({ message: "Login again before deleting your account." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { message: "Account deletion needs SUPABASE_SERVICE_ROLE_KEY configured on the server." },
      { status: 501 },
    );
  }

  const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { data: files } = await admin.storage.from("receipts").list(user.id, { limit: 1000 });
    const storagePaths = files?.map((file) => `${user.id}/${file.name}`) || [];

    if (storagePaths.length > 0) {
      await admin.storage.from("receipts").remove(storagePaths);
    }
  } catch {
    // Account deletion should still continue if storage cleanup is partially unavailable.
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
