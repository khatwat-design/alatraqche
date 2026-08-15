import { NextRequest, NextResponse } from "next/server";
import { jsonFromLaravel, proxyToLaravelStore } from "@/lib/laravel-store-proxy";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 401 });
  }

  const proxied = await proxyToLaravelStore("/addresses", {
    method: "GET",
    headers: { Authorization: auth },
  });
  if (!proxied.ok) return proxied.response;

  return jsonFromLaravel(proxied.res, proxied.body);
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));

  const proxied = await proxyToLaravelStore("/addresses", {
    method: "POST",
    headers: { Authorization: auth },
    json,
  });
  if (!proxied.ok) return proxied.response;

  return jsonFromLaravel(proxied.res, proxied.body, 201);
}
