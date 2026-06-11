"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, validateCoupon } from "@/lib/api";
import type { SelectedOption } from "@/types";

const computeKey = (productId: string, options: SelectedOption[]): string => {
  const optStr = options.map((o) => `${o.optionId}:${o.valueId}`).sort().join(",");
  return `${productId}|${optStr}`;
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, count } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [_couponApplied, setCouponApplied] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const cartTotal = total();
  const finalTotal = Math.max(0, cartTotal - discount);

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

  const itemsWithKeys = useMemo(
    () => items.map((item) => ({ ...item, cartKey: computeKey(item.product.id, item.selectedOptions) })),
    [items]
  );

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
                        className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-brand-50 hover:text-brand-600 md:h-8 md:w-8"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 12h14" /></svg>
                      </button>
                      <span className="flex h-10 w-10 items-center justify-center text-sm font-bold text-dark-900 md:h-8 md:w-8">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-brand-50 hover:text-brand-600 md:h-8 md:w-8"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-dark-900">{formatPrice(price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.cartKey)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-dark-900">
              <ShoppingBag size={18} className="text-brand-500" />
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

          <div className="card sticky top-24">
            <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-dark-900">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[18px] w-[18px] text-brand-500"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
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
                <span>المجموع</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Link
              href={`/checkout/phone${_couponApplied ? `?coupon=${encodeURIComponent(_couponApplied)}` : ""}`}
              className="btn-primary mt-5 flex w-full items-center justify-center gap-2"
            >
              إتمام الطلب <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
