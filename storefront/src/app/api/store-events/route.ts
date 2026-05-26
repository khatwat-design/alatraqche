import { getStoreApiBaseUrl } from "@/lib/store-api-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * SSE endpoint — يستقصي Laravel كل 3 ثوانٍ ويبعث `change` event
 * فور اكتشاف تغيير جديد (last_change timestamp).
 *
 * PHP built-in server لا يدعم HTTP streaming، لذا نستخدم
 * polling سريع من Next.js بدل proxy مباشر.
 */
export async function GET() {
  const root = getStoreApiBaseUrl();

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(ctrl) {
      function send(event: string, data: object) {
        if (closed) return;
        try {
          ctrl.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {}
      }

      send("connected", { ts: Date.now() });

      if (!root) {
        // Standalone mode — no backend to poll
        return;
      }

      let lastTs = 0;
      let tick = 0;

      // استقصاء Laravel كل 3 ثوانٍ
      while (!closed) {
        await new Promise((r) => setTimeout(r, 3_000));
        if (closed) break;

        try {
          const res = await fetch(`${root}/store-status`, {
            signal: AbortSignal.timeout(2_500),
          });
          if (res.ok) {
            const json = (await res.json()) as { ts?: number; type?: string };
            const ts = json.ts ?? 0;
            if (ts !== lastTs && ts > 0) {
              send("change", { type: json.type ?? "all", ts });
              lastTs = ts;
            }
          }
        } catch {
          // Backend unreachable — keep alive silently
        }

        // Ping كل 24 ثانية (8 ticks × 3s)
        if (tick % 8 === 0) send("ping", { ts: Date.now() });
        tick++;

        // أغلق بعد 5 دقائق — المتصفح يعيد الاتصال تلقائياً
        if (tick >= 100) break;
      }

      try { ctrl.close(); } catch {}
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-store",
      "X-Accel-Buffering": "no",
      "Connection":        "keep-alive",
    },
  });
}
