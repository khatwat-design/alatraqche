"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useCart } from "./cart-context";
import { useProducts } from "@/lib/use-products";
import { formatCurrency, filterProductsByQuery } from "@/lib/products";
import { useStoreSettings } from "@/contexts/store-settings-context";

export default function Header() {
  const { store } = useStoreSettings();
  const { totalItems } = useCart();
  const { products } = useProducts();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return products.slice(0, 8);
    return filterProductsByQuery(products, searchQuery);
  }, [products, searchQuery]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const count = mounted ? totalItems : 0;

  const openSearch = () => {
    setIsSearchOpen(true);
    setSearchQuery("");
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/10 shadow-lg backdrop-blur-md"
          : "border-transparent"
      }`}
      style={{
        backgroundColor: isScrolled
          ? `color-mix(in srgb, ${store.headerBackground} 94%, transparent)`
          : store.headerBackground,
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src={store.logoUrl}
            alt={store.storeName}
            className="h-[4.25rem] w-auto max-w-[260px] object-contain transition-transform group-hover:scale-105 md:h-20 md:max-w-[300px]"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
          <Link href="/" className="transition hover:text-white">
            الرئيسية
          </Link>
          <Link href="/products" className="transition hover:text-white">
            المنتجات
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={openSearch}
            className="hidden md:flex items-center gap-2 rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-all"
            aria-label="بحث عن منتجات"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            بحث
          </button>

          <Link
            href="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-all hover:bg-[var(--color-primary-600)] hover:scale-110"
            aria-label="السلة"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6L5 3H2" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {count > 0 ? (
              <span className="absolute -left-1 -top-1 rounded-full bg-[var(--color-primary-600)] text-white px-1.5 py-0.5 text-[11px] font-semibold animate-pulse">
                {count}
              </span>
            ) : null}
          </Link>

          <button
            className="md:hidden flex flex-col gap-1 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="القائمة"
          >
            <span className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "opacity-0" : ""}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-white/10"
          style={{ backgroundColor: store.headerBackground }}
        >
          <nav className="flex flex-col gap-3 px-6 py-4 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              الرئيسية
            </Link>
            <Link href="/products" className="hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              المتجر
            </Link>
            <Link href="/products?category=mattresses" className="hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              المراتب
            </Link>
            <Link href="/cart" className="hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              السلة
            </Link>
            <button
              type="button"
              onClick={openSearch}
              className="flex items-center gap-2 rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              بحث
            </button>
          </nav>
        </div>
      )}

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-label="بحث عن منتجات"
          onClick={() => setIsSearchOpen(false)}
        >
          <div className="mx-auto max-w-2xl px-4 pt-6 pb-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن منتج (اسم، وصف، تصنيف)..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:text-white"
                aria-label="إغلاق البحث"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900">
              {searchResults.length === 0 ? (
                <p className="px-4 py-8 text-center text-gray-400">لا توجد نتائج.</p>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {searchResults.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 text-right hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-sm text-gray-400">{formatCurrency(p.price)}</span>
                        <span className="flex-1 font-medium text-white">{p.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-gray-500">اضغط Esc للإغلاق</p>
          </div>
        </div>
      )}
    </header>
  );
}
