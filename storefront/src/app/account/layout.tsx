"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStoreCustomer } from "@/contexts/store-customer-context";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customer, loading, logout } = useStoreCustomer();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!customer) {
      const next = encodeURIComponent(pathname || "/account/orders");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, customer, router, pathname]);

  if (loading || !customer) {
    return (
      <div className="rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <p className="text-sm text-[var(--color-muted)]">جارٍ التحقق من الجلسة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs text-[var(--color-muted)]">مرحباً</p>
          <h1 className="text-xl font-semibold text-slate-900">{customer.name}</h1>
          <p className="text-sm text-[var(--color-muted)]">{customer.phone}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/account/orders"
            className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            طلباتي
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
