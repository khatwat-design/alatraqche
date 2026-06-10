"use client"

import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react"

interface OrderOtpConfirmProps {
  phone: string
  onConfirm: (code: string) => Promise<void>
  onCancel?: () => void
}

export default function OrderOtpConfirm({ phone, onConfirm, onCancel }: OrderOtpConfirmProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  async function handleRequestOtp() {
    setError("")
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://dashbord.alatraqchy.com/api/v1"}/orders/request-confirmation`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("alatraqchy-store-token")}`,
          },
        }
      )
      const json = await res.json()
      if (!json.ok) throw new Error(json.message || "فشل إرسال رمز التحقق")
      setOtpSent(true)
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إرسال الرمز")
    }
  }

  async function handleConfirm() {
    const fullCode = code.join("")
    if (fullCode.length !== 6) return
    setLoading(true)
    setError("")
    try {
      await onConfirm(fullCode)
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
      handleConfirm()
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
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-2 text-base font-bold text-dark-900">تأكيد الطلب عبر OTP</h3>
      <p className="mb-4 text-sm text-gray-500">
        رمز التحقق سيُرسل إلى <span className="font-medium text-dark-700" dir="ltr">{phone}</span>
      </p>

      {!otpSent ? (
        <button
          onClick={handleRequestOtp}
          className="btn-primary w-full"
        >
          إرسال رمز التحقق
        </button>
      ) : (
        <div className="space-y-4">
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
                className="h-12 w-10 rounded-xl border border-gray-200 bg-gray-50 text-center text-lg font-bold text-dark-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                autoComplete="one-time-code"
                disabled={loading}
              />
            ))}
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading || code.join("").length !== 6}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري تأكيد الطلب...
              </span>
            ) : (
              "تأكيد الطلب"
            )}
          </button>
        </div>
      )}

      {onCancel && (
        <button onClick={onCancel} className="mt-3 block w-full text-center text-sm text-gray-400 transition-colors hover:text-red-500">
          إلغاء
        </button>
      )}
    </div>
  )
}
