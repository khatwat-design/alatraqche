"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    fbq?: (action: string, ...args: unknown[]) => void;
  }
}

/**
 * Loads Meta Pixel using runtime config from /api/config.
 * This way NEXT_PUBLIC_META_PIXEL_ID set on the server (e.g. Hostinger) works
 * without needing to rebuild the app.
 */
export default function MetaPixelLoader() {
  const [pixelId, setPixelId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: { metaPixelId?: string }) => {
        const id = data.metaPixelId?.trim();
        if (id) setPixelId(id);
      })
      .catch(() => {});
  }, []);

  const handleLoad = () => {
    if (typeof window === "undefined" || !window.fbq || !pixelId) return;
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  };

  if (!pixelId) return null;

  return (
    <>
      <Script
        id="meta-pixel-sdk"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
      <noscript>
        <img
          height={1}
          width={1}
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
