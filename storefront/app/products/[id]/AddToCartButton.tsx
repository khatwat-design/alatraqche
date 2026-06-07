"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/api";
import type { Product, SelectedOption } from "@/types";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [selected, setSelected] = useState<SelectedOption[]>([]);
  const [displayPrice, setDisplayPrice] = useState(product.price);

  const updatePrice = useCallback(() => {
    let adj = 0;
    for (const sel of selected) {
      const opt = product.options.find((o) => o.id === sel.optionId);
      const val = opt?.values.find((v) => v.id === sel.valueId);
      adj += val?.priceAdjustment ?? 0;
    }
    setDisplayPrice(product.price + adj);
  }, [selected, product.price, product.options]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { optionId: number; valueId: number; value: string };
      setSelected((prev) => {
        const filtered = prev.filter((s) => s.optionId !== detail.optionId);
        return [...filtered, { optionId: detail.optionId, valueId: detail.valueId, value: detail.value }];
      });
    };
    window.addEventListener("option-change", handler);
    return () => window.removeEventListener("option-change", handler);
  }, []);

  useEffect(() => {
    updatePrice();
  }, [updatePrice]);

  const handleAdd = () => {
    addItem(product, 1, selected);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const hasOptions = product.options.length > 0;
  const allSelected = !hasOptions || product.options.every((opt) => selected.some((s) => s.optionId === opt.id));
  const canAdd = !hasOptions || allSelected;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg text-gray-500">المجموع:</span>
        <span className="text-xl font-bold text-dark-900">{formatPrice(displayPrice)}</span>
      </div>
      <button
        onClick={handleAdd}
        disabled={!canAdd}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
          added
            ? "bg-green-500 text-white"
            : !canAdd
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : "btn-primary shadow-lg"
        }`}
      >
        <ShoppingCart size={18} />
        {added ? "تمت الإضافة ✓" : !canAdd ? "اختر الخيارات أولاً" : "أضف للسلة"}
      </button>
    </div>
  );
}
