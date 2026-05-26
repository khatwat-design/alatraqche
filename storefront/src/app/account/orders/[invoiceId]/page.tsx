"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/products";
import { getStoreTokenFromBrowser } from "@/lib/store-token";

type OrderDetail = {
  id: number;
  invoiceId: string;
  status: string;
  statusLabel: string;
  customerName: string;
  customerPhone: string;
  customerCity: string | null;
  customerAddress: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalItems: number;
  channel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
};

export default function AccountOrderDetailPage() {
  const params = useParams();
  const invoiceIdRaw = params?.invoiceId;
  const invoiceId = typeof invoiceIdRaw === "string" ? invoiceIdRaw : "";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }
    setErr("");
    setLoading(true);
    const token = getStoreTokenFromBrowser();
    if (!token) {
      setErr("انتهت الجلسة. سجّل الدخول مجدداً.");
      setOrder(null);
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/store/my/orders/${encodeURIComponent(invoiceId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as {
      ok?: boolean;
      order?: OrderDetail;
      message?: string;
    };
    if (!res.ok || !data.ok || !data.order) {
      setErr(data.message || "تعذر تحميل الطلب.");
      setOrder(null);
    } else {
      setOrder(data.order);
    }
    setLoading(false);
  }, [invoiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!invoiceId) {
    return (
      <p className="text-sm text-rose-600">رقم الطلب غير صالح.</p>
    );
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-muted)]">جارٍ تحميل الطلب...</p>;
  }

  if (err || !order) {
    return (
      <div className="space-y-4">
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err || "الطلب غير موجود."}
        </p>
        <Link href="/account/orders" className="text-sm font-medium text-[var(--color-primary)]">
          العودة لقائمة الطلبات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/account/orders"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            ← كل الطلبات
          </Link>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{order.invoiceId}</h2>
          <p className="text-sm text-[var(--color-muted)]">{order.statusLabel}</p>
        </div>
        <p className="text-lg font-bold text-slate-900">{formatCurrency(order.total)}</p>
      </div>

      <div className="grid gap-4 rounded-3xl border border-[var(--color-border)] bg-white p-6 text-sm shadow-[var(--shadow-soft)] sm:grid-cols-2">
        <div>
          <p className="text-xs text-[var(--color-muted)]">الاسم</p>
          <p className="font-medium text-slate-900">{order.customerName}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">الهاتف</p>
          <p className="font-medium text-slate-900">{order.customerPhone}</p>
        </div>
        {order.customerCity ? (
          <div>
            <p className="text-xs text-[var(--color-muted)]">المدينة</p>
            <p className="font-medium text-slate-900">{order.customerCity}</p>
          </div>
        ) : null}
        {order.customerAddress ? (
          <div className="sm:col-span-2">
            <p className="text-xs text-[var(--color-muted)]">العنوان</p>
            <p className="font-medium text-slate-900">{order.customerAddress}</p>
          </div>
        ) : null}
        <div>
          <p className="text-xs text-[var(--color-muted)]">تاريخ الطلب</p>
          <p className="font-medium text-slate-900">
            {order.createdAt ? new Date(order.createdAt).toLocaleString("ar-IQ") : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">آخر تحديث</p>
          <p className="font-medium text-slate-900">
            {order.updatedAt ? new Date(order.updatedAt).toLocaleString("ar-IQ") : "—"}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-sm font-semibold text-slate-900">المنتجات</h3>
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {order.items.map((i, idx) => (
            <li key={`${i.productId}-${idx}`} className="flex justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium text-slate-900">{i.name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {i.quantity} × {formatCurrency(i.unitPrice)}
                </p>
              </div>
              <p className="shrink-0 font-semibold text-slate-900">{formatCurrency(i.subtotal)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
          <div className="flex justify-between text-[var(--color-muted)]">
            <span>المجموع الفرعي</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[var(--color-muted)]">
            <span>التوصيل</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-900">
            <span>الإجمالي</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
