import { Suspense } from "react";
import { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/api";
import type { FilterState } from "@/types";
import { ProductsGrid } from "@/components/store/ProductsGrid";
import { FiltersPanel } from "@/components/store/FiltersPanel";
import { SortSelect } from "@/components/store/SortSelect";

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string; search?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const title = params.search ? `نتائج البحث: ${params.search}` : params.category ? "تصفح القسم" : "كل المنتجات";
  return { title };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sortParam = (params.sort as FilterState["sort"]) || "default";
  const [categories, productsData] = await Promise.all([
    getCategories(),
    getProducts({
      category: params.category,
      sort: sortParam,
      search: params.search,
      page: params.page ? Number(params.page) : 1,
    }),
  ]);

  const activeCategory = params.category ? categories.find((c) => c.id === params.category) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900">
          {params.search ? `نتائج: "${params.search}"` : activeCategory ? activeCategory.name : "كل المنتجات"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{productsData.meta.total} منتج</p>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <FiltersPanel categories={categories} searchParams={params} />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <FiltersPanel categories={categories} searchParams={params} mobile />
          </div>
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <span className="text-sm text-gray-500">{productsData.meta.total} منتج</span>
            <SortSelect current={params.sort} />
          </div>
          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid products={productsData.products} meta={productsData.meta} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="mb-3 aspect-square rounded-2xl bg-gray-100" />
          <div className="mb-2 h-3 w-2/3 rounded bg-gray-100" />
          <div className="mb-2 h-4 rounded bg-gray-100" />
          <div className="h-4 w-1/2 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
