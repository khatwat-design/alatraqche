"use client";
import Link from "next/link";
import { useStoreSettings } from "@/contexts/store-settings-context";

const HERO_BG = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80&auto=format&fit=crop";
const HERO_BG_MOBILE = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80&auto=format&fit=crop";

export default function StoreHero() {
  const { store } = useStoreSettings();

  return (
    <section className="relative w-full overflow-hidden rounded-3xl md:rounded-[2rem]" style={{ minHeight: "380px" }}>
      <picture>
        <source media="(min-width: 768px)" srcSet={HERO_BG} />
        <img
          src={HERO_BG_MOBILE}
          alt="الأطرقجي - سجاد وأثاث ومفروشات"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </picture>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

      <div className="relative z-10 mx-auto flex min-h-[380px] max-w-6xl flex-col items-center justify-center px-6 py-16 text-center md:min-h-[460px] md:py-20">
        <h1 className="text-3xl font-extrabold leading-snug text-white drop-shadow-lg md:text-5xl lg:text-6xl">
          {store.sloganLine1}
        </h1>
        <p className="mt-4 max-w-2xl text-base font-medium text-white/90 drop-shadow md:text-xl lg:text-2xl">
          {store.sloganLine2}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--color-primary-600)] hover:shadow-xl md:px-10 md:py-3.5 md:text-base"
          >
            تصفّح المنتجات
          </Link>
          <Link
            href="/products"
            className="rounded-full border-2 border-white/60 bg-white/10 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 md:px-10 md:py-3.5 md:text-base"
          >
            اتصل بنا
          </Link>
        </div>
      </div>
    </section>
  );
}
