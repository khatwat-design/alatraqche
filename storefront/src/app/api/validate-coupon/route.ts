import { NextResponse } from "next/server";
import { getStoreApiBaseUrl } from "@/lib/store-api-url";
import { isStandaloneStore } from "@/lib/store-mode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (isStandaloneStore()) {
    return NextResponse.json({ ok: false, message: "غير متاح في الوضع المستقل." }, { status: 400 });
  }

  const base = getStoreApiBaseUrl();
  if (!base) {
    return NextResponse.json({ ok: false, message: "STORE_API_BASE_URL غير مضبوط" }, { status: 500 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const subtotal = url.searchParams.get("subtotal") || "0";

  if (!code) {
    return NextResponse.json({ ok: false, message: "الرجاء إدخال كود الخصم." }, { status: 400 });
  }

  const res = await fetch(
    `${base}/coupons/validate/${encodeURIComponent(code)}?subtotal=${subtotal}`,
    { headers: { Accept: "application/json" } },
  );

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(body, { status: res.status });
  }

  return NextResponse.json(body);
}
