import { CONTACT_PHONES, INSTAGRAM_URL } from "@/lib/contact";
import { MAP_LAT, MAP_LNG, STORE_ADDRESS_LINE } from "@/lib/store-location";
import type { RemoteStorePayload } from "@/lib/store-settings-types";
import { whatsappUrlFromDisplayPhone } from "@/lib/whatsapp-from-phone";

export type PhoneEntry = { display: string; whatsapp: string };

/** إعدادات العرض بعد دمج Laravel مع القيم الافتراضية المحلية */
export type MergedStoreSettings = {
  source: "remote" | "local";
  storeName: string;
  sloganLine1: string;
  sloganLine2: string;
  sloganHighlightPhrase: string;
  metaTitle: string;
  headerBackground: string;
  footerBackground: string;
  primaryColor: string;
  primaryColor600: string;
  logoUrl: string;
  addressLine: string;
  mapLat: number;
  mapLng: number;
  mapEmbedUrl: string;
  mapOpenUrl: string;
  phoneEntries: PhoneEntry[];
  instagramUrl: string;
  facebookUrl: string;
  tiktokSocialUrl: string;
  googleAnalyticsId: string;
  metaPixelId: string;
  tiktokPixelId: string;
};

function darkenHex(hex: string, amount = 0.12): string {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return hex;
  const n = (x: string) =>
    Math.max(0, Math.min(255, parseInt(x, 16) * (1 - amount)));
  const r = n(h.slice(0, 2));
  const g = n(h.slice(2, 4));
  const b = n(h.slice(4, 6));
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(Math.round(r))}${to(Math.round(g))}${to(Math.round(b))}`;
}

function normalizeHex(color: string | null | undefined, fallback: string): string {
  if (!color || typeof color !== "string") return fallback;
  const c = color.trim();
  if (c.startsWith("#")) return c.length >= 4 ? c : fallback;
  return `#${c}`;
}

function phoneEntriesFromRemote(phones: string[] | null | undefined): PhoneEntry[] {
  const list = (phones ?? []).map((p) => p.trim()).filter(Boolean);
  if (list.length === 0) {
    return CONTACT_PHONES.map((x) => ({ display: x.display, whatsapp: x.whatsapp }));
  }
  return list.map((display) => ({
    display,
    whatsapp: whatsappUrlFromDisplayPhone(display),
  }));
}

export function mergeRemoteStore(remote: RemoteStorePayload | null): MergedStoreSettings {
  const primary = normalizeHex(remote?.primaryColor, "#b8860b");
  const lat =
    remote?.mapLat != null && remote.mapLat !== "" ? Number(remote.mapLat) : MAP_LAT;
  const lng =
    remote?.mapLng != null && remote.mapLng !== "" ? Number(remote.mapLng) : MAP_LNG;
  const embed =
    remote?.mapEmbedUrl?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL?.trim() ||
    `https://www.google.com/maps?q=${lat},${lng}&hl=ar&z=16&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return {
    source: remote ? "remote" : "local",
    storeName: remote?.storeName?.trim() || "الأطرقجي للسجاد والأثاث والمفروشات",
    sloganLine1: remote?.sloganLine1?.trim() || "الأطرقجي",
    sloganLine2:
      remote?.sloganLine2?.trim() ||
      "مكان يحتاجه كل بيت، نوفر كل أنواع السجاد والمفروشات والأثاث",
    sloganHighlightPhrase:
      remote?.sloganHighlightPhrase?.trim() || "السجاد والمفروشات والأثاث",
    metaTitle:
      remote?.metaTitle?.trim() ||
      "الأطرقجي للسجاد والأثاث والمفروشات | متجر في العراق",
    headerBackground: normalizeHex(remote?.headerBackground, "#000000"),
    footerBackground: normalizeHex(remote?.footerBackground, "#000000"),
    primaryColor: primary,
    primaryColor600: darkenHex(primary, 0.14),
    logoUrl: remote?.logoUrl?.trim() || "/images/logo.png",
    addressLine: remote?.addressLine?.trim() || STORE_ADDRESS_LINE,
    mapLat: lat,
    mapLng: lng,
    mapEmbedUrl: embed,
    mapOpenUrl: openUrl,
    phoneEntries: phoneEntriesFromRemote(remote?.phones ?? null),
    instagramUrl: remote?.instagramUrl?.trim() || INSTAGRAM_URL,
    facebookUrl: remote?.facebookUrl?.trim() || "",
    tiktokSocialUrl: remote?.tiktokUrl?.trim() || "",
    googleAnalyticsId:
      remote?.googleAnalyticsId?.trim() ||
      process.env.NEXT_PUBLIC_GA_ID?.trim() ||
      "",
    metaPixelId:
      remote?.metaPixelId?.trim() ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ||
      "",
    tiktokPixelId:
      remote?.tiktokPixelId?.trim() ||
      process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() ||
      "",
  };
}

export function getLocalFallbackStore(): MergedStoreSettings {
  return mergeRemoteStore(null);
}
