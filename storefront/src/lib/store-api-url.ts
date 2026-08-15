import { isStandaloneStore } from "@/lib/store-mode";

/** عنوان Laravel API (مثلاً `http://127.0.0.1:8000/api/v1`) — للاستخدام من الخادم فقط عادةً */
export function getStoreApiBaseUrl(): string | null {
  if (isStandaloneStore()) return null;
  const raw = process.env.STORE_API_BASE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}
