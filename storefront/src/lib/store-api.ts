import type { Category, Product } from "@/lib/products";
import type { BannerPayload, RemoteStorePayload } from "@/lib/store-settings-types";
import { getStoreApiBaseUrl } from "@/lib/store-api-url";

/** عند ضبط `STORE_API_BASE_URL` يُجلب الكتالوج من لوحة Laravel (مثلاً http://127.0.0.1:8000/api/v1). */
export async function fetchStoreCatalogFromApi(): Promise<{
  products: Product[];
  categories: Category[];
} | null> {
  const root = getStoreApiBaseUrl();
  if (!root) return null;

  try {
    const [prodRes, catRes] = await Promise.all([
      fetch(`${root}/products`),
      fetch(`${root}/categories`),
    ]);
    if (!prodRes.ok || !catRes.ok) return null;
    const prodJson = (await prodRes.json()) as { products?: Product[] };
    const categories = (await catRes.json()) as Category[];
    const products = Array.isArray(prodJson.products) ? prodJson.products : [];
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

export async function fetchRemoteBanners(): Promise<BannerPayload[] | null> {
  const root = getStoreApiBaseUrl();
  if (!root) return null;
  try {
    const res = await fetch(`${root}/banners`);
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    return Array.isArray(json) ? (json as BannerPayload[]) : [];
  } catch {
    return null;
  }
}
