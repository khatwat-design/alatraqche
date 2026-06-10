"use client"

import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react"
import Image from "next/image"
import { requestOtp, verifyOtp, setStoredToken } from "@/lib/auth"

interface PhoneAuthFormProps {
  onSuccess: (result: { token: string; user: { id: number; phone: string; name: string | null }; isNew: boolean }) => void
  onBack?: () => void
  title?: string
  subtitle?: string
}

export default function PhoneAuthForm({ onSuccess, onBack, title, subtitle }: PhoneAuthFormProps) {
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
      await requestOtp(phone.trim())
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
      const result = await verifyOtp(phone.trim(), fullCode)
      if (result.ok) {
        setStoredToken(result.token)
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
      await requestOtp(phone.trim())
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
    if (e.key === "Enter") {
      handleVerifyOtp()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(""))
      inputsRef.current[5]?.focus()
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
          <h1 className="text-2xl font-bold text-dark-900">{title || (step === "phone" ? "تسجيل الدخول" : "رمز التحقق")}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {step === "phone" && (
            <p className="mt-1 text-sm text-gray-500">أدخل رقم هاتفك لتلقي رمز التحقق</p>
          )}
          {step === "otp" && (
            <p className="mt-1 text-sm text-gray-500">
              تم إرسال رمز التحقق إلى <span className="font-medium text-dark-700" dir="ltr">{phone}</span>
            </p>
          )}
        </div>

        <div className="card space-y-5">
          {step === "phone" ? (
            <>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                  placeholder="رقم الهاتف *"
                  className="input-field text-center text-lg tracking-wider"
                  dir="ltr"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
              )}

              <button
                onClick={handleRequestOtp}
                disabled={loading || !phone.trim()}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    جاري إرسال الكود...
                  </span>
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
                    className="h-14 w-11 rounded-xl border border-gray-200 bg-white text-center text-xl font-bold text-dark-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || code.join("").length !== 6}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    جاري التحقق...
                  </span>
                ) : (
                  "تأكيد الدخول"
                )}
              </button>

              <button
                onClick={handleResend}
                disabled={resending}
                className="block w-full text-center text-sm text-gray-400 transition-colors hover:text-brand-600 disabled:opacity-50"
              >
                {resending ? "جاري الإعادة..." : "إعادة إرسال الرمز"}
              </button>
            </>
          )}
        </div>

        {onBack && (
          <div className="mt-6 text-center">
            <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-brand-600">
              ← العودة
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
