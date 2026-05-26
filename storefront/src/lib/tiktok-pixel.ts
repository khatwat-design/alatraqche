/**
 * TikTok Pixel - أحداث تيك توك للتتبع والإعلانات
 * Standard events: https://ads.tiktok.com/help/article/standard-events
 */

type PixelItem = {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  category?: string;
};

type PixelPayload = {
  items: PixelItem[];
  total?: number;
  orderId?: string;
};

declare global {
  interface Window {
    ttq?: { track: (event: string, props?: Record<string, unknown>) => void; load: (id: string) => void; page: () => void };
  }
}

const getTtq = () => {
  if (typeof window === "undefined") return null;
  const ttq = window.ttq;
  return ttq && typeof ttq.track === "function" ? ttq : null;
};

export const trackAddToCart = (item: PixelItem) => {
  const ttq = getTtq();
  if (!ttq) return;
  const quantity = item.quantity ?? 1;
  const value = (item.price ?? 0) * quantity;
  ttq.track("AddToCart", {
    content_id: item.id,
    content_name: item.name,
    content_type: "product",
    ...(item.category && { content_category: item.category }),
    value,
    currency: "IQD",
    quantity,
  });
};

export const trackInitiateCheckout = (payload: PixelPayload) => {
  const ttq = getTtq();
  if (!ttq) return;
  ttq.track("InitiateCheckout", {
    content_type: "product",
    value: payload.total ?? 0,
    currency: "IQD",
    contents: payload.items.map((i) => ({
      content_id: i.id,
      quantity: i.quantity ?? 1,
      content_price: i.price ?? 0,
    })),
  });
};

export const trackPurchase = (payload: PixelPayload) => {
  const ttq = getTtq();
  if (!ttq) return;
  ttq.track("CompletePayment", {
    content_type: "product",
    value: payload.total ?? 0,
    currency: "IQD",
    order_id: payload.orderId,
    contents: payload.items.map((i) => ({
      content_id: i.id,
      quantity: i.quantity ?? 1,
      content_price: i.price ?? 0,
    })),
  });
};

export const trackViewContent = (item: PixelItem) => {
  const ttq = getTtq();
  if (!ttq) return;
  const quantity = item.quantity ?? 1;
  const value = (item.price ?? 0) * quantity;
  ttq.track("ViewContent", {
    content_id: item.id,
    content_name: item.name,
    content_type: "product",
    ...(item.category && { content_category: item.category }),
    value,
    currency: "IQD",
    quantity,
  });
};

export const trackAddPaymentInfo = (payload: PixelPayload) => {
  const ttq = getTtq();
  if (!ttq) return;
  ttq.track("AddPaymentInfo", {
    content_type: "product",
    value: payload.total ?? 0,
    currency: "IQD",
    contents: payload.items.map((i) => ({
      content_id: i.id,
      quantity: i.quantity ?? 1,
      content_price: i.price ?? 0,
    })),
  });
};
