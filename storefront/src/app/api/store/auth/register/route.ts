import { NextResponse } from "next/server";
import { jsonFromLaravel, proxyToLaravelStore } from "@/lib/laravel-store-proxy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "طلب غير صالح." }, { status: 400 });
  }

  const proxied = await proxyToLaravelStore("/auth/register", {
    method: "POST",
    json,
  });
  if (!proxied.ok) return proxied.response;

  return jsonFromLaravel(proxied.res, proxied.body);
}
