"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types";

interface FiltersPanelProps {
  categories: Category[];
  searchParams: Record<string, string | undefined>;
  mobile?: boolean;
}

export function FiltersPanel({ categories, searchParams, mobile }: FiltersPanelProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();

  const applyFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(sp.toString());
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`?${params.toString()}`);
    setDrawerOpen(false);
  };

  const clearAll = () => {
    router.push("/products");
    setDrawerOpen(false);
  };

  const activeCategory = searchParams.category;
  const hasFilters = !!searchParams.category;

  const FiltersContent = () => (
    <div className="space-y-6">
      {hasFilters && (
        <button onClick={clearAll} className="flex items-center gap-1.5 text-xs text-red-500 transition-colors hover:text-red-700">
          <X size={12} />
          مسح كل الفلاتر
        </button>
      )}
      <div>
        <h4 className="mb-3 text-sm font-medium text-dark-900">القسم</h4>
        <div className="space-y-1">
          <button
            onClick={() => applyFilter("category", null)}
            className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${!activeCategory ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-brand-50"}`}
          >
            كل المنتجات
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => applyFilter("category", cat.id)}
              className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${activeCategory === cat.id ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-brand-50"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium text-dark-900">الترتيب</h4>
        <div className="space-y-1">
          {[
            { label: "الافتراضي", value: "default" },
            { label: "السعر: من الأقل", value: "price_asc" },
            { label: "السعر: من الأعلى", value: "price_desc" },
            { label: "حسب الاسم", value: "name" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyFilter("sort", opt.value === "default" ? null : opt.value)}
              className={`w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${(searchParams.sort || "default") === opt.value ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-brand-50"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400"
        >
          <SlidersHorizontal size={15} />
          فلترة وترتيب
          {hasFilters && <span className="h-2 w-2 rounded-full bg-brand-500" />}
        </button>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className="h-full w-72 overflow-y-auto bg-white p-5">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-medium text-dark-900">الفلاتر</h3>
                <button onClick={() => setDrawerOpen(false)} className="text-gray-400 transition-colors hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <FiltersContent />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="sticky top-24">
      <h3 className="mb-4 text-sm font-medium text-dark-900">الفلاتر</h3>
      <FiltersContent />
    </div>
  );
}
