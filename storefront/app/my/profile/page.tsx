"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Mail, ShoppingBag, ArrowLeft, LogOut } from "lucide-react";
import { getMe, logoutCustomer, clearStoredToken } from "@/lib/api";
import type { CustomerInfo } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (!me) {
        router.push("/auth/login");
        return;
      }
      setCustomer(me);
      setLoading(false);
    })();
  }, [router]);

  async function handleLogout() {
    await logoutCustomer();
    clearStoredToken();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">حسابي</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-500"
        >
          <LogOut size={14} />
          تسجيل الخروج
        </button>
      </div>

      <div className="card p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-900">{customer.name}</h2>
            <p className="text-sm text-gray-400">عميل</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <User size={18} className="shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">الاسم</p>
              <p className="text-sm font-medium text-dark-900">{customer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <Phone size={18} className="shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">رقم الهاتف</p>
              <p className="text-sm font-medium text-dark-900" dir="ltr">{customer.phone}</p>
            </div>
          </div>
          {customer.email && (
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <Mail size={18} className="shrink-0 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                <p className="text-sm font-medium text-dark-900">{customer.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <Link
          href="/orders"
          className="card flex items-center justify-between p-4 transition-colors hover:border-gray-200"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-brand-600" />
            <span className="text-sm font-medium text-dark-900">طلباتي</span>
          </div>
          <ArrowLeft size={16} className="text-gray-400" />
        </Link>
      </div>

      <Link
        href="/auth/forgot-password"
        className="mt-4 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-brand-600"
      >
        <ArrowLeft size={14} />
        تغيير كلمة المرور
      </Link>
    </div>
  );
}
