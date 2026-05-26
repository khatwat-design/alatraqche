"use client";

import Link from "next/link";
import StoreMap from "@/components/store-map";
import ContactBlock from "@/components/contact-block";
import { useStoreSettings } from "@/contexts/store-settings-context";

const quick = [
  { href: "/products", label: "كل المنتجات" },
  { href: "/products?category=mattresses", label: "مراتب" },
  { href: "/products?category=bedding", label: "مفروشات قطنية" },
  { href: "/products?category=pillows", label: "وسادات" },
  { href: "/products?category=blankets", label: "بطانيات" },
  { href: "/cart", label: "سلة التسوق" },
];

export default function Footer() {
  const { store } = useStoreSettings();

  return (
    <footer
      className="border-t border-white/10 text-stone-400"
      style={{ backgroundColor: store.footerBackground }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-9 sm:px-6 md:py-11">
        {/* صف علوي: شعار + روابط + تواصل */}
        <div className="grid gap-8 border-b border-white/10 pb-9 md:grid-cols-12 md:gap-10 md:pb-10 lg:items-start">
          <div className="flex flex-col items-center gap-2 md:col-span-4 md:items-start">
            <Link href="/" className="group inline-flex shrink-0">
              <img
                src={store.logoUrl}
                alt={store.storeName}
                className="h-12 w-auto max-w-[150px] object-contain transition-transform group-hover:scale-[1.02] sm:h-[3.25rem] sm:max-w-[165px] md:h-14 md:max-w-[180px] lg:max-w-[190px]"
              />
            </Link>
            <p className="max-w-xs text-center text-[11px] leading-relaxed text-stone-500 md:text-right line-clamp-3">
              {store.sloganLine2}
            </p>
          </div>

          <nav
            aria-label="روابط سريعة"
            className="md:col-span-5 md:border-x md:border-white/10 md:px-6"
          >
            <p className="mb-3 text-center text-[11px] font-semibold tracking-wide text-stone-500 md:text-right">
              تصفّح
            </p>
            <ul className="mx-auto grid max-w-sm grid-cols-2 gap-x-6 gap-y-2 text-right md:mx-0 md:max-w-none">
              {quick.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[13px] text-stone-400 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <ContactBlock variant="footer" />
          </div>
        </div>

        {/* الخريطة — عرض كامل */}
        <div className="pt-8 md:pt-9">
          <StoreMap />
        </div>

        <p className="mt-8 border-t border-white/10 pt-6 text-center text-[11px] leading-relaxed text-stone-600 md:text-[11.5px]">
          © {new Date().getFullYear()} {store.storeName} — العراق
        </p>
      </div>
    </footer>
  );
}
