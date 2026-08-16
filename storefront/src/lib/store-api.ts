import type { Category, Product } from "@/lib/products";
import type { RemoteStorePayload } from "@/lib/store-settings-types";
import { getStoreApiBaseUrl } from "@/lib/store-api-url";

/** عند ضبط `STORE_API_BASE_URL` يُجلب الكتالوج من لوحة Laravel (مثلاً http://127.0.0.1:8000/api/v1). */
export async function fetchStoreCatalogFromApi(): Promise<{
  products: Product[];
  categories: Category[];
} | null> {
  const root = getStoreApiBaseUrl();
  if (!root) return null;

  try {
    const catRes = await fetch(`${root}/categories`);
    if (!catRes.ok) return null;
    const categories = (await catRes.json()) as Category[];

    let products: Product[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await fetch(`${root}/products?per_page=100&page=${page}`);
      if (!res.ok) return null;
      const json = (await res.json()) as {
        products?: Product[];
        meta?: { current_page: number; last_page: number };
      };
      products = products.concat(Array.isArray(json.products) ? json.products : []);
      lastPage = json.meta?.last_page ?? 1;
      page += 1;
    } while (page <= lastPage);

    return { products, categories: Array.isArray(categories) ? categories : [] };
  } catch {
    return null;
  }
}

export async function fetchProductFromApi(id: string): Promise<Product | null> {
  const root = getStoreApiBaseUrl();
  if (!root) return null;
  try {
    const res = await fetch(`${root}/products/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { product?: Product };
    return json.product ?? null;
  } catch {
    return null;
  }
}

export async function fetchRemoteStorePayload(): Promise<RemoteStorePayload | null> {
  const root = getStoreApiBaseUrl();
  if (!root) return null;
  try {
    const res = await fetch(`${root}/store`);
    if (!res.ok) return null;
    return (await res.json()) as RemoteStorePayload;
  } catch {
    return null;
  }
}
