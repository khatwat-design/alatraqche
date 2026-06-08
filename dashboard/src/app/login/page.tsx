"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { LogIn, Eye, EyeOff, Shield } from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token && user) router.push("/");
  }, [token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "فشل تسجيل الدخول";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: "var(--font-cairo)", direction: "rtl" },
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/3 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl gold-gradient p-0.5 shadow-lg shadow-accent/20">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-950">
              <Image src="/logo.png" alt="الأطرقجي" width={44} height={44} unoptimized className="h-11 w-11 object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">الأطرقجي</h1>
          <p className="mt-1 text-sm text-gray-400">لوحة التحكم — تسجيل الدخول</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-3.5 py-2.5 text-sm text-white outline-none transition-all placeholder:text-gray-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="admin@alatraqchy.com"
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-3.5 py-2.5 pl-10 text-sm text-white outline-none transition-all placeholder:text-gray-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="••••••••"
                required
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30 disabled:opacity-50"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {submitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
          </button>

          <div className="pt-2 text-center">
            <p className="text-xs text-gray-500">
              <Shield className="ml-1 inline h-3 w-3" />
              بيئة آمنة ومحمية
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
