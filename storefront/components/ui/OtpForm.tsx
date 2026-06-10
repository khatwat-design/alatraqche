"use client";

import { useState } from "react";

interface OtpFormProps {
  onVerified: (phone: string) => void;
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dashbord.alatraqchy.com/api/v1";

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `فشل الطلب (${res.status})`);
  return json as T;
}

export default function OtpForm({ onVerified }: OtpFormProps) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiPost<{ ok: boolean; message: string }>("/otp/send", { phone: phone.trim() });
      if (res.ok) {
        setSuccess(res.message || "تم إرسال رمز التحقق إلى هاتفك");
        setStep("code");
      } else {
        setError(res.message || "حدث خطأ، حاول مرة أخرى.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || code.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiPost<{ ok: boolean; message: string }>("/otp/verify", { phone: phone.trim(), code: code.trim() });
      if (res.ok) {
        setSuccess(res.message || "تم التحقق بنجاح");
        onVerified(phone.trim());
      } else {
        setError(res.message || "رمز التحقق غير صالح.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-dark-900">التحقق برمز SMS</h2>
        <p className="mt-1 text-sm text-gray-500">
          {step === "phone" ? "أدخل رقم هاتفك لاستلام رمز التحقق" : "أدخل رمز التحقق المكون من 6 أرقام"}
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
                placeholder="+964XXXXXXXXX"
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
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري الإرسال...
              </span>
            ) : (
              "إرسال رمز التحقق"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="card space-y-5">
          <div className="rounded-xl bg-brand-50 p-3 text-center text-sm text-brand-700">
            تم إرسال رمز التحقق إلى {phone}
            <button
              type="button"
              onClick={() => { setStep("phone"); setError(""); setSuccess(""); setCode(""); }}
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
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                className="input-field pr-9 text-center text-lg tracking-widest"
                dir="ltr"
                maxLength={6}
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
            disabled={loading || code.length < 6}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري التحقق...
              </span>
            ) : (
              "تحقق"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
