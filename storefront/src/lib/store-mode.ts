/**
 * النسخة المستقلة: كتالوج من `data/*.json`، طلبات عبر تيليغرام + Google Sheets فقط.
 * فعّلها بـ `NEXT_PUBLIC_STORE_STANDALONE=true` (انظر `.env.standalone.example`).
 */
export function isStandaloneStore(): boolean {
  return process.env.NEXT_PUBLIC_STORE_STANDALONE === "true";
}
