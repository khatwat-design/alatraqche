"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/products";
import type { Product } from "@/lib/products";
import { useCart } from "@/components/cart-context";
import { useStoreCustomer } from "@/contexts/store-customer-context";
import { isStandaloneStore } from "@/lib/store-mode";
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

// دالة للتحقق من رقم الهاتف العراقي
const validateIraqiPhone = (phone: string): boolean => {
  const iraqiPhoneRegex = /^(07|00964|9647)?[3-9]\d{8}$/;
  return iraqiPhoneRegex.test(phone.replace(/\s/g, ''));
};

// دالة لتنسيق رقم الهاتف
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
  const { setSessionFromToken } = useStoreCustomer();
  const router = useRouter();
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.ok ? res.json() : { products: [] })
      .then((data: { products?: Product[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  const cartItems = useMemo(
    () =>
      products
        .filter((product) => items[product.id])
        .map((product) => ({
          ...product,
          quantity: items[product.id],
          subtotal: items[product.id] * product.price,
        })),
    [items, products],
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const firedCheckoutEvent = useRef(false);
  const firedPaymentInfoEvent = useRef(false);

  useEffect(() => {
    if (!cartItems.length || firedCheckoutEvent.current) return;
    trackInitiateCheckout({
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
    });
    firedCheckoutEvent.current = true;
  }, [cartItems, total]);

  useEffect(() => {
    if (!cartItems.length || firedPaymentInfoEvent.current) return;
    trackAddPaymentInfo({
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total,
    });
    firedPaymentInfoEvent.current = true;
  }, [cartItems, total]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setPhoneError("");
    
    if (phone.length > 0) {
      const formatted = formatPhoneNumber(phone);
      e.target.value = formatted;
      
      if (!validateIraqiPhone(formatted)) {
        setPhoneError("رقم الهاتف يجب أن يبدأ بـ 07 ويحتوي على 11 رقماً");
      }
    }
  };

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartItems.length) {
      setStatus("error");
      setStatusMessage("السلة فارغة. أضف منتجات قبل إتمام الطلب.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const phone = formatPhoneNumber(String(form.get("phone") || ""));
    
    if (!validateIraqiPhone(phone)) {
      setPhoneError("رقم الهاتف غير صحيح. يجب أن يبدأ بـ 07 ويحتوي على 11 رقم");
      return;
    }

    setStatus("loading");
    setStatusMessage("جارٍ إرسال الطلب...");

    const orderPayload = {
      customer: {
        name: String(form.get("name") || ""),
        phone: phone,
        city: String(form.get("city") || ""),
        address: String(form.get("address") || ""),
        carType: String(form.get("carType") || ""),
        carModel: String(form.get("carModel") || ""),
        notes: String(form.get("notes") || ""),
        paymentMethod: "cod", // الدفع عند الاستلام فقط
      },
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      summary: {
        subtotal,
        deliveryFee,
        total,
        totalItems,
      },
      channel: "alatraqji-web",
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      let result: {
        message?: string;
        invoiceId?: string;
        storeToken?: string;
        errors?: Record<string, string[] | string>;
      } | null = null;
      try {
        result = (await response.json()) as {
          message?: string;
          invoiceId?: string;
          storeToken?: string;
          errors?: Record<string, string[] | string>;
        };
      } catch {
        result = null;
      }

      if (!response.ok) {
        setStatus("error");
        const flat = flattenCheckoutErrors(result?.errors);
        setStatusMessage(flat || result?.message || "تعذر إرسال الطلب.");
        return;
      }

      setStatus("success");
      setStatusMessage(result?.message || "تم استلام طلبك بنجاح.");
      if (result?.storeToken && !isStandaloneStore()) {
        await setSessionFromToken(result.storeToken);
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "alatraqji-last-order",
          JSON.stringify({
            total,
            items: cartItems.map((item) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          }),
        );
      }
      clear();
      formElement.reset();
      router.push(
        `/checkout/success${result?.invoiceId ? `?invoice=${result.invoiceId}` : ""}`,
      );
    } catch (error) {
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
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 ${
                phoneError 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'
              }`}
              placeholder="07xxxxxxxxx"
              inputMode="tel"
              onChange={handlePhoneChange}
            />
            {phoneError && (
              <p className="text-xs text-red-500 mt-1">{phoneError}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-muted)]">المدينة *</label>
            <select
              name="city"
              required
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
              defaultValue=""
            >
              <option value="" disabled>اختر المدينة</option>
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
              <option value="المثنى">المثنى</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--color-muted)]">
              طريقة الدفع
            </label>
            <div className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm bg-gray-50">
              الدفع عند الاستلام
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs text-[var(--color-muted)]">المنطقة *</label>
            <input
              name="address"
              required
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
              className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-indigo-100"
              placeholder="اترك ملاحظات التوصيل إن وجدت"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] p-4 text-xs text-[var(--color-muted)] space-y-2">
          <p>
            بعد إتمام الطلب يُنشأ لك حساب تلقائياً لتتبع الطلبات: يُحدَّث اسمك من الطلب، وكلمة
            المرور هي نفس رقم هاتفك بعد التنسيق (07…).
          </p>
          <p>سيتم تأكيد الطلب عبر رسالة بعد الإرسال مباشرة.</p>
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
            className={`mt-4 rounded-2xl px-4 py-3 text-xs ${
              status === "success"
                ? "bg-emerald-50 text-emerald-700"
                : status === "error"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-50 text-slate-600"
            }`}
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
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
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
