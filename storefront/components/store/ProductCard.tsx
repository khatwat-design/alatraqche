"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
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

  const mainImage = product.images?.[0]?.url ?? product.image ?? "/images/placeholder.svg";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg">
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          {product.badge && (
            <div className="absolute right-3 top-3">
              <span className="badge-gold">{product.badge}</span>
            </div>
          )}
          <div className="absolute inset-x-3 bottom-3">
            <button
              onClick={handleAdd}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold shadow-lg transition-all ${
                added
                  ? "translate-y-0 bg-green-500 text-white opacity-100 shadow-green-500/30"
                  : "translate-y-2 bg-dark-950 text-white opacity-0 shadow-black/20 group-hover:translate-y-0 group-hover:opacity-100"
              }`}
            >
              <ShoppingCart size={14} />
              {added ? "تمت الإضافة ✓" : "أضف للسلة"}
            </button>
          </div>
        </div>
        <div className="p-3">
          <p className="mb-1 text-[11px] text-gray-400">{product.category}</p>
          <h3 className="mb-1.5 line-clamp-2 text-sm font-medium leading-snug text-dark-900 transition-colors group-hover:text-brand-600">
            {product.name}
          </h3>
          <span className="text-sm font-bold text-dark-900">{formatPrice(product.price)}</span>
        </div>
      </div>
    </Link>
  );
}
