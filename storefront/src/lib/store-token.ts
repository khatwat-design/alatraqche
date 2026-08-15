export const STORE_TOKEN_STORAGE_KEY = "alatraqche_store_token";

export const STORE_TOKEN_CHANGED_EVENT = "alatraqche-store-token-changed";

export function getStoreTokenFromBrowser(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORE_TOKEN_STORAGE_KEY);
}

export function setStoreTokenInBrowser(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(STORE_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(STORE_TOKEN_STORAGE_KEY);
  }
  window.dispatchEvent(new Event(STORE_TOKEN_CHANGED_EVENT));
}
