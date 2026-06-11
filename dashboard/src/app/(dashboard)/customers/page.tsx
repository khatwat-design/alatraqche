"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Download,
  ChevronDown,
  Users,
  ShoppingBag,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import { timeAgo, formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  orders_count?: number;
  total_spent?: number;
  notes?: string;
  created_at: string;
}

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchCustomers = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "50", page: String(p) });
      if (q) params.set("search", q);
      const { data } = await api.get(`/admin/customers?${params}`);
      const list = data.customers || data.data || [];
      setCustomers(list);
      if (data.meta) setMeta(data.meta);
      else setMeta(null);
    } catch {
      toast.error("فشل تحميل العملاء");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(page, search);
  }, [page, search, fetchCustomers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
    }, 400);
  };

  const handleExport = async (format: "csv" | "json" | "xlsx" | "ods") => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format });
      if (search) params.set("search", search);
      const token = localStorage.getItem("alatraqchy-token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/admin/customers/export?${params}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("فشل التصدير");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`تم تصدير العملاء بصيغة ${format.toUpperCase()}`);
    } catch {
      toast.error("فشل تصدير العملاء");
    } finally {
      setExporting(false);
    }
  };

  const totalSpent = customers.reduce((s, c) => s + (c.total_spent || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.orders_count || 0), 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة عملاء المتجر</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export */}
          <div className="relative group">
            <button
              disabled={exporting}
              className="btn-secondary text-sm"
            >
              <Download className="h-4 w-4" />
              {exporting ? "جارٍ التصدير..." : "تصدير"}
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute left-0 top-full z-20 mt-1 hidden w-40 animate-fade-in overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl group-hover:block">
              <button onClick={() => handleExport("csv")} className="block w-full px-4 py-2.5 text-right text-sm text-gray-700 hover:bg-gray-50">
                CSV
              </button>
              <button onClick={() => handleExport("json")} className="block w-full px-4 py-2.5 text-right text-sm text-gray-700 hover:bg-gray-50">
                JSON
              </button>
              <button onClick={() => handleExport("xlsx")} className="block w-full px-4 py-2.5 text-right text-sm text-gray-700 hover:bg-gray-50">
                Excel (XLSX)
              </button>
              <button onClick={() => handleExport("ods")} className="block w-full px-4 py-2.5 text-right text-sm text-gray-700 hover:bg-gray-50">
                OpenDocument (ODS)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي العملاء</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {meta?.total ?? customers.length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle">
              <Users className="h-5 w-5 text-accent" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الطلبات</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي المشتريات</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatPrice(totalSpent)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="بحث باسم العميل أو رقم الهاتف..."
            className="input-field pr-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="skeleton h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-48" />
                </div>
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <Users className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">لا يوجد عملاء</p>
            {search && (
              <p className="mt-1 text-xs text-gray-400">حاول تغيير معايير البحث</p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>العميل</th>
                    <th>معلومات الاتصال</th>
                    <th>الطلبات</th>
                    <th>إجمالي المشتريات</th>
                    <th>تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gold-gradient text-sm font-bold text-white shadow-sm">
                            {customer.name?.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </span>
                            {customer.notes && (
                              <p className="mt-0.5 max-w-[200px] truncate text-xs text-gray-400">
                                {customer.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1">
                          {customer.email && (
                            <span
                              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600"
                              dir="ltr"
                            >
                              <Mail className="h-3 w-3 shrink-0 text-gray-400" />
                              {customer.email}
                            </span>
                          )}
                          {customer.phone && (
                            <span
                              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600"
                              dir="ltr"
                            >
                              <Phone className="h-3 w-3 shrink-0 text-gray-400" />
                              {customer.phone}
                            </span>
                          )}
                          {!customer.email && !customer.phone && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle px-2.5 py-0.5 text-xs font-semibold text-accent-hover">
                          <ShoppingBag className="h-3 w-3" />
                          {customer.orders_count || 0}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(customer.total_spent || 0)}
                        </span>
                      </td>
                      <td className="text-gray-500">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          {timeAgo(customer.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                <span className="text-sm text-gray-500">
                  الصفحة {meta.current_page} من {meta.last_page}
                  {" — "}
                  <span className="font-medium text-gray-700">{meta.total}</span> عميل
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
                    .filter((p) => {
                      const cur = meta.current_page;
                      return p === 1 || p === meta.last_page || Math.abs(p - cur) <= 1;
                    })
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
          </>
        )}
      </div>
    </div>
  );
}
