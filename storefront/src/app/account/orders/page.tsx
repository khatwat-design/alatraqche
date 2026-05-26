"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/products";
import { getStoreTokenFromBrowser } from "@/lib/store-token";

type OrderRow = {
  id: number;
  invoiceId: string;
  status: string;
  statusLabel: string;
  total: number;
  totalItems: number;
  createdAt: string | null;
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setErr("");
    setLoading(true);
    const token = getStoreTokenFromBrowser();
    if (!token) {
      setOrders([]);
      setMeta(null);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/store/my/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as {
      ok?: boolean;
      data?: OrderRow[];
      meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
      message?: string;
    };
    if (!res.ok || !data.ok) {
      setErr(data.message || "تعذر تحميل الطلبات.");
      setOrders([]);
      setMeta(null);
    } else {
      setOrders(data.data ?? []);
      setMeta(data.meta ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <p className="text-sm text-[var(--color-muted)]">جارٍ تحميل طلباتك...</p>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {err}
        <button
          type="button"
          onClick={() => void load()}
          className="mr-3 text-xs font-semibold underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-slate-50/60 p-10 text-center">
        <p className="text-sm text-[var(--color-muted)]">لا توجد طلبات مسجّلة لهذا الحساب بعد.</p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-600)]"
        >
          تصفّح المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">طلباتي</h2>
      <ul className="divide-y divide-[var(--color-border)] rounded-3xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-soft)]">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              href={`/account/orders/${encodeURIComponent(o.invoiceId)}`}
              className="flex flex-col gap-2 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{o.invoiceId}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {o.statusLabel} · {o.createdAt ? new Date(o.createdAt).toLocaleString("ar-IQ") : "—"}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-semibold text-slate-900">{formatCurrency(o.total)}</p>
                <p className="text-xs text-[var(--color-muted)]">{o.totalItems} قطعة</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {meta && meta.total > meta.per_page ? (
        <p className="text-center text-xs text-[var(--color-muted)]">
          الصفحة {meta.current_page} من {meta.last_page} — إجمالي {meta.total} طلباً
        </p>
      ) : null}
    </div>
  );
}
