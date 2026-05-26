"use client";

import { useEffect, useRef, useCallback } from "react";

export type StoreChangeType = "banners" | "products" | "categories" | "coupons" | "all";

type Handler = (type: StoreChangeType) => void;

const LISTENERS = new Set<Handler>();
let sseInstance: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function getEventsUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return `${base}/api/store-events`;
}

function connectSSE() {
  if (typeof window === "undefined") return;
  if (sseInstance && sseInstance.readyState !== EventSource.CLOSED) return;

  sseInstance = new EventSource(getEventsUrl());

  sseInstance.addEventListener("change", (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data) as { type?: StoreChangeType };
      const type: StoreChangeType = data.type ?? "all";
      LISTENERS.forEach((fn) => fn(type));
    } catch {}
  });

  sseInstance.addEventListener("error", () => {
    sseInstance?.close();
    sseInstance = null;
    // Reconnect after 5 seconds
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectSSE, 5_000);
  });
}

function disconnectSSE() {
  if (LISTENERS.size > 0) return; // Still have listeners
  if (reconnectTimer) clearTimeout(reconnectTimer);
  sseInstance?.close();
  sseInstance = null;
}

/**
 * Hook — subscribe to real-time store change events from Laravel SSE.
 * Calls `onChange(type)` immediately when the admin saves/deletes
 * a Banner, Product, Category, or Coupon.
 */
export function useStoreEvents(onChange: Handler) {
  const handlerRef = useRef(onChange);
  handlerRef.current = onChange;

  const stable = useCallback((type: StoreChangeType) => {
    handlerRef.current(type);
  }, []);

  useEffect(() => {
    LISTENERS.add(stable);
    connectSSE();
    return () => {
      LISTENERS.delete(stable);
      disconnectSSE();
    };
  }, [stable]);
}
