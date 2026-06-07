"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowLeft, LogOut } from "lucide-react";
import { getMyOrders, getMe, logoutCustomer, clearStoredToken, formatPrice } from "@/lib/api";
import type { OrderListItem, CustomerInfo } from "@/types";

export default function OrdersPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (!me) {
        router.push("/auth/login");
        return;
      }
      setCustomer(me);
      const data = await getMyOrders(1);
      if (data) {
        setOrders(data.data);
        setMeta({ current_page: data.meta.current_page, last_page: data.meta.last_page });
      }
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (!customer) return;
    (async () => {
      const data = await getMyOrders(page);
      if (data) {
        setOrders(data.data);
        setMeta({ current_page: data.meta.current_page, last_page: data.meta.last_page });
      }
    })();
  }, [page, customer]);

  async function handleLogout() {
    await logoutCustomer();
    clearStoredToken();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">طلباتي</h1>
          {customer && <p className="mt-0.5 text-sm text-gray-400">مرحباً، {customer.name}</p>}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-500"
        >
          <LogOut size={14} />
          تسجيل الخروج
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <ShoppingBag size={64} className="mx-auto mb-6 text-gray-200" />
          <h2 className="mb-2 text-lg font-medium text-dark-900">لا توجد طلبات</h2>
          <p className="mb-6 text-sm text-gray-500">لم تقم بتقديم أي طلب بعد</p>
          <Link href="/products" className="btn-primary">
            تسوق الآن
            <ArrowLeft size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.invoiceId}`}
              className="card block p-4 transition-colors hover:border-gray-200"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-dark-900">#{order.invoiceId}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                >
                  {order.statusLabel}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("ar-IQ")} — {order.totalItems} منتج
                </span>
                <span className="font-bold text-dark-900">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                p === meta.current_page
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
