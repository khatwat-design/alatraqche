"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { loginCustomer, setStoredToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !password) return;
    setLoading(true);
    setError("");
    try {
      const result = await loginCustomer({ phone: phone.trim(), password });
      if (result.ok) {
        setStoredToken(result.token);
        router.push("/orders");
      } else {
        setError("بيانات الدخول غير صحيحة.");
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
          <h1 className="text-2xl font-bold text-dark-900">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-gray-500">لتتبع طلباتك السابقة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="رقم الهاتف *"
            required
            className="input-field"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور *"
            required
            className="input-field"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !phone || !password}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ليس لديك حساب؟{" "}
            <Link href="/auth/register" className="font-medium text-brand-600 underline underline-offset-2">
              إنشاء حساب جديد
            </Link>
          </p>
          <p className="mt-2 text-xs text-gray-400">يمكنك أيضاً إنشاء حساب تلقائياً عند تقديم طلب</p>
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
