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
        <div className="mb-4 text-6xl">🔍</div>
        <h3 className="mb-2 text-lg font-medium text-dark-900">لا توجد منتجات</h3>
        <p className="mb-6 text-sm text-gray-500">جرب تغيير الفلاتر أو ابحث بكلمة مختلفة</p>
        <Link
          href="/products"
          className="btn-primary text-sm"
        >
          عرض كل المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product, idx) => (
          <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(meta.current_page - 1)}
            disabled={meta.current_page === 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 disabled:hover:bg-transparent"
          >
            <ChevronRight size={18} />
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
                <span key={`e${i}`} className="flex h-10 w-10 items-center justify-center text-sm text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                    p === meta.current_page
                      ? "gold-gradient text-white border-brand-600 shadow-md"
                      : "border-gray-200 text-dark-700 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => goToPage(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
