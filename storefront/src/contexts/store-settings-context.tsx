"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
export function StorePixelsScripts() {
  const { store } = useStoreSettings();
  const ga = store.googleAnalyticsId?.trim();
  const meta = store.metaPixelId?.trim();
  const tt = store.tiktokPixelId?.trim();

  return (
    <>
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id={`store-ga-${ga}`} strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga}');
            `}
          </Script>
        </>
      ) : null}
      {meta ? (
        <>
          <Script id={`store-meta-${meta}`} strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`}
          </Script>
          <noscript>
            <img
              height={1}
              width={1}
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${meta}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      ) : null}
      {tt ? (
        <Script id={`store-tt-${tt}`} strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript";a.async=!0;a.src=r+"?sdkid="+e+"&lib="+t;var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)};}(window,document,'ttq');ttq.load('${tt}');ttq.page();`}
        </Script>
      ) : null}
    </>
  );
}
