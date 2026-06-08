"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  ChevronLeft,
  BarChart3,
} from "lucide-react";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface DashboardStats {
  revenue: { current: number; previous: number };
  orders: { current: number; previous: number };
  products: { current: number; previous: number };
  customers: { current: number; previous: number };
}

interface RecentOrder {
  id: number;
  invoice_id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

const statusMap: Record<string, { label: string; badge: string }> = {
  pending: { label: "قيد الانتظار", badge: "badge-yellow" },
  confirmed: { label: "مؤكد", badge: "badge-blue" },
  processing: { label: "قيد المعالجة", badge: "badge-purple" },
  shipped: { label: "تم الشحن", badge: "badge-blue" },
  delivered: { label: "تم التوصيل", badge: "badge-green" },
  cancelled: { label: "ملغي", badge: "badge-red" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allOrders, setAllOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/dashboard").catch(() => null),
      api.get("/admin/orders?per_page=100").catch(() => null),
    ]).then(([statsRes, ordersRes]) => {
      if (statsRes) setStats(statsRes.data);
      if (ordersRes) {
        const orders = ordersRes.data.orders || ordersRes.data.data || ordersRes.data;
        setAllOrders(Array.isArray(orders) ? orders : []);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
      </div>
    );
  }

  const recentOrders = allOrders.slice(0, 5);
  const totalRevenue = allOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const avgOrder = allOrders.filter((o) => o.status !== "cancelled").length > 0
    ? totalRevenue / allOrders.filter((o) => o.status !== "cancelled").length
    : 0;

  // Status distribution
  const statusCounts: Record<string, number> = {};
  allOrders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const statusTotal = Object.values(statusCounts).reduce((s, c) => s + c, 0);
  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    processing: "#8b5cf6",
    shipped: "#3b82f6",
    delivered: "#22c55e",
    cancelled: "#ef4444",
  };

  // Monthly revenue from orders
  const monthlyRevenue: Record<string, number> = {};
  allOrders
    .filter((o) => o.status !== "cancelled")
    .forEach((o) => {
      const month = new Date(o.created_at).toLocaleString("ar-IQ", { month: "short" });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + o.total;
    });
  const monthNames = Object.keys(monthlyRevenue).slice(-6);
  const monthValues = Object.values(monthlyRevenue).slice(-6);
  const maxRevenue = Math.max(...monthValues, 1);

  const statCards = [
    {
      label: "إجمالي الإيرادات",
      value: stats?.revenue?.current ?? 0,
      prev: stats?.revenue?.previous ?? 0,
      icon: DollarSign,
      format: (v: number) => formatPrice(v),
    },
    {
      label: "الطلبات",
      value: stats?.orders?.current ?? 0,
      prev: stats?.orders?.previous ?? 0,
      icon: ShoppingCart,
      format: (v: number) => `${v} طلب`,
    },
    {
      label: "المنتجات",
      value: stats?.products?.current ?? 0,
      prev: stats?.products?.previous ?? 0,
      icon: Package,
      format: (v: number) => `${v} منتج`,
    },
    {
      label: "العملاء",
      value: stats?.customers?.current ?? 0,
      prev: stats?.customers?.previous ?? 0,
      icon: Users,
      format: (v: number) => `${v} عميل`,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-gray-500">نظرة عامة على أداء المتجر</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">متوسط الطلب</p>
            <p className="text-sm font-bold gold-text">{formatPrice(avgOrder)}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent-subtle px-4 py-2">
            <Image src="/logo.png" alt="الأطرقجي" width={24} height={24} unoptimized className="h-6 w-6 object-contain" />
            <span className="text-sm font-semibold gold-text">الأطرقجي</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const change = card.prev > 0 ? ((card.value - card.prev) / card.prev) * 100 : 0;
          const isPositive = change >= 0;

          return (
            <div key={card.label} className="stat-card group flex flex-col">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent via-accent-hover to-accent opacity-60" />
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {card.label}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all group-hover:bg-accent group-hover:text-white">
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {card.format(card.value)}
              </p>
              <div className="mt-auto flex items-center gap-1.5 pt-2">
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">مقارنة بالشهر الماضي</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-gray-900">الإيرادات الشهرية</h2>
            </div>
            <Link href="/analytics" className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors">
              تفاصيل <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          {monthNames.length === 0 ? (
            <div className="py-8 text-center">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">لا توجد بيانات كافية</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
              {monthNames.map((name, i) => {
                const height = (monthValues[i] / maxRevenue) * 100;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-gray-400">{formatPrice(monthValues[i]).split(".")[0]}</span>
                    <div
                      className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
                      style={{
                        height: `${Math.max(height, 4)}%`,
                        background: "linear-gradient(180deg, #D4AF37 0%, #B8960C 100%)",
                      }}
                    />
                    <span className="text-[10px] text-gray-500">{name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-gray-900">توزيع حالات الطلبات</h2>
          </div>
          {statusTotal === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusMap).map(([key, { label }]) => {
                const count = statusCounts[key] || 0;
                const pct = statusTotal > 0 ? (count / statusTotal) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="status-dot" style={{ backgroundColor: statusColors[key] || "#737373" }} />
                        <span className="text-gray-700">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: statusColors[key] || "#737373" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-gray-900">آخر الطلبات</h2>
            </div>
            <Link href="/orders" className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors">
              عرض الكل <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center">
              <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">لا توجد طلبات حديثة</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between py-2.5 transition-colors hover:bg-gray-50 -mx-1.5 px-1.5 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.invoice_id}</p>
                    <p className="text-xs text-gray-500">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</span>
                    <span className={`badge ${statusMap[order.status]?.badge || "badge-yellow"}`}>
                      {statusMap[order.status]?.label || order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-static flex flex-col items-center justify-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{allOrders.length}</p>
            <p className="text-xs text-gray-500">إجمالي الطلبات</p>
          </div>
          <div className="card-static flex flex-col items-center justify-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <XIcon className="h-5 w-5 text-red-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{statusCounts["cancelled"] || 0}</p>
            <p className="text-xs text-gray-500">طلبات ملغية</p>
          </div>
          <div className="card-static flex flex-col items-center justify-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{allOrders.filter((o) => o.status === "delivered").length}</p>
            <p className="text-xs text-gray-500">طلبات مكتملة</p>
          </div>
          <div className="card-static flex flex-col items-center justify-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{statusCounts["pending"] || 0}</p>
            <p className="text-xs text-gray-500">قيد الانتظار</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
