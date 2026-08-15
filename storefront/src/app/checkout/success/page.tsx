"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackPurchase } from "@/lib/pixels";
import { isStandaloneStore } from "@/lib/store-mode";

function SuccessContent() {
  const searchParams = useSearchParams();
  const invoice = searchParams.get("invoice");
  const firedPurchaseEvent = useRef(false);

  useEffect(() => {
    if (firedPurchaseEvent.current || typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem("alatraqji-last-order");
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        total?: number;
        items?: Array<{
          id: string;
          name?: string;
          price?: number;
          quantity?: number;
        }>;
      };
      if (parsed?.items?.length) {
        trackPurchase({
          items: parsed.items,
          total: parsed.total,
          orderId: invoice ?? undefined,
        });
        firedPurchaseEvent.current = true;
        window.localStorage.removeItem("alatraqji-last-order");
      }
    } catch {
      // ignore malformed payload
    }
  }, [invoice]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          شكراً لك! تم استلام طلبك
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          سنقوم بالتواصل معك قريباً لتأكيد التفاصيل والتوصيل.
        </p>
        {invoice ? (
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-muted)]">
              رقم الطلب:{" "}
              <span className="font-semibold text-slate-900">{invoice}</span>
            </p>
            {!isStandaloneStore() ? (
              <>
                <Link
                  href={`/account/orders/${encodeURIComponent(invoice)}`}
                  className="inline-flex rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300"
                >
                  تتبع هذا الطلب
                </Link>
                <p className="text-xs text-[var(--color-muted)]">
                  يُفعَّل حسابك تلقائياً عند الطلب؛ سجّل الدخول لاحقاً بنفس رقم الهاتف كاسم
                  مستخدم وكلمة مرور.
                </p>
              </>
            ) : (
              <p className="text-xs text-[var(--color-muted)]">
                احتفظ برقم الطلب؛ سنتواصل معك لتأكيد التفاصيل.
              </p>
            )}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/products"
          className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-600)]"
        >
          مواصلة التسوق
        </Link>
        <Link
          href="/"
          className="rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[var(--color-muted)]">
            جارٍ تحميل تفاصيل الطلب...
          </p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
