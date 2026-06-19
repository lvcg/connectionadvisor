import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const event = {
      message: String(payload.message || "Unknown client error").slice(0, 500),
      digest: payload.digest ? String(payload.digest).slice(0, 120) : undefined,
      route: payload.route ? String(payload.route).slice(0, 200) : undefined,
      timestamp: payload.timestamp || new Date().toISOString(),
    };

    console.error("[domivault-client-error]", event);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
