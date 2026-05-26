"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStoreCustomer } from "@/contexts/store-customer-context";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account/orders";
  return raw;
}

function LoginForm() {
  const { login } = useStoreCustomer();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get("phone") || "").trim();
    const password = String(fd.get("password") || "");
    const next = safeNextPath(searchParams.get("next"));
    const r = await login(phone, password);
    setLoading(false);
    if (!r.ok) {
      setErr(r.message || "تعذر تسجيل الدخول.");
      return;
    }
    router.replace(next);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-5 rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-soft)]"
    >
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">تسجيل الدخول</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          أدخل رقم هاتفك كما في الطلب؛ كلمة المرور هي نفس الرقم (بعد التنسيق 07…) لمتابعة
          الطلبات بعد الشراء.
        </p>
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
        <label className="text-xs text-[var(--color-muted)]">كلمة المرور (نفس رقم الهاتف)</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        {loading ? "جارٍ الدخول..." : "دخول"}
      </button>
      <p className="text-center text-xs text-[var(--color-muted)]">
        لم تطلب بعد؟ أنشئ حسابك تلقائياً عند إتمام الطلب من صفحة السلة والدفع.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center text-sm text-[var(--color-muted)] shadow-[var(--shadow-soft)]">
          جارٍ التحميل...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
