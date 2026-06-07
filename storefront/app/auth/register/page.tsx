"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { registerCustomer, setStoredToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password || !form.password_confirmation) return;
    if (form.password !== form.password_confirmation) {
      setError("كلمة المرور غير متطابقة.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await registerCustomer(form);
      if (result.ok) {
        setStoredToken(result.token);
        router.push("/orders");
      } else {
        setError("حدث خطأ، حاول مرة أخرى.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-dark-900">إنشاء حساب</h1>
          <p className="mt-1 text-sm text-gray-500">لتتبع طلباتك والاستفادة من العروض</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="الاسم الكامل *"
            required
            className="input-field"
          />
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="رقم الهاتف *"
            required
            className="input-field"
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="كلمة المرور * (8 أحرف على الأقل)"
            required
            minLength={8}
            className="input-field"
          />
          <input
            type="password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            placeholder="تأكيد كلمة المرور *"
            required
            className="input-field"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !form.name || !form.phone || !form.password || !form.password_confirmation}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="font-medium text-brand-600 underline underline-offset-2">
              تسجيل الدخول
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-600">
            <ArrowLeft size={14} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
