"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, Eye, Filter, CheckSquare, Download, ChevronDown, XSquare, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface Order {
  id: number;
  invoice_id: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  customer_phone?: string;
}

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const statusMap: Record<string, { label: string; badge: string }> = {
  pending: { label: "قيد الانتظار", badge: "badge-yellow" },
  confirmed: { label: "مؤكد", badge: "badge-blue" },
  processing: { label: "قيد المعالجة", badge: "badge-purple" },
  shipped: { label: "تم الشحن", badge: "badge-blue" },
  delivered: { label: "تم التوصيل", badge: "badge-green" },
  cancelled: { label: "ملغي", badge: "badge-red" },
};

const statusFlow = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchOrders = useCallback(async (p: number, q: string, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "50", page: String(p) });
      if (q) params.set("search", q);
      if (s) params.set("status", s);
      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.orders || data.data || data);
      if (data.meta) setMeta(data.meta);
    } catch {
      toast.error("فشل تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(page, search, statusFilter);
  }, [page, search, statusFilter, fetchOrders]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setPage(1), 400);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const filtered = orders;
  const activeFilters = [statusFilter].filter(Boolean).length;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((o) => o.id)));
    }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    setBulkUpdating(true);
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => api.put(`/admin/orders/${id}`, { status: bulkStatus })));
      toast.success(`تم تحديث حالة ${ids.length} طلب إلى ${statusMap[bulkStatus]?.label}`);
      setSelectedIds(new Set());
      setBulkStatus("");
      const { data } = await api.get("/admin/orders?per_page=100");
      setOrders(data.orders || data.data || data);
    } catch {
      toast.error("فشل تحديث بعض الطلبات");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    const data = filtered.map((o) => ({
      invoice_id: o.invoice_id,
      customer: o.customer_name,
      phone: o.customer_phone,
      total: o.total,
      status: statusMap[o.status]?.label || o.status,
      payment: o.payment_status,
      date: new Date(o.created_at).toLocaleDateString("ar-IQ"),
    }));

    if (format === "csv") {
      const headers = ["رقم الفاتورة", "العميل", "الهاتف", "المبلغ", "الحالة", "الدفع", "التاريخ"];
      const rows = data.map((r) => [r.invoice_id, r.customer, r.phone, r.total, r.status, r.payment, r.date].join(","));
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`تم تصدير ${data.length} طلب بصيغة ${format.toUpperCase()}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة طلبات المتجر</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative group">
            <button className="btn-secondary text-sm">
              <Download className="h-4 w-4" />
              تصدير
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute left-0 top-full z-20 mt-1 hidden w-36 animate-fade-in overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl group-hover:block">
              <button onClick={() => handleExport("csv")} className="block w-full px-4 py-2.5 text-right text-sm text-gray-700 hover:bg-gray-50">
                CSV
              </button>
              <button onClick={() => handleExport("json")} className="block w-full px-4 py-2.5 text-right text-sm text-gray-700 hover:bg-gray-50">
                JSON
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            إجمالي <span className="font-semibold text-gray-900">{filtered.length}</span>
          </div>
        </div>
      </div>

      {/* Filters + Bulk Actions */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="بحث برقم الفاتورة أو اسم العميل..."
            className="input-field pr-9"
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="input-field w-40 pr-9 appearance-none cursor-pointer"
          >
            <option value="">كل الحالات</option>
            {Object.entries(statusMap).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        {activeFilters > 0 && (
          <button onClick={() => handleStatusFilter("")} className="btn-ghost text-xs text-gray-500">
            إعادة تعيين
          </button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex animate-fade-in items-center gap-3 rounded-xl border border-accent/20 bg-accent-subtle px-4 py-2.5">
          <CheckSquare className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-gray-700">
            تم تحديد <span className="font-bold text-accent">{selectedIds.size}</span> طلب
          </span>
          <div className="mr-auto flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="input-field w-40 text-sm"
            >
              <option value="">تغيير الحالة إلى...</option>
              {statusFlow.map((s) => (
                <option key={s} value={s}>{statusMap[s].label}</option>
              ))}
              <option value="cancelled">ملغي</option>
            </select>
            <button
              onClick={handleBulkStatusChange}
              disabled={!bulkStatus || bulkUpdating}
              className="btn-primary text-sm"
            >
              {bulkUpdating ? "جارٍ..." : "تطبيق"}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="btn-ghost text-sm text-gray-500"
            >
              <XSquare className="h-4 w-4" />
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <ShoppingCartIcon className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">لا توجد طلبات</p>
            {search && <p className="mt-1 text-xs text-gray-400">حاول تغيير معايير البحث</p>}
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-accent accent-accent"
                  />
                </th>
                <th>الفاتورة</th>
                <th>العميل</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>الدفع</th>
                <th>التاريخ</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className={`${selectedIds.has(order.id) ? "bg-accent-subtle" : ""}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="h-4 w-4 rounded border-gray-300 text-accent accent-accent"
                    />
                  </td>
                  <td>
                    <span className="font-medium text-gray-900">#{order.invoice_id}</span>
                  </td>
                  <td>
                    <div>
                      <span className="text-gray-900">{order.customer_name}</span>
                      {order.customer_phone && (
                        <span className="mr-2 text-xs text-gray-400" dir="ltr">{order.customer_phone}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                  </td>
                  <td>
                    <span className={`badge ${statusMap[order.status]?.badge || "badge-yellow"}`}>
                      {statusMap[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${order.payment_status === "paid" ? "badge-green" : "badge-yellow"}`}>
                      {order.payment_status === "paid" ? "مدفوع" : "غير مدفوع"}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("ar-IQ")}
                  </td>
                  <td>
                    <Link href={`/orders/${order.id}`} className="btn-ghost p-1.5 text-gray-400 hover:text-accent">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
            <span className="text-sm text-gray-500">
              الصفحة {meta.current_page} من {meta.last_page}
              {" — "}
              <span className="font-medium text-gray-700">{meta.total}</span> طلب
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-ghost p-1.5 text-gray-500 disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-gray-300">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        p === meta.current_page
                          ? "gold-gradient text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="btn-ghost p-1.5 text-gray-500 disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShoppingCartIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
