"use client"

import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react"

interface PhoneAuthFormProps {
  onSuccess: (result: { token: string; user: { id: number; phone: string; name: string | null }; isNew: boolean }) => void
  title?: string
  subtitle?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dashbord.alatraqchy.com/api/v1"

async function authFetch<T>(path: string, data: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || "حدث خطأ")
  return json
}

export default function PhoneAuthForm({ onSuccess, title, subtitle }: PhoneAuthFormProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  async function handleRequestOtp() {
    if (!phone.trim()) return
    setLoading(true)
    setError("")
    try {
      await authFetch<{ ok: boolean; message: string }>("/auth/request-otp", { phone: phone.trim() })
      setStep("otp")
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إرسال الكود")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    const fullCode = code.join("")
    if (fullCode.length !== 6) return
    setLoading(true)
    setError("")
    try {
      const result = await authFetch<{
        ok: boolean
        token: string
        tokenType: string
        user: { id: number; phone: string; name: string | null }
        is_new_user: boolean
      }>("/auth/verify-otp", { phone: phone.trim(), code: fullCode })
      if (result.ok) {
        localStorage.setItem("alatraqchy-token", result.token)
        onSuccess({ token: result.token, user: result.user, isNew: result.is_new_user })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "رمز التحقق غير صالح")
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!phone.trim()) return
    setResending(true)
    try {
      await authFetch<{ ok: boolean; message: string }>("/auth/request-otp", { phone: phone.trim() })
      setError("")
    } catch {
      setError("فشل إعادة إرسال الكود")
    } finally {
      setResending(false)
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleCodeKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === "Enter") handleVerifyOtp()
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(""))
      inputsRef.current[5]?.focus()
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">{title || (step === "phone" ? "تسجيل الدخول" : "رمز التحقق")}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
        {step === "phone" && (
          <p className="mt-1 text-sm text-gray-400">أدخل رقم هاتفك لتلقي رمز التحقق</p>
        )}
        {step === "otp" && (
          <p className="mt-1 text-sm text-gray-400">
            تم إرسال الرمز إلى <span className="font-medium text-gray-200" dir="ltr">{phone}</span>
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm space-y-5">
        {step === "phone" ? (
          <>
            <div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                placeholder="رقم الهاتف *"
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-3.5 py-2.5 text-center text-lg tracking-wider text-white outline-none transition-all placeholder:text-gray-500 focus:border-accent focus:ring-2 focus:ring-accent/20"
                dir="ltr"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-900/30 p-3 text-sm text-red-400">{error}</div>
            )}

            <button
              onClick={handleRequestOtp}
              disabled={loading || !phone.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "إرسال رمز التحقق"
              )}
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center gap-2" dir="ltr">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="h-14 w-11 rounded-xl border border-gray-700 bg-gray-800/50 text-center text-xl font-bold text-white outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && (
              <div className="rounded-xl bg-red-900/30 p-3 text-sm text-red-400">{error}</div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || code.join("").length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl gold-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all hover:shadow-xl hover:shadow-accent/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "تأكيد الدخول"
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="block w-full text-center text-sm text-gray-500 transition-colors hover:text-accent disabled:opacity-50"
            >
              {resending ? "جاري الإعادة..." : "إعادة إرسال الرمز"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
