"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Search, Menu, X, ChevronDown, Phone, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import type { Category } from "@/types";
import { getStoredToken } from "@/lib/api";

interface NavbarProps {
  categories: Category[];
}

export function Navbar({ categories }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const { count } = useCart();
  const { settings } = useStoreSettings();
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const phones = settings?.phones ?? [];
  const phone1 = phones[0] ?? "07729002266";
  const phone2 = phones[1];
  const waLink1 = `https://wa.me/964${phone1.replace(/^0/, "")}`;
  const waLink2 = phone2 ? `https://wa.me/964${phone2.replace(/^0/, "")}` : waLink1;

  useEffect(() => {
    setLoggedIn(!!getStoredToken());
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const cartCount = count();
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 shadow-lg shadow-black/5 backdrop-blur-xl"
            : "bg-white"
        }`}
      >
        {/* Main nav */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="الأطرقجي"
                width={36}
                height={36}
                unoptimized
                className="h-9 w-9 object-contain"
              />
              <div>
                <div className="text-sm font-bold leading-tight text-dark-900">الأطرقجي</div>
                <div className="text-[10px] leading-tight text-gray-400">للسجاد والأثاث والمفروشات</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex">
              <Link
                href="/"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "text-brand-600"
                    : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                }`}
              >
                الرئيسية
              </Link>
              <div
                className="relative"
                onMouseEnter={() => {
                  clearTimeout(megaTimeout.current);
                  setMegaOpen(true);
                }}
                onMouseLeave={() => {
                  megaTimeout.current = setTimeout(() => setMegaOpen(false), 150);
                }}
              >
                <button
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/products")
                      ? "text-brand-600"
                      : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  <span>المتجر</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {megaOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                    <div className="p-1.5">
                      <Link
                        href="/products"
                        className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        <span>كل المنتجات</span>
                      </Link>
                      <div className="my-1 border-t border-gray-50" />
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/products?category=${cat.id}`}
                          className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                aria-label="بحث"
              >
                <Search size={19} />
              </button>
              {loggedIn ? (
                <Link
                  href="/orders"
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  aria-label="طلباتي"
                >
                  <User size={19} />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden rounded-lg p-2 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600 md:block"
                  aria-label="تسجيل الدخول"
                >
                  <User size={19} />
                </Link>
              )}
              <Link
                href="/cart"
                className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                aria-label="سلة التسوق"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -left-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600 lg:hidden"
                aria-label="القائمة"
              >
                {menuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden border-t border-gray-100 bg-white transition-all duration-300 lg:hidden ${
            menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="mx-auto max-w-7xl space-y-0.5 px-4 py-3">
            <Link
              href="/"
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                pathname === "/" ? "text-brand-600" : "text-gray-700"
              }`}
            >
              الرئيسية
            </Link>
            <Link
              href="/products"
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive("/products") ? "text-brand-600" : "text-gray-700"
              }`}
            >
              كل المنتجات
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="block rounded-lg px-3 py-2 pr-7 text-sm text-gray-500"
              >
                {cat.name}
              </Link>
            ))}
            <div className="my-2 border-t border-gray-50" />
            <Link
              href="/cart"
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-700"
            >
              <span>سلة التسوق</span>
              {cartCount > 0 && (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {loggedIn ? (
              <Link href="/orders" className="block rounded-lg px-3 py-2.5 text-sm text-gray-700">
                طلباتي
              </Link>
            ) : (
              <Link href="/auth/login" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-600">
                تسجيل الدخول
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-24 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl animate-[fadeIn_0.2s_ease] rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <Search size={20} className="shrink-0 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن سجادة، مرتبة، أثاث..."
                className="flex-1 text-base text-gray-900 outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </form>
            {searchQuery.trim().length > 0 && (
              <button
                type="submit"
                onClick={() => {
                  if (searchQuery.trim()) {
                    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchOpen(false);
                    setSearchQuery("");
                  }
                }}
                className="mt-3 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
              >
                بحث عن &quot;{searchQuery.trim()}&quot;
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
