"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { forgotPassword, resetPassword, setStoredToken } from "@/lib/api";

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

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await forgotPassword(phone.trim());
      if (result.ok) {
        setSuccess("تم إرسال رمز التحقق إلى هاتفك");
        setStep("otp");
      } else {
        setError(result.message || "حدث خطأ، حاول مرة أخرى.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!otp || !password || !passwordConfirmation) return;
    if (password !== passwordConfirmation) {
      setError("كلمة المرور غير متطابقة.");
      return;
    }
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await resetPassword({
        phone: phone.trim(),
        otp: otp.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      if (result.ok) {
        setStoredToken(result.token);
        router.push("/orders");
      } else {
        setError("رمز التحقق غير صحيح أو منتهي الصلاحية.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى.");
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
          <h1 className="text-2xl font-bold text-dark-900">استعادة كلمة المرور</h1>
          <p className="mt-1 text-sm text-gray-500">
            {step === "phone" ? "أدخل رقم هاتفك لاستلام رمز التحقق" : "أدخل رمز التحقق وكلمة المرور الجديدة"}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="card space-y-5">
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

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                <span className="text-lg">⚠</span> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-600">
                <span className="text-lg">✓</span> {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  جاري الإرسال...
                </span>
              ) : (
                "إرسال رمز التحقق"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="card space-y-5">
            <div className="rounded-xl bg-brand-50 p-3 text-center text-sm text-brand-700">
              تم إرسال رمز التحقق إلى {phone}
              <button
                type="button"
                onClick={() => { setStep("phone"); setError(""); setSuccess(""); }}
                className="mr-2 font-semibold underline underline-offset-2 hover:text-brand-800"
              >
                تغيير الرقم
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700">رمز التحقق</label>
              <div className="relative">
                <KeyIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  className="input-field pr-9 text-center text-lg tracking-widest"
                  dir="ltr"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700">كلمة المرور الجديدة</label>
              <div className="relative">
                <LockIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 أحرف على الأقل"
                  required
                  minLength={8}
                  className="input-field pr-9"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700">تأكيد كلمة المرور</label>
              <div className="relative">
                <LockIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
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

            <button
              type="submit"
              disabled={loading || !otp || !password || !passwordConfirmation}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  جاري حفظ كلمة المرور...
                </span>
              ) : (
                "حفظ كلمة المرور الجديدة"
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-brand-600">
            <ChevronLeft size={14} />
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
