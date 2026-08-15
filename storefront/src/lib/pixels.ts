/**
 * طبقة موحدة للأحداث: إطلاق نفس الحدث على Meta Pixel و TikTok Pixel معاً
 *
 * خريطة الأحداث:
 * - PageView        → layout (تحميل أي صفحة)
 * - ViewContent     → صفحة منتج [id]
 * - AddToCart       → الرئيسية، قائمة المنتجات، صفحة منتج (عند الضغط اشتري الآن)
 * - AddPaymentInfo  → صفحة الدفع (عند عرض نموذج الدفع)
 * - Purchase        → صفحة النجاح /checkout/success (بعد إتمام الطلب)
 */

import * as meta from "./meta-pixel";
import * as tiktok from "./tiktok-pixel";

export type PixelItem = {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  category?: string;
};

export type PixelPayload = {
  items: PixelItem[];
  total?: number;
  orderId?: string;
};

export const trackAddToCart = (item: PixelItem) => {
  meta.trackAddToCart(item);
  tiktok.trackAddToCart(item);
};

export const trackViewContent = (item: PixelItem) => {
  meta.trackViewContent(item);
  tiktok.trackViewContent(item);
};

export const trackInitiateCheckout = (payload: PixelPayload) => {
  meta.trackInitiateCheckout(payload);
  tiktok.trackInitiateCheckout(payload);
};

export const trackAddPaymentInfo = (payload: PixelPayload) => {
  meta.trackAddPaymentInfo(payload);
  tiktok.trackAddPaymentInfo(payload);
};

export const trackPurchase = (payload: PixelPayload) => {
  meta.trackPurchase(payload);
  tiktok.trackPurchase(payload);
};
