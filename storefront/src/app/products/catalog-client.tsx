"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product, SortKey } from "@/lib/products";
import { filterProductsByQuery, sortProducts } from "@/lib/products";
import { useCart } from "@/components/cart-context";
import { useProducts } from "@/lib/use-products";
import { trackAddToCart } from "@/lib/pixels";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "الترتيب الافتراضي" },
  { value: "price-asc", label: "السعر: من الأقل للأعلى" },
  { value: "price-desc", label: "السعر: من الأعلى للأقل" },
  { value: "name", label: "حسب الاسم" },
];

export default function CatalogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { products, categories, loading, error, refresh } = useProducts();

  const urlCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("default");

  useEffect(() => {
    const c = urlCategory;
    if (c && c !== "all" && categories.length) {
      const valid = categories.some((cat) => cat.id === c);
      setActiveCategory(valid ? c : "all");
    } else if (!c) {
      setActiveCategory("all");
    }
  }, [urlCategory, categories]);

  const setCategory = useCallback(
    (id: string) => {
      setActiveCategory(id);
      const params = new URLSearchParams(searchParams.toString());
      if (id === "all") params.delete("category");
      else params.set("category", id);
      const q = params.toString();
      router.push(q ? `/products?${q}` : "/products", { scroll: false });
    },
    [router, searchParams],
  );

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "all") {
      list = list.filter((p) => p.categoryId === activeCategory);
    }
    list = filterProductsByQuery(list, search);
    return sortProducts(list, sort);
  }, [products, activeCategory, search, sort]);

  const handleBuyNow = (product: Product) => {
    addItem(product.id);
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: 1,
    });
    router.push("/checkout");
  };

  const handleAddToCart = (product: Product) => {
    addItem(product.id);
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: 1,
    });
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="space-y-3 border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-medium text-[var(--color-primary)]">الأطرقجي للسجاد والأثاث والمفروشات</p>
        <p className="text-sm leading-relaxed text-stone-600 md:text-base">
          مكان يحتاجه كل بيت، نوفر كل أنواع السجاد والمفروشات والأثاث
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 md:text-3xl">المتجر</h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-muted)]">
              تصفّح {products.length} منتجاً في {categories.length} أقسام — فلترة، بحث، وترتيب بالسعر.
            </p>
          </div>
          {error ? (
            <button
              type="button"
              onClick={() => refresh()}
              className="self-start rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
            >
              إعادة المحاولة
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المنتج أو الوصف..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-stone-50/80 py-2.5 pr-10 pl-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <span className="shrink-0">ترتيب:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-stone-800 outline-none focus:border-[var(--color-primary)]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === "all"
                ? "bg-[var(--color-primary)] text-white shadow"
                : "border border-stone-200 bg-white text-stone-700 hover:border-[var(--color-primary)]"
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === cat.id
                  ? "bg-[var(--color-primary)] text-white shadow"
                  : "border border-stone-200 bg-white text-stone-700 hover:border-[var(--color-primary)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {error ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-800">{error}</p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} variant="grid" />)
          : filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="grid"
                onBuyNow={handleBuyNow}
                onAddToCart={handleAddToCart}
              />
            ))}
      </section>

      {!loading && !error && filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-stone-50/50 p-10 text-center">
          <p className="text-stone-700">لا توجد منتجات مطابقة للفلتر الحالي.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setSort("default");
            }}
            className="mt-4 inline-flex rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-600)]"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      ) : null}

      {!loading && categories.length > 0 ? (
        <section className="rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-stone-50 to-amber-50/30 p-6 md:p-8">
          <h2 className="text-lg font-bold text-stone-900">تسوق حسب القسم</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.id)}`}
                className="group flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-primary)] hover:shadow-md"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover transition group-hover:scale-105" sizes="80px" />
                  ) : null}
                </div>
                <div className="min-w-0 text-right">
                  <p className="font-semibold text-stone-900 group-hover:text-[var(--color-primary)]">{cat.name}</p>
                  {cat.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">{cat.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">
                    عرض المنتجات ←
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
