"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStoreCustomer } from "@/contexts/store-customer-context";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account/orders";
  return raw;
}

function RegisterForm() {
  const { register } = useStoreCustomer();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const password = String(fd.get("password") || "");
    const password_confirmation = String(fd.get("password_confirmation") || "");
    const r = await register({ name, phone, password, password_confirmation });
    setLoading(false);
    if (!r.ok) {
      setErr(r.message || "تعذر إنشاء الحساب.");
      return;
    }
    router.replace(safeNextPath(searchParams.get("next")));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-5 rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-soft)]"
    >
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">حساب جديد</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          أنشئ حساباً لتتبع طلباتك من لوحة المتجر.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-[var(--color-muted)]">الاسم الكامل</label>
        <input
          name="name"
          required
          className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-[var(--color-muted)]">رقم الموبايل</label>
        <input
          name="phone"
          required
          autoComplete="tel"
          className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
          placeholder="07xxxxxxxxx"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-[var(--color-muted)]">كلمة المرور (٨ أحرف على الأقل)</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-[var(--color-muted)]">تأكيد كلمة المرور</label>
        <input
          name="password_confirmation"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      {err ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-xs text-rose-700">{err}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-600)] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
      </button>
      <p className="text-center text-xs text-[var(--color-muted)]">
        لديك حساب؟{" "}
        <Link href="/login" className="font-medium text-[var(--color-primary)]">
          سجّل الدخول
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center text-sm text-[var(--color-muted)] shadow-[var(--shadow-soft)]">
          جارٍ التحميل...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
