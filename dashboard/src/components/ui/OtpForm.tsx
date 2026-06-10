"use client";

import { useState } from "react";
import { Smartphone, KeyRound, ChevronLeft } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface OtpFormProps {
  onVerified: (phone: string) => void;
}

export default function OtpForm({ onVerified }: OtpFormProps) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const res = await api.post<{ ok: boolean; message: string }>("/otp/send", {
        phone: phone.trim(),
      });
      if (res.data.ok) {
        toast.success(res.data.message || "تم إرسال رمز التحقق");
        setStep("code");
      } else {
        toast.error(res.data.message || "حدث خطأ");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تعذر إرسال رمز التحقق";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    await sendOtp();
  }
    setLoading(true);
    try {
      const res = await api.post<{ ok: boolean; message: string }>("/otp/send", {
        phone: phone.trim(),
      });
      if (res.data.ok) {
        toast.success(res.data.message || "تم إرسال رمز التحقق");
        setStep("code");
      } else {
        toast.error(res.data.message || "حدث خطأ");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تعذر إرسال رمز التحقق";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || code.length < 6) return;
    setLoading(true);
    try {
      const res = await api.post<{ ok: boolean; message: string }>("/otp/verify", {
        phone: phone.trim(),
        code: code.trim(),
      });
      if (res.data.ok) {
        toast.success(res.data.message || "تم التحقق بنجاح");
        onVerified(phone.trim());
      } else {
        toast.error(res.data.message || "رمز التحقق غير صالح");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "فشل التحقق";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white">التحقق برمز SMS</h2>
        <p className="mt-1 text-sm text-gray-400">
          {step === "phone"
            ? "أدخل رقم هاتفك لاستلام رمز التحقق"
            : "أدخل رمز التحقق المكون من 6 أرقام"}
        </p>
      </div>

      {step === "phone" ? (
        <form
          onSubmit={handleSendOtp}
          className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm space-y-5"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              رقم الهاتف
            </label>
            <div className="relative">
              <Smartphone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+964XXXXXXXXX"
                required
                dir="ltr"
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-3.5 py-2.5 pr-9 text-sm text-white outline-none transition-all placeholder:text-gray-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !phone}
            className="flex w-full items-center justify-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Smartphone className="h-4 w-4" />
            )}
            {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleVerifyCode}
          className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm space-y-5"
        >
          <div className="rounded-xl bg-accent/10 p-3 text-center text-sm text-accent">
            تم إرسال رمز التحقق إلى {phone}
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
              }}
              className="mr-2 font-semibold underline underline-offset-2 hover:text-accent"
            >
              تغيير الرقم
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              رمز التحقق
            </label>
            <div className="relative">
              <KeyRound className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
                dir="ltr"
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-3.5 py-2.5 pr-9 text-center text-lg tracking-widest text-white outline-none transition-all placeholder:text-gray-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {loading ? "جاري التحقق..." : "تحقق"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                sendOtp();
              }}
              className="inline-flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-accent"
            >
              <ChevronLeft size={12} />
              إعادة إرسال الرمز
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
