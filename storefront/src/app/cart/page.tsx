"use client";

import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { formatCurrency } from "@/lib/products";
import type { Product } from "@/lib/products";
import { useCart } from "@/components/cart-context";

export default function CartPage() {
  const { items, addItem, removeItem, setItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data: { products?: Product[] }) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  const cartItems = useMemo(
    () =>
      products
        .filter((p) => items[p.id])
        .map((product) => ({
          ...product,
          quantity: items[product.id],
          subtotal: items[product.id] * product.price,
        })),
    [products, items],
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

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
              {cartItems.length ? (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-0.5"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">{item.name}</h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        <p className="text-sm font-bold text-[var(--color-primary)] mt-2">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
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
                          setItem(item.id, Math.max(1, value));
                        }}
                        className="w-16 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm focus:border-[var(--color-primary)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addItem(item.id)}
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
              </div>
              <Link
                href="/checkout"
                className={`mt-6 block w-full rounded-xl px-6 py-3 text-center text-sm font-semibold text-white transition ${
                  cartItems.length
                    ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)]"
                    : "cursor-not-allowed bg-gray-300 pointer-events-none"
                }`}
              >
                {cartItems.length ? "إتمام الطلب" : "السلة فارغة"}
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
