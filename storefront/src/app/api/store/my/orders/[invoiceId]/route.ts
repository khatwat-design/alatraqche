import { NextResponse } from "next/server";
import { jsonFromLaravel, proxyToLaravelStore } from "@/lib/laravel-store-proxy";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ invoiceId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, message: "غير مصرّح." }, { status: 401 });
  }

  const { invoiceId } = await context.params;
  if (!invoiceId) {
    return NextResponse.json({ ok: false, message: "رقم الطلب غير صالح." }, { status: 400 });
  }

  const proxied = await proxyToLaravelStore(`/my/orders/${encodeURIComponent(invoiceId)}`, {
    method: "GET",
    headers: { Authorization: auth },
  });
  if (!proxied.ok) return proxied.response;

  return jsonFromLaravel(proxied.res, proxied.body);
}
