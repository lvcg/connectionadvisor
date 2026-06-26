import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

type RevenueCatEvent = {
  app_user_id?: string;
  entitlement_id?: string;
  entitlement_ids?: string[];
  event_timestamp_ms?: number;
  type?: string;
};

type RevenueCatWebhookPayload = {
  event?: RevenueCatEvent;
};

const plusEvents = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "TEMPORARY_ENTITLEMENT_GRANT",
  "PURCHASE_REDEEMED",
]);

const freeEvents = new Set(["EXPIRATION"]);

function verifyAuthorization(request: Request, rawBody: string) {
  const authToken = process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN;
  const signingSecret = process.env.REVENUECAT_WEBHOOK_SIGNING_SECRET;
  const authorization = request.headers.get("authorization");
  const signature = request.headers.get("x-revenuecat-webhook-signature");

  if (authToken) {
    const expectedValues = [`Bearer ${authToken}`, authToken];
    if (!authorization || !expectedValues.includes(authorization)) return false;
  }

  if (signingSecret && signature) {
    const parts = Object.fromEntries(signature.split(",").map((part) => {
      const [key, ...value] = part.split("=");
      return [key, value.join("=")];
    }));
    const timestamp = parts.t;
    const expectedSignature = parts.v1;

    if (!timestamp || !expectedSignature) return false;

    const ageInSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(ageInSeconds) || ageInSeconds > 300) return false;

    const computed = crypto
      .createHmac("sha256", signingSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    const computedBuffer = Buffer.from(computed);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (computedBuffer.length !== expectedBuffer.length) return false;

    return crypto.timingSafeEqual(computedBuffer, expectedBuffer);
  }

  return Boolean(authToken || signingSecret);
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifyAuthorization(request, rawBody)) {
    return NextResponse.json({ message: "Unauthorized RevenueCat webhook." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ message: "Billing webhook needs Supabase admin env vars." }, { status: 501 });
  }

  let payload: RevenueCatWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as RevenueCatWebhookPayload;
  } catch {
    return NextResponse.json({ message: "Invalid RevenueCat webhook JSON." }, { status: 400 });
  }
  const event = payload.event;
  const appUserId = event?.app_user_id;
  const eventType = event?.type || "UNKNOWN";

  if (!event || !appUserId) {
    return NextResponse.json({ message: "RevenueCat event missing app_user_id." }, { status: 400 });
  }

  const nextPlanTier = plusEvents.has(eventType) ? "vault_plus" : freeEvents.has(eventType) ? "free" : null;

  if (!nextPlanTier) {
    return NextResponse.json({ ok: true, ignored: eventType });
  }

  const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const entitlement = event.entitlement_id || event.entitlement_ids?.[0] || null;
  const eventAt = event.event_timestamp_ms ? new Date(event.event_timestamp_ms).toISOString() : new Date().toISOString();

  const { error } = await admin
    .from("profiles")
    .update({
      plan_tier: nextPlanTier,
      revenuecat_app_user_id: appUserId,
      revenuecat_entitlement: entitlement,
      revenuecat_subscription_status: eventType,
      revenuecat_latest_event_at: eventAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appUserId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, plan_tier: nextPlanTier });
}
