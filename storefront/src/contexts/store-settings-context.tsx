"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MergedStoreSettings } from "@/lib/merge-remote-store";
import { getLocalFallbackStore } from "@/lib/merge-remote-store";

type Ctx = {
  store: MergedStoreSettings;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const StoreSettingsContext = createContext<Ctx | null>(null);

export function StoreSettingsProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<MergedStoreSettings>(() => getLocalFallbackStore());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/store", { cache: "no-store" });
      if (!res.ok) {
        setStore(getLocalFallbackStore());
        setError("تعذر تحميل إعدادات المتجر.");
        return;
      }
      const data = (await res.json()) as MergedStoreSettings;
      setStore(data);
    } catch {
      setStore(getLocalFallbackStore());
      setError("تعذر تحميل إعدادات المتجر.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--color-primary", store.primaryColor);
    r.style.setProperty("--color-primary-600", store.primaryColor600);
  }, [store.primaryColor, store.primaryColor600]);

  const value = useMemo(
    () => ({ store, loading, error, refresh }),
    [store, loading, error, refresh],
  );

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings(): Ctx {
  const ctx = useContext(StoreSettingsContext);
  if (!ctx) {
    throw new Error("useStoreSettings must be used within StoreSettingsProvider");
  }
  return ctx;
}

/** بكسلات التحليلات — تُحمَّل بعد جلب `/api/store` (تتجاوز أو تُكمّل NEXT_PUBLIC_*). */
/**
 * يطلق PageView على Meta Pixel و TikTok Pixel عند كل تنقّل داخل المتجر (SPA)،
 * بعد أول تحميل (الذي يطلقه سكربت التحميل نفسه). لا يُطلق شيئاً عند البداية.
 */
function PixelPageViewTracker() {
  const pathname = usePathname();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (prev.current === null) {
      prev.current = pathname;
      return;
    }
    if (prev.current === pathname) return;
    prev.current = pathname;
    if (typeof window === "undefined") return;
    const fbq = (window as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") fbq("track", "PageView");
    const ttq = (window as { ttq?: { page: () => void } }).ttq;
    if (ttq && typeof ttq.page === "function") ttq.page();
  }, [pathname]);

  return null;
}

type ParsedSnippet = {
  scripts: { key: string; src?: string; body?: string }[];
  html: string;
};

function parseHeadSnippet(raw: string): ParsedSnippet {
  const scripts: ParsedSnippet["scripts"] = [];
  const html = raw.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>|<script\b([^>]*)\/>/g, (_m, attrs1, body, attrs2) => {
    const attrs = attrs1 || attrs2 || "";
    const src = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/);
    scripts.push({
      key: `cs-${scripts.length}`,
      src: src ? src[1] : undefined,
      body: body && body.trim() ? body : undefined,
    });
    return "";
  });
  return { scripts, html: html.trim() };
}

/** يحقن `custom_head_snippet` المُعد من اللوحة (سكربتات عبر next/script + بقية HTML). */
function CustomHeadSnippetLoader() {
  const { store } = useStoreSettings();
  const snippet = store.customHeadSnippet;
  if (!snippet) return null;

  const parsed = parseHeadSnippet(snippet);

  return (
    <>
      {parsed.scripts.map((s) =>
        s.src ? (
          <Script key={s.key} src={s.src} strategy="afterInteractive" />
        ) : s.body ? (
          <Script key={s.key} id={s.key} strategy="afterInteractive">
            {s.body}
          </Script>
        ) : null,
      )}
      {parsed.html ? <div dangerouslySetInnerHTML={{ __html: parsed.html }} /> : null}
    </>
  );
}

export function StorePixelsScripts() {
  return (
    <>
      <PixelPageViewTracker />
      <CustomHeadSnippetLoader />
    </>
  );
}
