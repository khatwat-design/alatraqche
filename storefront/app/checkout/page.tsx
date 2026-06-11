"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, ArrowLeft, MapPin, Phone, User, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, placeOrder, setStoredToken, IRAQI_CITIES, getStoredToken } from "@/lib/api";
import { requestOtp, verifyOtpWithData } from "@/lib/auth";
import type { SelectedOption } from "@/types";

const computeKey = (productId: string, options: SelectedOption[]): string => {
  const optStr = options.map((o) => `${o.optionId}:${o.valueId}`).sort().join(",");
  return `${productId}|${optStr}`;
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, total, count, clearCart } = useCart();

  const [step, setStep] = useState<"form" | "otp" | "result">("form");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
    paymentMethod: "cod" as const,
  });
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ ok: boolean; message: string; invoiceId?: string } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState("");

  const cartTotal = total();
  const finalTotal = cartTotal;
  const isAuthenticated = !!authToken;

  useEffect(() => {
    const phone = searchParams.get("phone");
    const name = searchParams.get("name");
    const city = searchParams.get("city");
    const address = searchParams.get("address");
    const coupon = searchParams.get("coupon");
    const token = getStoredToken();

    if (token) {
      setAuthToken(token);
    }

    if (coupon) {
      setCouponApplied(coupon);
    }

    if (phone) {
      setCustomer((prev) => ({
        ...prev,
        phone,
        name: name || prev.name,
        city: city || prev.city,
        address: address || prev.address,
      }));
    }

    if (!phone && !token) {
      router.replace("/checkout/phone");
    }
  }, [searchParams, router]);

  const itemsWithKeys = useMemo(
    () => items.map((item) => ({ ...item, cartKey: computeKey(item.product.id, item.selectedOptions) })),
    [items]
  );

  const handleSubmitOrder = async () => {
    if (!customer.name || !customer.phone || !customer.city) return;

    if (isAuthenticated) {
      await doPlaceOrder();
    } else {
      setSendingOtp(true);
      try {
        await requestOtp(customer.phone);
        setStep("otp");
        setCodeError("");
      } catch {
        setCodeError("فشل إرسال رمز التحقق. حاول مرة أخرى.");
      } finally {
        setSendingOtp(false);
      }
    }
  };

  const handleVerifyOtpAndSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;
    setSubmitting(true);
    setCodeError("");
    try {
      const result = await verifyOtpWithData(customer.phone, fullCode, {
        name: customer.name,
        city: customer.city,
        address: customer.address,
      });
      if (result.ok) {
        setStoredToken(result.token);
        setAuthToken(result.token);
        await doPlaceOrder();
      }
    } catch (e) {
      setCodeError(e instanceof Error ? e.message : "رمز التحقق غير صالح");
    } finally {
      setSubmitting(false);
    }
  };

  const doPlaceOrder = async () => {
    setSubmitting(true);
    try {
      const orderItems = items.map((item) => {
        const adj = item.selectedOptions.reduce((a, o) => {
          const opt = item.product.options.find((p) => p.id === o.optionId);
          const val = opt?.values.find((v) => v.id === o.valueId);
          return a + (val?.priceAdjustment ?? 0);
        }, 0);
        const itemPrice = item.product.price + adj;
        return {
          id: item.product.id,
          name: item.product.name,
          price: itemPrice,
          quantity: item.quantity,
          subtotal: itemPrice * item.quantity,
          options: item.selectedOptions.length > 0 ? item.selectedOptions.map((o) => ({ optionId: o.optionId, valueId: o.valueId, value: o.value })) : undefined,
        };
      });

      const totalItems = items.reduce((s, i) => s + i.quantity, 0);
      const addressParts = [customer.address, customer.notes].filter(Boolean);
      const combinedAddress = addressParts.length > 0 ? addressParts.join(" — ") : undefined;

      const result = await placeOrder({
        customer: {
          name: customer.name,
          phone: customer.phone,
          city: customer.city || undefined,
          address: combinedAddress,
          notes: undefined,
          paymentMethod: customer.paymentMethod,
        },
        items: orderItems,
        summary: { subtotal: cartTotal, deliveryFee: undefined, total: finalTotal, totalItems },
        coupon: couponApplied || undefined,
        channel: "web",
      });

      if (result && result.ok) {
        if (result.storeToken) setStoredToken(result.storeToken);
        setOrderResult({ ok: true, message: `✅ تم تقديم الطلب بنجاح! رقم الفاتورة: ${result.invoiceId}`, invoiceId: result.invoiceId });
        clearCart();
        setStep("result");
      } else {
        setOrderResult({ ok: false, message: "❌ حدث خطأ أثناء تقديم الطلب. حاول مرة أخرى." });
        setStep("result");
      }
    } catch {
      setOrderResult({ ok: false, message: "❌ حدث خطأ أثناء تقديم الطلب. حاول مرة أخرى." });
      setStep("result");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
    if (e.key === "Enter") {
      handleVerifyOtpAndSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      const last = document.getElementById("otp-5");
      last?.focus();
    }
  };

  if (step === "result") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-emerald-50">
          {orderResult?.ok ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <h1 className={`mb-3 text-2xl font-bold ${orderResult?.ok ? "text-dark-900" : "text-red-500"}`}>
          {orderResult?.ok ? "تم استلام طلبك!" : "فشل تقديم الطلب"}
        </h1>
        <div className="mx-auto mb-8 max-w-sm rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-gray-600">{orderResult?.message}</p>
        </div>
        {orderResult?.ok && <p className="mb-8 text-sm text-gray-400">سنقوم بالتواصل معك قريباً لتأكيد الطلب</p>}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {orderResult?.invoiceId && (
            <Link href={`/orders/${orderResult.invoiceId}`} className="btn-primary">
              تتبع الطلب <ArrowLeft size={16} />
            </Link>
          )}
          <Link href="/" className="btn-secondary">
            العودة للرئيسية <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-dark-900">سلة التسوق فارغة</h1>
        <p className="mb-8 text-sm text-gray-500">أضف بعض المنتجات إلى السلة وعد هنا لإتمام الطلب</p>
        <Link href="/products" className="btn-primary">
          تسوق الآن <ArrowLeft size={16} />
        </Link>
      </div>
    );
  }

  return (
    <>
      {step === "otp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                <Phone className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold text-dark-900">تأكيد الطلب</h3>
              <p className="mt-1 text-sm text-gray-500">
                تم إرسال رمز التحقق إلى <span className="font-medium text-dark-700" dir="ltr">{customer.phone}</span>
              </p>
            </div>

            <div className="mb-6 flex justify-center gap-2" dir="ltr">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="h-14 w-11 rounded-xl border border-gray-200 bg-white text-center text-xl font-bold text-dark-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                  autoComplete="one-time-code"
                  disabled={submitting}
                />
              ))}
            </div>

            {codeError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">{codeError}</div>
            )}

            <button
              onClick={handleVerifyOtpAndSubmit}
              disabled={submitting || code.join("").length !== 6}
              className="btn-primary w-full disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  جاري تأكيد الطلب...
                </span>
              ) : (
                "تأكيد الطلب"
              )}
            </button>

            <button
              onClick={() => { setStep("form"); setCodeError(""); }}
              disabled={submitting}
              className="mt-3 block w-full text-center text-sm text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/cart" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-brand-600">
          <ArrowLeft size={14} />
          العودة إلى سلة التسوق
        </Link>

        <h1 className="mb-8 text-2xl font-bold text-dark-900">إتمام الطلب</h1>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div className="card p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-dark-900">
                <User size={18} className="text-brand-500" />
                معلومات العميل
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="الاسم الكامل *" className="input-field pr-9" />
                </div>
                <div className="relative">
                  <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="رقم الهاتف *" className="input-field pr-9" dir="ltr" readOnly={!!searchParams.get("phone")} />
                  {isAuthenticated && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <CheckCircle size={16} className="text-green-500" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-dark-900">
                <MapPin size={18} className="text-brand-500" />
                العنوان والتوصيل
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <MapPin size={16} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" />
                  <select value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="input-field pr-9 appearance-none bg-white">
                    <option value="">المحافظة *</option>
                    {IRAQI_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <textarea value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="العنوان بالتفصيل (الحي، الشارع، المنطقة) *" rows={2} className="input-field resize-none" />
                <textarea value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder="ملاحظات إضافية للتوصيل (اختياري)" rows={2} className="input-field resize-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-dark-900">
                <ShoppingBag size={18} className="text-brand-500" />
                المنتجات ({count()})
              </h3>
              <div className="space-y-3">
                {itemsWithKeys.map((item) => {
                  const adj = item.selectedOptions.reduce((a, o) => {
                    const opt = item.product.options.find((p) => p.id === o.optionId);
                    const val = opt?.values.find((v) => v.id === o.valueId);
                    return a + (val?.priceAdjustment ?? 0);
                  }, 0);
                  const price = item.product.price + adj;
                  return (
                    <div key={item.cartKey} className="flex gap-3 rounded-xl bg-gray-50 p-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                        <Image
                          src={item.product.images?.[0]?.url ?? item.product.image ?? "/images/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <p className="truncate text-sm font-medium text-dark-900">{item.product.name}</p>
                        <p className="text-xs text-gray-400">الكمية: {item.quantity}</p>
                        <p className="text-sm font-bold text-dark-900">{formatPrice(price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="mb-4 text-base font-bold text-dark-900">ملخص الطلب</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-medium text-dark-900">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>التوصيل</span>
                  <span className="text-gray-400">يُحتسب لاحقاً</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-dark-900">
                  <span>الإجمالي</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={submitting || sendingOtp || !customer.name || !customer.phone || !customer.city}
                className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting || sendingOtp ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    {sendingOtp ? "جاري إرسال رمز التحقق..." : "جاري إرسال الطلب..."}
                  </span>
                ) : (
                  "تأكيد الطلب — دفع عند الاستلام"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
