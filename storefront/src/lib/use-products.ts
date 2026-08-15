"use client";

import { useCallback, useEffect, useState } from "react";
import { useStoreEvents } from "@/lib/use-store-events";
import type { Category, Product } from "@/lib/products";

export type ProductsState = {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

type Options = {
  /** عند التحديد يُحمّل فقط منتجات هذا التصنيف من الـ API */
  categoryId?: string | null;
};

export const useProducts = (options?: Options): ProductsState => {
  const categoryId = options?.categoryId;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        categoryId && categoryId !== "all"
          ? `/api/products?category=${encodeURIComponent(categoryId)}`
          : "/api/products";
      const response = await fetch(url);
      if (!response.ok) {
        setError("تعذر تحميل المنتجات حالياً.");
        setProducts([]);
        setCategories([]);
        return;
      }
      const data = (await response.json()) as {
        products?: Product[];
        categories?: Category[];
      };
      setProducts(data.products ?? []);
      setCategories(data.categories ?? []);
    } catch {
      setError("تعذر تحميل المنتجات حالياً.");
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { load(); }, [load]);

  // Real-time update via SSE
  useStoreEvents((type) => {
    if (type === "products" || type === "categories" || type === "all") load();
  });

  return { products, categories, loading, error, refresh: load };
};
