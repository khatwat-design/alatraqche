import { NextResponse } from "next/server";
import { jsonFromLaravel, proxyToLaravelStore } from "@/lib/laravel-store-proxy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 401 });
  }

  const proxied = await proxyToLaravelStore("/auth/logout", {
    method: "POST",
    headers: { Authorization: auth },
  });
  if (!proxied.ok) return proxied.response;

  return jsonFromLaravel(proxied.res, proxied.body);
}
