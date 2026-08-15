"use client";

import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { formatCurrency } from "@/lib/products";
import { useCart, parseCartKey, makeCartKey } from "@/components/cart-context";
import type { Product } from "@/lib/products";

export default function CartPage() {
  const { items, addItem, removeItem, setItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data: { products?: Product[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  const cartEntries = useMemo(
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
        product: typeof products[number];
        selectedOptions: ReturnType<typeof parseCartKey>['selectedOptions'];
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }>,
    [products, items],
  );

  const subtotal = cartEntries.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = 0;
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid" | "loading">("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const total = subtotal + deliveryFee;

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponStatus("invalid");
      setCouponMessage("الرجاء إدخال كود الخصم.");
      return;
    }
    setCouponStatus("loading");
    setCouponMessage("جارٍ التحقق...");
    try {
      const res = await fetch(`/api/validate-coupon?code=${encodeURIComponent(couponCode)}&subtotal=${subtotal}`);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-black">سلة التسوق</h1>
              <Link href="/" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">
                العودة للتسوق
              </Link>
            </div>

            <div className="space-y-4">
              {cartEntries.length ? (
                cartEntries.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                        <ProductImage
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-contain p-0.5"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">{item.product.name}</h3>
{item.selectedOptions.length ? (
  <p className="text-xs text-gray-500 mt-0.5">
    {item.selectedOptions.map((o) => o.value).filter(Boolean).join(" - ")}
  </p>
) : null}
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.product.description}
                        </p>
                        <p className="text-sm font-bold text-[var(--color-primary)] mt-2">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (Number.isNaN(value)) return;
                          setItem(item.key, Math.max(1, value));
                        }}
                        className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm focus:border-[var(--color-primary)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addItem(item.product.id, item.selectedOptions)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white hover:bg-[var(--color-primary-600)] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-black">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    سلتك فارغة حالياً. تصفح المنتجات وأضف ما يناسبك.
                  </p>
                  <Link
                    href="/"
                    className="inline-block mt-4 px-6 py-2 bg-[var(--color-primary)] text-white rounded-full text-sm font-semibold hover:bg-[var(--color-primary-600)] transition-colors"
                  >
                    تسوق الآن
                  </Link>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold text-black mb-6">ملخص الطلب</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>رسوم التوصيل</span>
                  <span className="font-semibold">{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between text-base font-bold text-black">
                    <span>الإجمالي</span>
                    <span className="text-[var(--color-primary)]">{formatCurrency(total)}</span>
                  </div>
                </div>
                {couponStatus === "valid" && couponDiscount > 0 ? (
                  <div className="flex items-center justify-between text-sm text-emerald-600 font-medium">
                    <span>الخصم</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                ) : null}
                {couponStatus === "valid" && couponDiscount > 0 ? (
                  <div className="flex items-center justify-between text-base font-bold text-emerald-700 border-t border-emerald-200 pt-2">
                    <span>الإجمالي بعد الخصم</span>
                    <span>{formatCurrency(Math.max(0, total - couponDiscount))}</span>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponStatus("idle");
                      setCouponMessage("");
                      setCouponDiscount(0);
                    }}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] ${
                      couponStatus === "valid"
                        ? "border-emerald-500"
                        : couponStatus === "invalid"
                          ? "border-red-500"
                          : "border-gray-300"
                    }`}
                    placeholder="كود الخصم"
                  />
                  <button
                    type="button"
                    onClick={validateCoupon}
                    disabled={couponStatus === "loading" || !couponCode.trim()}
                    className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-600)] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {couponStatus === "loading" ? "..." : "تطبيق"}
                  </button>
                </div>
                {couponMessage ? (
                  <p className={`text-xs ${
                    couponStatus === "valid" ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {couponMessage}
                  </p>
                ) : null}
              </div>
              <Link
                href={couponStatus === "valid" ? `/checkout?coupon=${encodeURIComponent(couponCode)}` : "/checkout"}
                className={`mt-6 block w-full rounded-xl px-6 py-3 text-center text-sm font-semibold text-white transition ${
                  cartEntries.length
                    ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)]"
                    : "cursor-not-allowed bg-gray-300 pointer-events-none"
                }`}
              >
                {cartEntries.length ? "إتمام الطلب" : "السلة فارغة"}
              </Link>
            </div>

            <div className="rounded-2xl bg-[var(--color-primary)] p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-2">معلومات التوصيل</h3>
              <p className="text-sm text-white/90">
                التوصيل داخل العراق خلال 24-48 ساعة حسب المدينة.
              </p>
              <p className="text-sm text-white/90 mt-2">
                الدفع عند الاستلام فقط.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
