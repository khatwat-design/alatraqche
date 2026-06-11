"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/api";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const mainImage = product.images?.[0]?.url ?? product.image ?? "/images/placeholder.svg";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block focus:outline-none">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square bg-gray-50">
          {!imgLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onLoad={() => setImgLoaded(true)}
          />
          {product.badge && (
            <div className="absolute right-3 top-3 z-10">
              <span className="badge-gold">{product.badge}</span>
            </div>
          )}

          {/* Quick view hint */}
          <div className="absolute left-3 top-3 z-10 opacity-100 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dark-500 shadow-sm backdrop-blur-sm">
              <Eye size={14} />
            </span>
          </div>

          {/* Add to cart button overlay */}
          <div className="absolute inset-x-3 bottom-3 z-10">
            <button
              onClick={handleAdd}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold shadow-lg transition-all duration-200 ${
                added
                  ? "bg-green-500 text-white shadow-green-500/30"
                  : "bg-dark-950/90 text-white opacity-100 translate-y-0 hover:bg-dark-950 md:opacity-0 md:translate-y-2 md:group-hover:translate-y-0 md:group-hover:opacity-100"
              }`}
            >
              {added ? (
                <>تمت الإضافة ✓</>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  أضف للسلة
                </>
              )}
            </button>
          </div>
        </div>
        <div className="p-3.5">
          <p className="mb-1 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
            {product.category}
          </p>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-dark-900 transition-colors group-hover:text-brand-600">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-dark-900">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={handleAdd}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg gold-gradient text-white shadow-sm opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 hover:shadow-md"
            >
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
