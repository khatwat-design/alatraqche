import { readFileSync } from "fs";
import path from "path";
import type { Category, Product } from "@/lib/products";

const PRODUCTS_PATH = path.join(process.cwd(), "data", "products.json");
const CATEGORIES_PATH = path.join(process.cwd(), "data", "categories.json");

function normalizeProduct(raw: Product & { categoryId?: string }): Product {
  return {
    ...raw,
    categoryId: raw.categoryId ?? "bedding",
  };
}

export function getCategoriesFromJson(): Category[] {
  try {
    const data = readFileSync(CATEGORIES_PATH, "utf-8");
    const parsed = JSON.parse(data) as Category[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getProductsFromJson(): Product[] {
  try {
    const data = readFileSync(PRODUCTS_PATH, "utf-8");
    const parsed = JSON.parse(data) as Product[];
    return Array.isArray(parsed)
      ? parsed.filter((p) => p.isVisible !== false).map(normalizeProduct)
      : [];
  } catch {
    return [];
  }
}

export function getProductByIdFromJson(id: string): Product | null {
  const products = getProductsFromJson();
  return products.find((p) => p.id === id) ?? null;
}
