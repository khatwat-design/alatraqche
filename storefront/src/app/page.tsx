"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProducts } from "@/lib/use-products";
import { useCart } from "@/components/cart-context";
import { trackAddToCart } from "@/lib/pixels";
import type { Product } from "@/lib/products";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import StoreHero from "@/components/store-hero";

export default function Home() {
  const { addItem } = useCart();
  const router = useRouter();
  const { products, categories, loading, error, refresh } = useProducts();

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

  const featured = products.slice(0, 8);

  return (
    <div className="space-y-10 md:space-y-14">
      <StoreHero />

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-800">
          {error}{" "}
          <button type="button" onClick={() => refresh()} className="font-semibold underline">
            إعادة المحاولة
          </button>
        </div>
      ) : null}

      <section className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 md:text-2xl">تسوق حسب القسم</h2>
            <p className="text-sm text-[var(--color-muted)]">اختر التصنيف المناسب لبيتك</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            عرض كل المنتجات ←
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-stone-100" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.id)}`}
                  className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-primary)] hover:shadow-md"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="64px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 text-right">
                    <p className="font-semibold text-stone-900 group-hover:text-[var(--color-primary)]">{cat.name}</p>
                    {cat.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-muted)]">{cat.description}</p>
                    ) : null}
                  </div>
                </Link>
              ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 md:text-2xl">مختارات مميزة</h2>
            <p className="text-sm text-[var(--color-muted)]">أفضل المبيعات والوافدين الجدد</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            الكتالوج الكامل ←
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} variant="hero" />)
            : featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="hero"
                  onBuyNow={handleBuyNow}
                  onAddToCart={handleAddToCart}
                />
              ))}
        </div>
      </section>
    </div>
  );
}
