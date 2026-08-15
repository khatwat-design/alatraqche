import { NextResponse } from "next/server";
import { getStoreApiBaseUrl } from "@/lib/store-api-url";

type ProxyResult =
  | { ok: true; res: Response; body: unknown }
  | { ok: false; response: NextResponse };

export async function proxyToLaravelStore(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<ProxyResult> {
  const base = getStoreApiBaseUrl();
  if (!base) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "التكامل مع المتجر غير مفعّل (STORE_API_BASE_URL)." },
        { status: 503 },
      ),
    };
  }

  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers ?? undefined);
  headers.set("Accept", "application/json");
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });

  const body = await res.json().catch(() => ({}));
  return { ok: true, res, body };
}

export function jsonFromLaravel(
  res: Response,
  body: unknown,
  okStatus?: number,
): NextResponse {
  const status = okStatus ?? res.status;
  return NextResponse.json(body, { status });
}
