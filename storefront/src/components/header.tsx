"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useCart } from "./cart-context";
import { useProducts } from "@/lib/use-products";
import { formatCurrency } from "@/lib/products";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { useStoreCustomer } from "@/contexts/store-customer-context";
import { isStandaloneStore } from "@/lib/store-mode";

export default function Header() {
  const { store } = useStoreSettings();
  const { totalItems } = useCart();
  const standalone = isStandaloneStore();
  const { customer, loading: authLoading } = useStoreCustomer();
  const { products } = useProducts();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return products.slice(0, 8);
    const q = searchQuery.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        p.categoryId.toLowerCase().includes(q),
    );
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

  const accountHref = customer ? "/account/orders" : "/login";
  const accountLabel = customer ? "طلباتي" : "تسجيل الدخول";

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
            المتجر
          </Link>
          <Link href="/products?category=mattresses" className="transition hover:text-white">
            المراتب
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

          {!standalone && !authLoading ? (
            <Link
              href={accountHref}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white shadow-md transition-all hover:border-white/40 hover:bg-white/10 hover:scale-105"
              aria-label={accountLabel}
            >
              {customer ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </Link>
          ) : null}

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
