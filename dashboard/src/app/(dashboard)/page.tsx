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
  Plus,
  Settings,
  ExternalLink,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#3b82f6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

const shortcuts = [
  { label: "إضافة منتج", href: "/products", icon: Plus },
  { label: "عرض الطلبات", href: "/orders", icon: ShoppingCart },
  { label: "التحليلات", href: "/analytics", icon: TrendingUp },
  { label: "الإعدادات", href: "/settings", icon: Settings },
];

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
  const activeOrders = allOrders.filter((o) => o.status !== "cancelled");
  const totalRevenue = activeOrders.reduce((s, o) => s + o.total, 0);
  const avgOrder = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

  const statusCounts: Record<string, number> = {};
  allOrders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const statusTotal = Object.values(statusCounts).reduce((s, c) => s + c, 0);

  const monthlyRevenue: Record<string, number> = {};
  activeOrders.forEach((o) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("ar-IQ", { month: "short" });
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.total;
  });
  const sortedMonths = Object.keys(monthlyRevenue).slice(-6);
  const chartData = sortedMonths.map((key) => {
    const d = new Date(key + "-01");
    return {
      name: d.toLocaleDateString("ar-IQ", { month: "short" }),
      revenue: monthlyRevenue[key],
      fullName: d.toLocaleDateString("ar-IQ", { month: "long", year: "numeric" }),
    };
  });

  const pieData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      name: statusMap[key]?.label || key,
      value: count,
      color: statusColors[key] || "#737373",
    }));

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

  const formatCurrency = (value: number) => formatPrice(value);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header + Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-gray-500">نظرة عامة على أداء المتجر</p>
        </div>
        <div className="flex items-center gap-2">
          {shortcuts.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-accent/30 hover:text-accent hover:shadow-md"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const change = card.prev > 0 ? ((card.value - card.prev) / card.prev) * 100 : 0;
          const isPositive = change >= 0;

          return (
            <div key={card.label} className="stat-card group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Revenue - Recharts BarChart */}
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-gray-900">الإيرادات الشهرية</h2>
            </div>
            <Link href="/analytics" className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors">
              تفاصيل <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="mb-2 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">لا توجد بيانات إيرادات كافية</p>
            </div>
          ) : (
            <div dir="ltr" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontSize: 13,
                    }}
                    formatter={(value) => [formatPrice(Number(value)), "الإيرادات"]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                    fill="url(#goldGradient)"
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#B8960C" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status Distribution - Recharts PieChart */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-gray-900">حالات الطلبات</h2>
          </div>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="mb-2 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">لا توجد طلبات</p>
            </div>
          ) : (
            <>
              <div dir="ltr" className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1.5">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
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
            <div className="flex flex-col items-center justify-center py-8">
              <ShoppingCart className="mb-2 h-8 w-8 text-gray-300" />
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

        {/* Summary + Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-static flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{allOrders.length}</p>
            <p className="text-xs text-gray-500">إجمالي الطلبات</p>
          </div>
          <div className="card-static flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{statusCounts["cancelled"] || 0}</p>
            <p className="text-xs text-gray-500">طلبات ملغية</p>
          </div>
          <div className="card-static flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{activeOrders.length}</p>
            <p className="text-xs text-gray-500">طلبات نشطة</p>
          </div>
          <div className="card-static flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <p className="mt-3 text-lg font-bold text-gray-900">{formatPrice(avgOrder)}</p>
            <p className="text-xs text-gray-500">متوسط الطلب</p>
          </div>

          {/* Quick Access Card */}
          <div className="card-static col-span-2 flex flex-col justify-center transition-all hover:shadow-md">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">وصول سريع</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/products" className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-accent/20 hover:bg-accent/5 hover:text-accent">
                <Package className="h-4 w-4" />
                المنتجات
              </Link>
              <Link href="/orders" className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-accent/20 hover:bg-accent/5 hover:text-accent">
                <ShoppingCart className="h-4 w-4" />
                الطلبات
              </Link>
              <Link href="/customers" className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-accent/20 hover:bg-accent/5 hover:text-accent">
                <Users className="h-4 w-4" />
                العملاء
              </Link>
              <Link href="/analytics" className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-accent/20 hover:bg-accent/5 hover:text-accent">
                <BarChart3 className="h-4 w-4" />
                التحليلات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
