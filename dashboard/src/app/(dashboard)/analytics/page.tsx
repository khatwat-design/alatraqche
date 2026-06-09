"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, DollarSign, ShoppingCart, Users,
  Calendar, Clock, Package, CheckCircle, XCircle, Truck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: number;
  invoice_id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

const statusMap: Record<string, { label: string; badge: string; color: string }> = {
  pending: { label: "قيد الانتظار", badge: "badge-yellow", color: "#f59e0b" },
  confirmed: { label: "مؤكد", badge: "badge-blue", color: "#3b82f6" },
  processing: { label: "قيد المعالجة", badge: "badge-purple", color: "#8b5cf6" },
  shipped: { label: "تم الشحن", badge: "badge-blue", color: "#3b82f6" },
  delivered: { label: "تم التوصيل", badge: "badge-green", color: "#22c55e" },
  cancelled: { label: "ملغي", badge: "badge-red", color: "#ef4444" },
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", processing: "#8b5cf6",
  shipped: "#3b82f6", delivered: "#22c55e", cancelled: "#ef4444",
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Record<string, number> | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/analytics").catch(() => null),
      api.get("/admin/orders?per_page=100").catch(() => null),
    ]).then(([anRes, ordRes]) => {
      if (anRes) setAnalytics(anRes.data);
      if (ordRes) {
        const o = ordRes.data.orders || ordRes.data.data || ordRes.data;
        setOrders(Array.isArray(o) ? o : []);
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

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = activeOrders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const statusTotal = orders.length;

  // Monthly revenue
  const monthlyData: Record<string, { revenue: number; count: number }> = {};
  activeOrders.forEach((o) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyData[key]) monthlyData[key] = { revenue: 0, count: 0 };
    monthlyData[key].revenue += o.total;
    monthlyData[key].count += 1;
  });
  const sortedMonths = Object.keys(monthlyData).slice(-6);
  const monthlyChartData = sortedMonths.map((key) => {
    const d = new Date(key + "-01");
    return {
      name: d.toLocaleDateString("ar-IQ", { month: "short" }),
      fullName: d.toLocaleDateString("ar-IQ", { month: "long", year: "numeric" }),
      revenue: monthlyData[key].revenue,
      orders: monthlyData[key].count,
    };
  });

  // Daily orders (last 7 days)
  const days: { label: string; count: number; full: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const count = orders.filter((o) => {
      const od = new Date(o.created_at);
      return od >= dayStart && od < dayEnd;
    }).length;
    const weekday = d.toLocaleDateString("ar-IQ", { weekday: "short" });
    const full = d.toLocaleDateString("ar-IQ", { weekday: "long", day: "numeric", month: "short" });
    days.push({ label: weekday, count, full });
  }

  // Pie data
  const pieData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      name: statusMap[key]?.label || key,
      value: count,
      color: statusColors[key] || "#737373",
    }));

  const metrics = [
    { label: "إجمالي الإيرادات", value: formatPrice(totalRevenue), sub: formatPrice(analytics?.total_revenue ?? 0), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "متوسط قيمة الطلب", value: formatPrice(avgOrderValue), sub: `${activeOrders.length} طلب نشط`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
    { label: "إجمالي الطلبات", value: String(orders.length), sub: `${activeOrders.length} نشط`, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "الزبائن", value: String(analytics?.total_customers ?? 0), sub: "مسجل", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-sm">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التحليلات</h1>
          <p className="mt-0.5 text-sm text-gray-500">تحليلات مفصلة لأداء المتجر</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="stat-card group flex flex-col">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent via-accent-hover to-accent opacity-60" />
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{m.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.bg} ${m.color} transition-all`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
              <p className="mt-auto pt-1 text-xs text-gray-400">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue - Recharts BarChart */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-gray-900">الإيرادات الشهرية</h2>
            </div>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          {monthlyChartData.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">لا توجد بيانات</div>
          ) : (
            <>
              <div dir="ltr" className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
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
                      contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13 }}
                      formatter={(value) => [formatPrice(Number(value)), "الإيرادات"]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                    />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={48} fill="url(#goldGradientAnalytics)" />
                    <defs>
                      <linearGradient id="goldGradientAnalytics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#B8960C" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
                <span>الإجمالي: {formatPrice(sortedMonths.reduce((s, m) => s + monthlyData[m].revenue, 0))}</span>
                <span>{sortedMonths.reduce((s, m) => s + monthlyData[m].count, 0)} طلب</span>
              </div>
            </>
          )}
        </div>

        {/* Daily Orders - Recharts BarChart */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-gray-900">الطلبات اليومية (آخر 7 أيام)</h2>
            </div>
            <ShoppingCart className="h-5 w-5 text-gray-400" />
          </div>
          <div dir="ltr" className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13 }}
                  formatter={(value) => [Number(value), "طلب"]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.full || label}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48} fill="url(#goldGradientDaily)" />
                <defs>
                  <linearGradient id="goldGradientDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#B8960C" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Distribution + Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution - Recharts PieChart */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-gray-900">توزيع حالات الطلبات</h2>
          </div>
          {pieData.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">لا توجد طلبات</div>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div dir="ltr" className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={42}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {Object.entries(statusCounts).map(([key, count]) => {
                  const info = statusMap[key];
                  if (!info || count === 0) return null;
                  const pct = ((count / statusTotal) * 100).toFixed(0);
                  return (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="status-dot" style={{ backgroundColor: info.color }} />
                          <span className="text-gray-700">{info.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{count}</span>
                          <span className="w-10 text-left text-xs text-gray-400">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: info.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-gray-900">مؤشرات سريعة</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <QuickMetric icon={CheckCircle} label="مكتملة" value={String(statusCounts["delivered"] || 0)} color="text-green-600" bg="bg-green-50" />
            <QuickMetric icon={Clock} label="قيد الانتظار" value={String(statusCounts["pending"] || 0)} color="text-yellow-600" bg="bg-yellow-50" />
            <QuickMetric icon={Truck} label="تم الشحن" value={String(statusCounts["shipped"] || 0)} color="text-blue-600" bg="bg-blue-50" />
            <QuickMetric icon={XCircle} label="ملغية" value={String(statusCounts["cancelled"] || 0)} color="text-red-600" bg="bg-red-50" />
          </div>
          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">معدل الإلغاء</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {statusTotal > 0 ? ((statusCounts["cancelled"] || 0) / statusTotal * 100).toFixed(1) : "0"}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickMetric({
  icon: Icon, label, value, color, bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; color: string; bg: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 text-center">
      <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4.5 w-4.5 ${color}`} />
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
