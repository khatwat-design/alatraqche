"use client"

import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Phone, ArrowLeft, Loader2 } from "lucide-react"
import { checkPhone, getStoredToken, setStoredToken } from "@/lib/api"
import { requestOtp, verifyOtp } from "@/lib/auth"

export default function CheckoutPhonePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const coupon = searchParams.get("coupon")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (getStoredToken()) {
      router.replace("/checkout")
    }
  }, [router])

  async function handleSubmitPhone() {
    if (!phone.trim()) return
    setChecking(true)
    setError("")
    try {
      const result = await checkPhone(phone.trim())
      if (result?.exists) {
        setLoading(true)
        await requestOtp(phone.trim())
        setLoading(false)
        setStep("otp")
        setTimeout(() => inputsRef.current[0]?.focus(), 100)
      } else {
        const params = new URLSearchParams()
        params.set("phone", phone.trim())
        if (coupon) params.set("coupon", coupon)
        router.push(`/checkout?${params.toString()}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ. حاول مرة أخرى.")
    } finally {
      setChecking(false)
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
        const params = new URLSearchParams()
        params.set("phone", phone.trim())
        if (result.user.name) params.set("name", result.user.name)
        if (result.user.city) params.set("city", result.user.city)
        if (result.user.address) params.set("address", result.user.address)
        if (coupon) params.set("coupon", coupon)
        router.push(`/checkout?${params.toString()}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "رمز التحقق غير صالح")
    } finally {
      setLoading(false)
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

  async function handleResend() {
    if (!phone.trim()) return
    setLoading(true)
    try {
      await requestOtp(phone.trim())
      setError("")
    } catch {
      setError("فشل إعادة إرسال الكود")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <button onClick={() => router.back()} className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-brand-600">
        <ArrowLeft size={14} />
        العودة إلى سلة التسوق
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-0.5 shadow-lg shadow-brand-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
            <Image src="/store/logo.png" alt="الأطرقجي" width={44} height={44} unoptimized className="h-11 w-11 object-contain" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-dark-900">
          {step === "phone" ? "تسجيل الدخول" : "رمز التحقق"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {step === "phone"
            ? "أدخل رقم هاتفك للمتابعة"
            : `تم إرسال رمز التحقق إلى ${phone}`
          }
        </p>
      </div>

      <div className="card space-y-5">
        {step === "phone" ? (
          <>
            <div className="relative">
              <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitPhone()}
                placeholder="رقم الهاتف *"
                className="input-field pr-9 text-lg tracking-wider"
                dir="ltr"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <button
              onClick={handleSubmitPhone}
              disabled={checking || loading || !phone.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              {checking || loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  جاري التحقق...
                </span>
              ) : (
                "متابعة"
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
                  disabled={loading}
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
                  <Loader2 size={16} className="animate-spin" />
                  جاري التحقق...
                </span>
              ) : (
                "تأكيد الدخول"
              )}
            </button>

            <button
              onClick={handleResend}
              disabled={loading}
              className="block w-full text-center text-sm text-gray-400 transition-colors hover:text-brand-600 disabled:opacity-50"
            >
              إعادة إرسال الرمز
            </button>
          </>
        )}
      </div>
    </div>
  )
}
