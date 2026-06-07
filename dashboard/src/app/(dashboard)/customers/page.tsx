"use client";

import { useEffect, useState } from "react";
import { Search, Mail, Phone, Calendar } from "lucide-react";
import api from "@/lib/api";
import { timeAgo, formatPrice } from "@/lib/utils";

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  orders_count?: number;
  total_spent?: number;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/customers?per_page=50").then(({ data }) => {
      setCustomers(data.customers || data.data || data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العملاء</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة عملاء المتجر</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          إجمالي <span className="font-semibold text-gray-900">{filtered.length}</span> عميل
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم العميل أو رقم الهاتف..."
            className="input-field pr-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
              <UsersIcon className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">لا يوجد عملاء</p>
          </div>
        ) : (
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
              {filtered.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gold-gradient text-sm font-bold text-white shadow-sm">
                        {customer.name?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-0.5">
                      {customer.email && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500" dir="ltr">
                          <Mail className="h-3 w-3 shrink-0" />
                          {customer.email}
                        </span>
                      )}
                      {customer.phone && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500" dir="ltr">
                          <Phone className="h-3 w-3 shrink-0" />
                          {customer.phone}
                        </span>
                      )}
                      {!customer.email && !customer.phone && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold text-gray-900">{customer.orders_count || 0}</span>
                  </td>
                  <td>
                    <span className="font-semibold text-gray-900">{formatPrice(customer.total_spent || 0)}</span>
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
        )}
      </div>
    </div>
  );
}

function UsersIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
