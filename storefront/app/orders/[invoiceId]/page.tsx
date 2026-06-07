"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { getMyOrder, formatPrice } from "@/lib/api";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import type { OrderDetail } from "@/types";

export default function OrderDetailPage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { settings } = useStoreSettings();
  const whatsappPhone = settings?.phones?.[0] ?? "07729002266";
  const waLink = `https://wa.me/964${whatsappPhone.replace(/^0/, "")}?text=${encodeURIComponent(`استفسار عن طلب: ${invoiceId}`)}`;

  useEffect(() => {
    if (!invoiceId) return;
    getMyOrder(invoiceId)
      .then((data) => {
        if (data) setOrder(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mb-4 text-5xl">🔒</div>
        <h1 className="mb-2 text-xl font-bold text-dark-900">الطلب غير موجود</h1>
        <p className="mb-6 text-sm text-gray-500">يجب تسجيل الدخول أولاً لمشاهدة الطلب</p>
        <div className="flex justify-center gap-3">
          <Link href="/auth/login" className="btn-primary">
            تسجيل الدخول
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            طلباتي
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-600"
      >
        <ArrowLeft size={14} />
        العودة للطلبات
      </Link>

      <div className="card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-dark-900">طلب #{order.invoiceId}</h1>
            <p className="mt-0.5 text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString("ar-IQ")}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
          >
            {order.statusLabel}
          </span>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-dark-900">معلومات العميل</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="text-gray-400">الاسم:</span> {order.customerName}
              </p>
              <p>
                <span className="text-gray-400">الهاتف:</span> {order.customerPhone}
              </p>
              {order.customerCity && (
                <p>
                  <span className="text-gray-400">المحافظة:</span> {order.customerCity}
                </p>
              )}
              {order.customerAddress && (
                <p>
                  <span className="text-gray-400">العنوان:</span> {order.customerAddress}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-dark-900">المنتجات</h3>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-dark-900">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      الكمية: {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-dark-900">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>المجموع الفرعي</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>التوصيل</span>
                <span>{formatPrice(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-1 text-base font-bold text-dark-900">
              <span>الإجمالي</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
        >
          <Phone size={16} />
          استفسار عن الطلب على واتساب
        </a>
      </div>
    </div>
  );
}
