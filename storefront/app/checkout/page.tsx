"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowLeft, Truck, MapPin, Phone, User, Car } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, placeOrder, validateCoupon, setStoredToken, IRAQI_CITIES } from "@/lib/api";
import type { SelectedOption } from "@/types";

const computeKey = (productId: string, options: SelectedOption[]): string => {
  const optStr = options.map((o) => `${o.optionId}:${o.valueId}`).sort().join(",");
  return `${productId}|${optStr}`;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, total, count, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ ok: boolean; message: string; invoiceId?: string } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    carType: "",
    carModel: "",
    notes: "",
    paymentMethod: "cod",
  });

  const cartTotal = total();
  const finalTotal = Math.max(0, cartTotal - discount);

  const itemsWithKeys = useMemo(
    () => items.map((item) => ({ ...item, cartKey: computeKey(item.product.id, item.selectedOptions) })),
    [items]
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    const result = await validateCoupon(couponCode.trim(), cartTotal);
    if (result && result.ok) {
      setDiscount(result.discount);
      setCouponMsg(`✅ خصم ${result.type === "percentage" ? result.value + "%" : formatPrice(result.value)}`);
      setCouponApplied(couponCode.trim());
    } else {
      setCouponMsg("❌ الكوبون غير صالح أو منتهي الصلاحية");
      setDiscount(0);
    }
    setApplyingCoupon(false);
  };

  const handleSubmitOrder = async () => {
    if (!customer.name || !customer.phone || !customer.city) return;
    setSubmitting(true);

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
        carType: customer.carType || undefined,
        carModel: customer.carModel || undefined,
        notes: undefined,
        paymentMethod: customer.paymentMethod || "cod",
      },
      items: orderItems,
      summary: { subtotal: cartTotal, deliveryFee: undefined, total: finalTotal, totalItems },
      coupon: couponApplied || undefined,
      channel: "web",
    });

    setSubmitting(false);

    if (result && result.ok) {
      if (result.storeToken) setStoredToken(result.storeToken);
      setOrderResult({ ok: true, message: `✅ تم تقديم الطلب بنجاح! رقم الفاتورة: ${result.invoiceId}`, invoiceId: result.invoiceId });
      clearCart();
    } else {
      setOrderResult({ ok: false, message: "❌ حدث خطأ أثناء تقديم الطلب. حاول مرة أخرى." });
    }
  };

  if (orderResult) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-emerald-50">
          {orderResult.ok ? (
            <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          )}
        </div>
        <h1 className={`mb-3 text-2xl font-bold ${orderResult.ok ? "text-dark-900" : "text-red-500"}`}>
          {orderResult.ok ? "تم استلام طلبك!" : "فشل تقديم الطلب"}
        </h1>
        <div className="mx-auto mb-8 max-w-sm rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-gray-600">{orderResult.message}</p>
        </div>
        {orderResult.ok && <p className="mb-8 text-sm text-gray-400">سنقوم بالتواصل معك قريباً لتأكيد الطلب</p>}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {orderResult.invoiceId && (
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
                  placeholder="رقم الهاتف *" className="input-field pr-9" dir="ltr" />
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
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-dark-900">
              <Car size={18} className="text-brand-500" />
              معلومات السيارة (اختياري)
            </h2>
            <p className="mb-4 text-sm text-gray-400">لمساعدتنا في تجهيز الطلب بشكل أفضل</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <select value={customer.carType} onChange={(e) => setCustomer({ ...customer, carType: e.target.value })}
                className="input-field bg-white">
                <option value="">نوع السيارة</option>
                <option value="sedan">سيدان</option>
                <option value="suv">دفع رباعي (SUV)</option>
                <option value="truck">بيك أب</option>
                <option value="van">فان</option>
                <option value="other">أخرى</option>
              </select>
              <input type="text" value={customer.carModel} onChange={(e) => setCustomer({ ...customer, carModel: e.target.value })}
                placeholder="موديل السيارة (مثال: تويوتا كامري 2020)" className="input-field" />
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-dark-900">
              <Truck size={18} className="text-brand-500" />
              ملاحظات التوصيل
            </h2>
            <textarea value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
              placeholder="ملاحظات إضافية للتوصيل (اختياري)" rows={3} className="input-field resize-none" />
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
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-dark-900">
              كود الخصم
            </h3>
            <div className="flex gap-2">
              <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                placeholder="كود الخصم"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()} />
              <button onClick={handleApplyCoupon} disabled={applyingCoupon || !couponCode.trim()}
                className="rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-all hover:bg-brand-700 disabled:opacity-50">
                {applyingCoupon ? (
                  <span className="flex h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : "تطبيق"}
              </button>
            </div>
            {couponMsg && (
              <p className={`mt-2 text-xs ${couponMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{couponMsg}</p>
            )}
          </div>

          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-dark-900">
              ملخص الطلب
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span className="font-medium text-dark-900">{formatPrice(cartTotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
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
              disabled={submitting || !customer.name || !customer.phone || !customer.city}
              className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  جاري إرسال الطلب...
                </span>
              ) : (
                "تأكيد الطلب — دفع عند الاستلام"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
