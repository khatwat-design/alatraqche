import { Suspense } from "react";
import CatalogClient from "./catalog-client";
import { ProductCardSkeleton } from "@/components/product-card";

function CatalogFallback() {
  return (
    <div className="space-y-8">
      <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} variant="grid" />
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogClient />
    </Suspense>
  );
}
