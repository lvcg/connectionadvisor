import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/security";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  const redirectTo = (path: string) => {
    if (!isLocalEnv && forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${path}`);
    }

    return NextResponse.redirect(new URL(path, requestUrl.origin));
  };

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase?.auth.exchangeCodeForSession(code) || {};
    if (error) {
      return redirectTo("/login?error=auth_callback");
    }
  }

  return redirectTo(next);
}
