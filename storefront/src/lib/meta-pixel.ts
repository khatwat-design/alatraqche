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

const getFbq = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const fbq = (window as { fbq?: (...args: any[]) => void }).fbq;
  return typeof fbq === "function" ? fbq : null;
};

const normalizeContents = (items: PixelItem[]) =>
  items.map((item) => ({
    id: item.id,
    quantity: item.quantity ?? 1,
    item_price: item.price ?? 0,
  }));

export const trackAddToCart = (item: PixelItem) => {
  const fbq = getFbq();
  if (!fbq) {
    return;
  }
  const quantity = item.quantity ?? 1;
  const value = (item.price ?? 0) * quantity;
  fbq("track", "AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    ...(item.category && { content_category: item.category }),
    value,
    currency: "IQD",
    contents: normalizeContents([{ ...item, quantity }]),
  });
};

export const trackInitiateCheckout = (payload: PixelPayload) => {
  const fbq = getFbq();
  if (!fbq) {
    return;
  }
  const totalItems = payload.items.reduce(
    (sum, item) => sum + (item.quantity ?? 1),
    0,
  );
  fbq("track", "InitiateCheckout", {
    content_ids: payload.items.map((item) => item.id),
    content_type: "product",
    value: payload.total ?? 0,
    currency: "IQD",
    num_items: totalItems,
    contents: normalizeContents(payload.items),
  });
};

export const trackPurchase = (payload: PixelPayload) => {
  const fbq = getFbq();
  if (!fbq) {
    return;
  }
  fbq("track", "Purchase", {
    content_ids: payload.items.map((item) => item.id),
    content_type: "product",
    value: payload.total ?? 0,
    currency: "IQD",
    contents: normalizeContents(payload.items),
    order_id: payload.orderId,
  });
};

/** عرض محتوى منتج (صفحة منتج أو تفاصيل) */
export const trackViewContent = (item: PixelItem) => {
  const fbq = getFbq();
  if (!fbq) {
    return;
  }
  const quantity = item.quantity ?? 1;
  const value = (item.price ?? 0) * quantity;
  fbq("track", "ViewContent", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    ...(item.category && { content_category: item.category }),
    value,
    currency: "IQD",
    contents: normalizeContents([{ ...item, quantity }]),
  });
};

/** بدء إدخال بيانات الدفع (صفحة الدفع) */
export const trackAddPaymentInfo = (payload: PixelPayload) => {
  const fbq = getFbq();
  if (!fbq) {
    return;
  }
  fbq("track", "AddPaymentInfo", {
    content_ids: payload.items.map((item) => item.id),
    content_type: "product",
    value: payload.total ?? 0,
    currency: "IQD",
    contents: normalizeContents(payload.items),
  });
};
