"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface ProductsGridProps {
  products: Product[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export function ProductsGrid({ products, meta }: ProductsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mb-4 text-5xl">🔍</div>
        <h3 className="mb-2 text-lg font-medium text-dark-900">لا توجد منتجات</h3>
        <p className="mb-5 text-sm text-gray-500">جرب تغيير الفلاتر أو ابحث بكلمة مختلفة</p>
        <Link href="/products" className="text-sm text-brand-600 underline underline-offset-2">
          عرض كل المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {meta.last_page > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(meta.current_page - 1)}
            disabled={meta.current_page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
          {Array.from({ length: meta.last_page }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                    p === meta.current_page
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-gray-200 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => goToPage(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
