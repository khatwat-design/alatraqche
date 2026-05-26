/** موقع المحل — بغداد، شارع فلسطين، قرب مستشفى الكندي */
export const STORE_ADDRESS_LINE =
  "بغداد - شارع فلسطين - قرب مستشفى الكندي";

export const MAP_LAT = 33.3479;
export const MAP_LNG = 44.41;

export function getMapsEmbedSrc(): string {
  const custom = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL?.trim();
  if (custom) return custom;
  return `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}&hl=ar&z=16&output=embed`;
}

export function getMapsOpenUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${MAP_LAT},${MAP_LNG}`;
}
