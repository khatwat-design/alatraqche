"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { loginCustomer, setStoredToken } from "@/lib/api";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

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
    } catch {
      setError("حدث خطأ، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-0.5 shadow-lg shadow-brand-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
              <Image src="/store/logo.png" alt="الأطرقجي" width={44} height={44} unoptimized className="h-11 w-11 object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-dark-900">تسجيل الدخول</h1>
          <p className="mt-1 text-sm text-gray-500">لتتبع طلباتك السابقة والاستفادة من العروض</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-700">رقم الهاتف</label>
            <div className="relative">
              <PhoneIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXXX"
                required
                className="input-field pr-9"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-700">كلمة المرور</label>
            <div className="relative">
              <LockIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field pr-9"
              />
            </div>
          </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                <span className="text-lg">⚠</span> {error}
              </div>
            )}

            <Link
              href="/auth/forgot-password"
              className="block text-center text-sm text-gray-400 underline underline-offset-2 transition-colors hover:text-brand-600"
            >
              نسيت كلمة المرور؟
            </Link>

          <button
            type="submit"
            disabled={loading || !phone || !password}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري تسجيل الدخول...
              </span>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-gray-500">
            ليس لديك حساب؟{" "}
            <Link href="/auth/register" className="font-semibold text-brand-600 underline underline-offset-2 transition-colors hover:text-brand-700">
              إنشاء حساب جديد
            </Link>
          </p>
          <p className="text-xs text-gray-400">يمكنك أيضاً إنشاء حساب تلقائياً عند تقديم طلب</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-brand-600">
            <ArrowLeft size={14} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
