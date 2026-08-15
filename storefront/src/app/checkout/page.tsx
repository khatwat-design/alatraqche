"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/products";
import type { Product } from "@/lib/products";
import { useCart, parseCartKey } from "@/components/cart-context";
import { trackInitiateCheckout, trackAddPaymentInfo } from "@/lib/pixels";

type CheckoutStatus = "idle" | "loading" | "success" | "error";

function flattenCheckoutErrors(errors?: Record<string, string[] | string>): string {
  if (!errors) return "";
  return Object.values(errors)
    .flatMap((v) => (Array.isArray(v) ? v : [String(v)]))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
}

const validateIraqiPhone = (phone: string): boolean => {
  const iraqiPhoneRegex = /^(07|00964|9647)?[3-9]\d{8}$/;
  return iraqiPhoneRegex.test(phone.replace(/\s/g, ''));
};

const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('00964')) {
    return cleaned.replace('00964', '0');
  }
  if (cleaned.startsWith('964')) {
    return cleaned.replace('964', '0');
  }
  if (cleaned.startsWith('07')) {
    return cleaned;
  }
  return cleaned;
};

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid" | "loading">("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    carType: "",
    carModel: "",
    notes: "",
  });

  const autoValidatedRef = useRef(false);
  const firedCheckoutEvent = useRef(false);
  const firedPaymentInfoEvent = useRef(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.ok ? res.json() : { products: [] })
      .then((data: { products?: Product[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const cartItems = useMemo(
    () =>
      Object.entries(items).map(([key, quantity]) => {
        const { productId, selectedOptions } = parseCartKey(key);
        const product = products.find((p) => p.id === productId);
        if (!product) return null;
        const extraPrice = selectedOptions.reduce((s, o) => s + o.priceAdjustment, 0);
        const unitPrice = product.price + extraPrice;
        return {
          key,
          product,
          selectedOptions,
          quantity,
          unitPrice,
          subtotal: unitPrice * quantity,
        };
      }).filter(Boolean) as Array<{
        key: string;
        product: (typeof products)[number];
        selectedOptions: ReturnType<typeof parseCartKey>['selectedOptions'];
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }>,
    [items, products],
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!cartItems.length || firedCheckoutEvent.current) return;
    trackInitiateCheckout({
      items: cartItems.map((item) => ({ id: item.product.id, name: item.product.name, price: item.unitPrice, quantity: item.quantity })),
      total,
    });
    firedCheckoutEvent.current = true;
  }, [cartItems, total]);

  useEffect(() => {
    if (!cartItems.length || firedPaymentInfoEvent.current) return;
    trackAddPaymentInfo({
      items: cartItems.map((item) => ({ id: item.product.id, name: item.product.name, price: item.unitPrice, quantity: item.quantity })),
      total,
    });
    firedPaymentInfoEvent.current = true;
  }, [cartItems, total]);

  useEffect(() => {
    const urlCoupon = searchParams.get("coupon");
    if (urlCoupon && !couponCode) {
      setCouponCode(urlCoupon);
      autoValidatedRef.current = false;
    }
  }, [searchParams]);

  useEffect(() => {
    if (couponCode && !autoValidatedRef.current) {
      autoValidatedRef.current = true;
      const timer = setTimeout(() => { validateCoupon(); }, 300);
      return () => clearTimeout(timer);
    }
  }, [couponCode]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setPhoneError("");
    updateField("phone", phone);
    if (phone.length > 0) {
      const formatted = formatPhoneNumber(phone);
      if (!validateIraqiPhone(formatted)) {
        setPhoneError("رقم الهاتف يجب أن يبدأ بـ 07 ويحتوي على 11 رقماً");
      }
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponStatus("invalid");
      setCouponMessage("الرجاء إدخال كود الخصم.");
      return;
    }
    setCouponStatus("loading");
    setCouponMessage("جارٍ التحقق...");
    try {
      const res = await fetch("/api/validate-coupon?code=" + encodeURIComponent(couponCode) + "&subtotal=" + subtotal);
      const data = await res.json();
      if (data.ok) {
        setCouponStatus("valid");
        setCouponDiscount(data.discount);
        setCouponMessage("تم تطبيق الخصم!");
      } else {
        setCouponStatus("invalid");
        setCouponDiscount(0);
        setCouponMessage(data.message || "كود الخصم غير صالح.");
      }
    } catch {
      setCouponStatus("invalid");
      setCouponDiscount(0);
      setCouponMessage("حدث خطأ في التحقق من الكود.");
    }
  };

  const phoneErrorMsg = phoneError;

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartItems.length) {
      setStatus("error");
      setStatusMessage("السلة فارغة. أضف منتجات قبل إتمام الطلب.");
      return;
    }
    const phone = formatPhoneNumber(formData.phone);
    if (!validateIraqiPhone(phone)) {
      setPhoneError("رقم الهاتف غير صحيح. يجب أن يبدأ بـ 07 ويحتوي على 11 رقم");
      return;
    }
    setStatus("loading");
    setStatusMessage("جارٍ إرسال الطلب...");
    const orderPayload = {
      customer: { name: formData.name, phone, city: formData.city, address: formData.address, carType: formData.carType, carModel: formData.carModel, notes: formData.notes, paymentMethod: "cod" },
      items: cartItems.map((item) => ({ id: item.product.id, name: item.product.name, price: item.unitPrice, quantity: item.quantity, subtotal: item.subtotal, options: item.selectedOptions.map((o) => ({ optionId: o.optionId, valueId: o.valueId })) })),
      summary: { subtotal, deliveryFee, total, totalItems },
      channel: "alatraqji-web",
      coupon: couponStatus === "valid" ? couponCode : "",
    };
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderPayload) });
      type CheckoutResult = { message?: string; invoiceId?: string; errors?: Record<string, string[] | string>; };
      let result: CheckoutResult | null = null;
      try { const json: unknown = await response.json(); result = json as CheckoutResult; } catch { result = null; }
      if (!response.ok) {
        setStatus("error");
        setStatusMessage(flattenCheckoutErrors(result?.errors) || result?.message || "تعذر إرسال الطلب.");
        return;
      }
      setStatus("success");
      setStatusMessage(result?.message || "تم استلام طلبك بنجاح.");
      if (typeof window !== "undefined") {
        window.localStorage.setItem("alatraqji-last-order", JSON.stringify({
          total,
          items: cartItems.map((item) => ({ id: item.product.id, name: item.product.name, price: item.unitPrice, quantity: item.quantity, options: item.selectedOptions.filter((o) => o.value).map((o) => o.value) })),
        }));
      }
      clear();
      router.push("/checkout/success" + (result?.invoiceId ? "?invoice=" + result.invoiceId : ""));
    } catch {
      setStatus("error");
      setStatusMessage("حدث خطأ غير متوقع، حاول مجدداً.");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
      <form
        onSubmit={handleCheckout}
        className="rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-soft)]"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">إتمام الطلب</h1>
          <Link href="/cart" className="text-sm text-[var(--color-muted)]">
            العودة للسلة
          </Link>
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          أدخل معلوماتك ليتم تجهيز الطلب والتواصل معك للتأكيد.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-muted)]">
              الاسم الكامل *
            </label>
            <input
              name="name"
              required
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
              placeholder="مثال: أحمد خالد"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-muted)]">
              رقم الموبايل العراقي *
            </label>
            <input
              name="phone"
              required
              value={formData.phone}
              onChange={handlePhoneChange}
              className={"w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 " + (
                phoneError ? "border-red-500 focus:border-red-500" : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
              )}
              placeholder="07xxxxxxxxx"
              inputMode="tel"
            />
            {phoneErrorMsg && (
              <p className="mt-1 text-xs text-red-500">{phoneErrorMsg}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-muted)]">المدينة *</label>
            <select
              name="city"
              required
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">اختر المدينة</option>
              <option value="بغداد">بغداد</option>
              <option value="البصرة">البصرة</option>
              <option value="أربيل">أربيل</option>
              <option value="السليمانية">السليمانية</option>
              <option value="دهوك">دهوك</option>
              <option value="نينوى">نينوى</option>
              <option value="كركوك">كركوك</option>
              <option value="الأنبار">الأنبار</option>
              <option value="ديالى">ديالى</option>
              <option value="بابل">بابل</option>
              <option value="واسط">واسط</option>
              <option value="المثنى">المثنى</option>
              <option value="ذي قار">ذي قار</option>
              <option value="القادسية">القادسية</option>
              <option value="ميسان">ميسان</option>
              <option value="صلاح الدين">صلاح الدين</option>
              <option value="كربلاء">كربلاء</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-muted)]">
              طريقة الدفع
            </label>
            <div className="w-full rounded-2xl border border-[var(--color-border)] bg-gray-50 px-4 py-3 text-sm">
              الدفع عند الاستلام
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs text-[var(--color-muted)]">المنطقة *</label>
            <input
              name="address"
              required
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
              placeholder="الحي، الشارع، أو اسم المنطقة"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-muted)]">
              الطابق أو مدخل المنزل (اختياري)
            </label>
            <input
              name="carType"
              type="text"
              value={formData.carType}
              onChange={(e) => updateField("carType", e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
              placeholder="مثال: طابق ثالث، باب جانبي"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-muted)]">
              وقت التوصيل المفضل (اختياري)
            </label>
            <input
              name="carModel"
              type="text"
              value={formData.carModel}
              onChange={(e) => updateField("carModel", e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
              placeholder="مثال: صباحاً، بعد الظهر، نهاية الأسبوع"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs text-[var(--color-muted)]">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
              placeholder="اترك ملاحظات التوصيل إن وجدت"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs text-[var(--color-muted)]">
              كود الخصم (اختياري)
            </label>
            <div className="flex gap-2">
              <input
                name="coupon"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponStatus("idle");
                  setCouponMessage("");
                  setCouponDiscount(0);
                }}
                className={"flex-1 rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 " + (
                  couponStatus === "valid" ? "border-emerald-500" : couponStatus === "invalid" ? "border-red-500" : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
                )}
                placeholder="أدخل كود الخصم"
              />
              <button
                type="button"
                onClick={validateCoupon}
                disabled={couponStatus === "loading" || !couponCode.trim()}
                className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-600)] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {couponStatus === "loading" ? "..." : "تطبيق"}
              </button>
            </div>
            {couponMessage ? (
              <p className={"mt-1 text-xs " + (couponStatus === "valid" ? "text-emerald-600" : "text-red-500")}>
                {couponMessage}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-600)] disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={status === "loading"}
        >
          {status === "loading" ? "جارٍ الإرسال..." : "إرسال الطلب"}
        </button>

        {status !== "idle" ? (
          <div
            className={"mt-4 rounded-2xl px-4 py-3 text-xs " + (
              status === "success" ? "bg-emerald-50 text-emerald-700" : status === "error" ? "bg-rose-50 text-rose-700" : "bg-slate-50 text-slate-600"
            )}
          >
            {statusMessage}
          </div>
        ) : null}
      </form>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-soft)]">
          <h2 className="text-xl font-semibold text-slate-900">ملخص السلة</h2>
          <div className="mt-6 space-y-4">
            {cartItems.length ? (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.product.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                      {item.selectedOptions.filter((o) => o.value).length > 0 && (
                        <p className="text-xs text-[var(--color-muted)]">
                          {item.selectedOptions.filter((o) => o.value).map((o) => o.value).join(" - ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                لم تتم إضافة منتجات بعد.
              </p>
            )}
          </div>
          <div className="mt-6 space-y-2 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-muted)]">
            <div className="flex items-center justify-between">
              <span>المجموع الفرعي</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>رسوم التوصيل</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-slate-900">
              <span>الإجمالي</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {couponStatus === "valid" && couponDiscount > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm font-medium text-emerald-600">
                  <span>الخصم</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-emerald-200 pt-2 text-base font-bold text-emerald-700">
                  <span>الإجمالي بعد الخصم</span>
                  <span>{formatCurrency(Math.max(0, total - couponDiscount))}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl bg-[var(--color-primary)] p-6 text-white shadow-[var(--shadow-soft)]">
          <h3 className="text-lg font-semibold">ملاحظة التوصيل</h3>
          <p className="mt-2 text-xs text-white/70">
            التوصيل داخل العراق خلال 24-48 ساعة حسب المدينة.
          </p>
        </div>
      </aside>
    </div>
  );
}
