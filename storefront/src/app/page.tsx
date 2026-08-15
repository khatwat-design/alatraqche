"use client";

import Link from "next/link";
import { useProducts } from "@/lib/use-products";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import StoreHero from "@/components/store-hero";

export default function Home() {
  const { products, categories, loading, error, refresh } = useProducts();

  return (
    <div className="space-y-14 md:space-y-18">
      <StoreHero />

      {error ? (
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-800">
            {error}{" "}
            <button
              type="button"
              onClick={() => refresh()}
              className="font-semibold underline"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      ) : null}

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 md:text-3xl">الأقسام</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">تصفح حسب التصنيف</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              عرض الكل ←
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-48 animate-pulse rounded-2xl bg-stone-100" />
                ))
              : categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    className="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 md:rounded-3xl"
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition duration-300 group-hover:from-black/80 group-hover:via-black/40" />
                    <div className="relative z-10 p-5 md:p-6">
                      <h3 className="text-lg font-bold text-white md:text-xl">{cat.name}</h3>
                      <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm transition group-hover:bg-[var(--color-primary)]">
                        تصفّح ←
                      </span>
                    </div>
                  </Link>
                ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="bg-stone-50/80 py-14">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 md:text-3xl">منتجات مميزة</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">اختر من بين أفضل منتجاتنا</p>
              </div>
              <Link
                href="/products"
                className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                عرض الكل ←
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : products.slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-600)] p-8 text-center text-white shadow-xl md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">الأطرقجي للسجاد والأثاث</h2>
          <p className="mt-3 text-sm text-white/80 md:text-base">
            نوفر لك أفضل المنتجات المنزلية بجودة عالية وأسعار منافسة
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="rounded-full bg-white px-8 py-3 text-sm font-bold text-[var(--color-primary)] shadow-lg transition hover:bg-stone-50"
            >
              تصفّح المنتجات
            </Link>
            <Link
              href="/cart"
              className="rounded-full border-2 border-white/60 bg-white/10 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              عرض السلة
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
