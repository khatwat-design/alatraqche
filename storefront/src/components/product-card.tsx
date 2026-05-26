"use client";

import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/products";

type Props = {
  product: Product;
  variant?: "hero" | "grid";
  onBuyNow?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
};

export function ProductCard({
  product,
  variant = "grid",
  onBuyNow,
  onAddToCart,
}: Props) {
  const isHero = variant === "hero";
  const imgWrap = isHero
    ? "relative aspect-square w-full min-h-[180px] overflow-hidden rounded-xl md:rounded-2xl bg-stone-100"
    : "relative aspect-[4/3] w-full min-h-[140px] overflow-hidden rounded-2xl bg-stone-100 md:min-h-[200px]";

  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:rounded-3xl ${
        isHero ? "p-3 md:p-6" : "p-5 md:p-6"
      }`}
    >
      <div className="space-y-2 md:space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {product.badge ? (
            <span className="inline-flex rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-[11px] font-semibold text-white md:text-xs">
              {product.badge}
            </span>
          ) : null}
          <Link
            href={`/products?category=${encodeURIComponent(product.categoryId)}`}
            className="text-[11px] font-medium text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-primary)] hover:underline md:text-xs"
          >
            {product.category}
          </Link>
        </div>
        <div className={`${imgWrap} group cursor-pointer`}>
          <Link href={`/products/${product.id}`} className="absolute inset-0 block">
            <ProductImage
              src={product.image}
              alt={product.name}
              fill
              sizes={isHero ? "(max-width:768px) 50vw, 320px" : "(max-width:768px) 45vw, 280px"}
              className="object-contain p-1 transition duration-300 group-hover:scale-[1.02]"
            />
          </Link>
        </div>
        <div>
          <Link href={`/products/${product.id}`} className="block">
            <h3
              className={`font-semibold text-stone-900 transition hover:text-[var(--color-primary)] ${
                isHero ? "text-sm md:text-lg" : "text-base md:text-lg"
              }`}
            >
              {product.name}
            </h3>
          </Link>
          <p
            className={`mt-1 text-[var(--color-muted)] ${
              isHero ? "line-clamp-2 text-xs md:text-sm" : "line-clamp-2 text-sm leading-6"
            }`}
          >
            {product.description}
          </p>
        </div>
      </div>
      <div className={`mt-3 flex flex-col gap-2 md:mt-5 ${isHero ? "md:gap-3" : ""}`}>
        <p
          className={`font-semibold text-stone-900 ${
            isHero ? "text-sm md:text-base" : "text-base"
          }`}
        >
          {formatCurrency(product.price)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {onBuyNow ? (
            <button
              type="button"
              onClick={() => onBuyNow(product)}
              className={`flex-1 min-w-[120px] rounded-full bg-[var(--color-primary)] font-semibold text-white transition hover:bg-[var(--color-primary-600)] ${
                isHero ? "px-3 py-2 text-xs md:text-sm" : "px-4 py-2.5 text-sm"
              }`}
            >
              اشتري الآن
            </button>
          ) : null}
          {onAddToCart ? (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className={`rounded-full border border-stone-200 font-semibold text-stone-800 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] ${
                isHero ? "flex-1 px-3 py-2 text-xs md:text-sm" : "px-4 py-2.5 text-sm"
              }`}
            >
              للسلة
            </button>
          ) : null}
          <Link
            href={`/products/${product.id}`}
            className={`flex-1 min-w-[100px] text-center rounded-full border border-stone-200 font-semibold text-stone-800 transition hover:bg-stone-50 ${
              isHero ? "px-3 py-2 text-xs md:text-sm" : "px-4 py-2.5 text-sm"
            }`}
          >
            التفاصيل
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ variant = "grid" }: { variant?: "hero" | "grid" }) {
  const isHero = variant === "hero";
  return (
    <div
      className={`animate-pulse rounded-2xl border border-stone-100 bg-white md:rounded-3xl ${
        isHero ? "p-3 md:p-6" : "p-5 md:p-6"
      }`}
    >
      <div className="h-5 w-24 rounded-full bg-stone-100" />
      <div
        className={`mt-3 rounded-xl bg-stone-100 md:rounded-2xl ${
          isHero ? "aspect-square" : "aspect-[4/3] min-h-[140px]"
        }`}
      />
      <div className="mt-4 space-y-2">
        <div className="mt-4 h-4 w-[88%] max-w-[200px] rounded bg-stone-100" />
        <div className="h-3 w-full rounded bg-stone-100" />
        <div className="h-3 w-[72%] rounded bg-stone-100" />
      </div>
      <div className="mt-5 h-10 w-full rounded-full bg-stone-100" />
    </div>
  );
}
