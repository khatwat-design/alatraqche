"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, placeOrder, validateCoupon, setStoredToken, IRAQI_CITIES } from "@/lib/api";
import type { SelectedOption } from "@/types";

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
    const result = await validateCoupon(couponCode.trim(), cartTotal);
    if (result && result.ok) {
      setDiscount(result.discount);
      setCouponMsg(`✅ خصم ${result.type === "percentage" ? result.value + "%" : formatPrice(result.value)}`);
      setCouponApplied(couponCode.trim());
    } else {
      setCouponMsg("❌ الكوبون غير صالح أو منتهي الصلاحية");
      setDiscount(0);
    }
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
        <div className="mb-6 text-6xl">{orderResult.ok ? "🎉" : "❌"}</div>
        <h1 className={`mb-3 text-2xl font-bold ${orderResult.ok ? "text-dark-900" : "text-red-500"}`}>
          {orderResult.ok ? "تم استلام طلبك!" : "فشل تقديم الطلب"}
        </h1>
        <p className="mb-6 text-gray-600">{orderResult.message}</p>
        {orderResult.ok && <p className="mb-8 text-sm text-gray-400">سنقوم بالتواصل معك قريباً لتأكيد الطلب</p>}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {orderResult.invoiceId && (
            <Link href={`/orders/${orderResult.invoiceId}`} className="btn-primary">
              تتبع الطلب
              <ArrowLeft size={16} />
            </Link>
          )}
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-dark-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-dark-800">
            العودة للرئيسية
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-6 text-gray-200" />
        <h1 className="mb-2 text-xl font-bold text-dark-900">سلة التسوق فارغة</h1>
        <p className="mb-6 text-sm text-gray-500">أضف بعض المنتجات إلى السلة وعد هنا لإتمام الطلب</p>
        <Link href="/products" className="btn-primary">
          تسوق الآن
          <ArrowLeft size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-dark-900">سلة التسوق ({count()})</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {itemsWithKeys.map((item) => {
            const adj = item.selectedOptions.reduce((a, o) => {
              const opt = item.product.options.find((p) => p.id === o.optionId);
              const val = opt?.values.find((v) => v.id === o.valueId);
              return a + (val?.priceAdjustment ?? 0);
            }, 0);
            const price = item.product.price + adj;
            return (
              <div key={item.cartKey} className="card flex gap-4 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  <Image
                    src={item.product.images?.[0]?.url ?? item.product.image ?? "/images/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.product.id}`} className="line-clamp-1 text-sm font-medium text-dark-900 transition-colors hover:text-brand-600">
                    {item.product.name}
                  </Link>
                  {item.selectedOptions.length > 0 && (
                    <p className="mt-0.5 text-xs text-gray-400">{item.selectedOptions.map((o) => o.value).join("، ")}</p>
                  )}
                  <p className="mt-0.5 text-xs text-gray-400">{formatPrice(price)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const nq = item.quantity - 1;
                          if (nq <= 0) removeItem(item.cartKey);
                          else updateQuantity(item.cartKey, nq);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 transition-colors hover:bg-brand-50"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 transition-colors hover:bg-brand-50"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.cartKey)} className="text-gray-300 transition-colors hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-dark-900">{formatPrice(price * item.quantity)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          {!showCheckout ? (
            <div className="card sticky top-24">
              <h3 className="mb-4 font-semibold text-dark-900">ملخص الطلب</h3>
              <div className="space-y-2 text-sm">
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
                <div className="flex justify-between text-gray-600">
                  <span>التوصيل</span>
                  <span>يُحتسب لاحقاً</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-dark-900">
                  <span>المجموع النهائي</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="كود الخصم"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500"
                />
                <button onClick={handleApplyCoupon} className="rounded-lg bg-brand-600 px-3 text-sm font-medium text-white transition-colors hover:bg-brand-700">
                  تطبيق
                </button>
              </div>
              {couponMsg && <p className="mt-1 text-xs text-gray-500">{couponMsg}</p>}
              <button onClick={() => setShowCheckout(true)} className="btn-primary mt-5 w-full">
                إتمام الطلب
              </button>
            </div>
          ) : (
            <div className="card sticky top-24">
              <h3 className="mb-4 font-semibold text-dark-900">معلومات التوصيل</h3>
              <div className="space-y-3">
                <input type="text" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="الاسم الكامل *" className="input-field" />
                <input type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="رقم الهاتف *" className="input-field" />
                <select value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} className="input-field bg-white">
                  <option value="">المحافظة *</option>
                  {IRAQI_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input type="text" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="العنوان بالتفصيل" className="input-field" />
                <input type="text" value={customer.carType} onChange={(e) => setCustomer({ ...customer, carType: e.target.value })} placeholder="نوع السيارة (اختياري)" className="input-field" />
                <input type="text" value={customer.carModel} onChange={(e) => setCustomer({ ...customer, carModel: e.target.value })} placeholder="موديل السيارة (اختياري)" className="input-field" />
                <textarea value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} placeholder="ملاحظات إضافية (اختياري)" rows={2} className="input-field resize-none" />
                <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
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
                  <div className="flex justify-between font-bold text-dark-900">
                    <span>الإجمالي</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !customer.name || !customer.phone || !customer.city}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "جاري إرسال الطلب..." : "تأكيد الطلب — دفع عند الاستلام"}
                </button>
                <button onClick={() => setShowCheckout(false)} className="w-full text-center text-sm text-gray-500 transition-colors hover:text-brand-600">
                  العودة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
