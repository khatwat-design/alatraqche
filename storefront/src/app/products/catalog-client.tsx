"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";
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
  const urlSearch = searchParams.get("q") || "";
  const urlPriceMin = searchParams.get("priceMin") || "";
  const urlPriceMax = searchParams.get("priceMax") || "";
  const urlSort = (searchParams.get("sort") as SortKey) || "default";

  const [activeCategory, setActiveCategory] = useState<string>(urlCategory || "all");
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [priceMin, setPriceMin] = useState(urlPriceMin);
  const [priceMax, setPriceMax] = useState(urlPriceMax);
  const [sort, setSort] = useState<SortKey>(urlSort);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const syncUrl = useCallback((params: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all" || val === "default") sp.delete(key);
      else sp.set(key, val);
    });
    const q = sp.toString();
    router.push(q ? `/products?${q}` : "/products", { scroll: false });
  }, [router, searchParams]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      syncUrl({ q: value || null });
    }, 300);
  }, [syncUrl]);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 0);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, []);

  useEffect(() => {
    if (urlCategory && urlCategory !== "all" && categories.length) {
      const valid = categories.some((cat) => cat.id === urlCategory);
      setActiveCategory(valid ? urlCategory : "all");
    } else if (!urlCategory) {
      setActiveCategory("all");
    }
  }, [urlCategory, categories]);

  const setCategory = useCallback(
    (id: string) => {
      setActiveCategory(id);
      syncUrl({ category: id === "all" ? null : id });
    },
    [syncUrl],
  );

  const setPriceMinValue = useCallback((val: string) => {
    setPriceMin(val);
    syncUrl({ priceMin: val || null });
  }, [syncUrl]);

  const setPriceMaxValue = useCallback((val: string) => {
    setPriceMax(val);
    syncUrl({ priceMax: val || null });
  }, [syncUrl]);

  const setSortValue = useCallback((val: SortKey) => {
    setSort(val);
    syncUrl({ sort: val === "default" ? null : val });
  }, [syncUrl]);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setPriceMin("");
    setPriceMax("");
    setSort("default");
    setActiveCategory("all");
    router.push("/products", { scroll: false });
  }, [router]);

  const removeFilter = useCallback((key: string) => {
    switch (key) {
      case "search":
        setSearch("");
        setDebouncedSearch("");
        syncUrl({ q: null });
        break;
      case "category":
        setActiveCategory("all");
        syncUrl({ category: null });
        break;
      case "priceMin":
        setPriceMin("");
        syncUrl({ priceMin: null });
        break;
      case "priceMax":
        setPriceMax("");
        syncUrl({ priceMax: null });
        break;
    }
  }, [syncUrl]);

  const activeCategoryName = activeCategory !== "all"
    ? categories.find((c) => c.id === activeCategory)?.name || activeCategory
    : null;

  const hasActiveFilters = debouncedSearch || activeCategory !== "all" || priceMin || priceMax || sort !== "default";

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "all") {
      list = list.filter((p) => p.categoryId === activeCategory);
    }
    if (priceMin) {
      const minVal = Number(priceMin);
      if (!Number.isNaN(minVal)) list = list.filter((p) => p.price >= minVal);
    }
    if (priceMax) {
      const maxVal = Number(priceMax);
      if (!Number.isNaN(maxVal)) list = list.filter((p) => p.price <= maxVal);
    }
    list = filterProductsByQuery(list, debouncedSearch);
    return sortProducts(list, sort);
  }, [products, activeCategory, debouncedSearch, sort, priceMin, priceMax]);

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

        {/* Search + Price Range + Sort */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ابحث باسم المنتج أو الوصف..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-stone-50/80 py-2.5 pr-10 pl-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-muted)]">السعر:</span>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMinValue(e.target.value)}
              placeholder="من"
              className="w-20 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-amber-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-xs text-[var(--color-muted)]">-</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMaxValue(e.target.value)}
              placeholder="إلى"
              className="w-20 rounded-xl border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-amber-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <span className="shrink-0">ترتيب:</span>
            <select
              value={sort}
              onChange={(e) => setSortValue(e.target.value as SortKey)}
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

        {/* Category pills */}
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

        {/* Active filter chips */}
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            {activeCategoryName ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 px-3 py-1.5 text-xs font-medium text-stone-700">
                {activeCategoryName}
                <button type="button" onClick={() => removeFilter("category")} className="text-stone-400 hover:text-red-500 transition">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ) : null}
            {debouncedSearch ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-stone-700">
                بحث: {debouncedSearch}
                <button type="button" onClick={() => removeFilter("search")} className="text-stone-400 hover:text-red-500 transition">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ) : null}
            {priceMin ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-stone-700">
                من {Number(priceMin).toLocaleString()} د.ع
                <button type="button" onClick={() => removeFilter("priceMin")} className="text-stone-400 hover:text-red-500 transition">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ) : null}
            {priceMax ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-stone-700">
                إلى {Number(priceMax).toLocaleString()} د.ع
                <button type="button" onClick={() => removeFilter("priceMax")} className="text-stone-400 hover:text-red-500 transition">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ) : null}
            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              مسح الكل
            </button>
          </div>
        ) : null}
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
            onClick={clearAllFilters}
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
