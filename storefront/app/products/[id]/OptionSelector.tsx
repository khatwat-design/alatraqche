"use client";

import { formatPrice } from "@/lib/api";
import type { Product } from "@/types";

export function OptionSelector({ product }: { product: Product }) {
  return (
    <div className="space-y-4">
      {product.options.map((opt) => (
        <div key={opt.id}>
          <h4 className="mb-2 text-sm font-semibold text-dark-900">{opt.name}</h4>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((val) => (
              <span
                key={val.id}
                data-option-id={opt.id}
                data-value-id={val.id}
                data-price-adjustment={val.priceAdjustment}
                onClick={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.querySelectorAll<HTMLElement>("[data-option-id]").forEach((el) => {
                      el.classList.remove("border-brand-600", "bg-brand-600", "text-white");
                      el.classList.add("border-gray-200", "bg-gray-50", "text-gray-700");
                    });
                  }
                  e.currentTarget.classList.remove("border-gray-200", "bg-gray-50", "text-gray-700");
                  e.currentTarget.classList.add("border-brand-600", "bg-brand-600", "text-white");
                  window.dispatchEvent(
                    new CustomEvent("option-change", {
                      detail: { optionId: opt.id, valueId: val.id, value: val.value },
                    })
                  );
                }}
                className="cursor-pointer select-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 transition-all hover:border-brand-500"
              >
                {val.value}
                {val.priceAdjustment > 0 && <span className="mr-1 text-xs opacity-70">+{formatPrice(val.priceAdjustment)}</span>}
                {val.priceAdjustment < 0 && <span className="mr-1 text-xs opacity-70">{formatPrice(val.priceAdjustment)}</span>}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
