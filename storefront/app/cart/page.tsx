"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, placeOrder, validateCoupon, setStoredToken, IRAQI_CITIES } from "@/lib/api";
import type { SelectedOption } from "@/types";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

const computeKey = (productId: string, options: SelectedOption[]): string => {
  const optStr = options.map((o) => `${o.optionId}:${o.valueId}`).sort().join(",");
  return `${productId}|${optStr}`;
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, count, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
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

    const result = await placeOrder({
      customer: {
        name: customer.name,
        phone: customer.phone,
        city: customer.city || undefined,
        address: customer.address || undefined,
        carType: customer.carType || undefined,
        carModel: customer.carModel || undefined,
        notes: customer.notes || undefined,
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-900">سلة التسوق</h1>
        <p className="mt-1 text-sm text-gray-500">{count()} منتج في السلة</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {itemsWithKeys.map((item) => {
            const adj = item.selectedOptions.reduce((a, o) => {
              const opt = item.product.options.find((p) => p.id === o.optionId);
              const val = opt?.values.find((v) => v.id === o.valueId);
              return a + (val?.priceAdjustment ?? 0);
            }, 0);
            const price = item.product.price + adj;
            return (
              <div key={item.cartKey} className="card flex gap-4 p-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  <Image
                    src={item.product.images?.[0]?.url ?? item.product.image ?? "/images/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/products/${item.product.id}`} className="line-clamp-1 text-sm font-semibold text-dark-900 transition-colors hover:text-brand-600">
                      {item.product.name}
                    </Link>
                    {item.selectedOptions.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.selectedOptions.map((o, i) => (
                          <span key={i} className="inline-block rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                            {o.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
                      <button
                        onClick={() => {
                          const nq = item.quantity - 1;
                          if (nq <= 0) removeItem(item.cartKey);
                          else updateQuantity(item.cartKey, nq);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        <MinusIcon className="h-3.5 w-3.5" />
                      </button>
                      <span className="flex h-8 w-10 items-center justify-center text-sm font-bold text-dark-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-dark-900">{formatPrice(price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.cartKey)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          {!showCheckout ? (
            <div className="card sticky top-24">
              <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-dark-900">
                <ShoppingBag size={18} className="text-brand-500" />
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
                  <span>المجموع النهائي</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="كود الخصم"
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-all hover:bg-brand-700 disabled:opacity-50"
                  >
                    {applyingCoupon ? (
                      <span className="flex h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      "تطبيق"
                    )}
                  </button>
                </div>
                {couponMsg && (
                  <p className={`mt-2 text-xs ${couponMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              <button onClick={() => setShowCheckout(true)} className="btn-primary mt-5 w-full">
                إتمام الطلب <ArrowLeft size={16} />
              </button>
            </div>
          ) : (
            <div className="card sticky top-24">
              <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-dark-900">
                <TruckIcon className="h-5 w-5 text-brand-500" />
                معلومات التوصيل
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <UserIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="الاسم الكامل *" className="input-field pr-9" />
                </div>
                <div className="relative">
                  <PhoneIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="رقم الهاتف *" className="input-field pr-9" dir="ltr" />
                </div>
                <div className="relative">
                  <MapPinIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
                  <select value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="input-field pr-9 appearance-none bg-white">
                    <option value="">المحافظة *</option>
                    {IRAQI_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <textarea value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  placeholder="العنوان بالتفصيل وملاحظات إضافية (اختياري)" rows={3} className="input-field resize-none" />

                <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>المجموع</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-dark-900">
                    <span>الإجمالي</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !customer.name || !customer.phone || !customer.city}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
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
                <button onClick={() => setShowCheckout(false)} className="w-full text-center text-sm font-medium text-gray-500 transition-colors hover:text-brand-600">
                  العودة إلى ملخص الطلب
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
