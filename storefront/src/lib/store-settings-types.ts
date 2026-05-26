/** استجابة `GET /api/v1/store` من لوحة Laravel */
export type RemoteStorePayload = {
  storeName?: string | null;
  sloganLine1?: string | null;
  sloganLine2?: string | null;
  sloganHighlightPhrase?: string | null;
  metaTitle?: string | null;
  headerBackground?: string | null;
  footerBackground?: string | null;
  primaryColor?: string | null;
  logoUrl?: string | null;
  addressLine?: string | null;
  mapLat?: string | number | null;
  mapLng?: string | number | null;
  mapEmbedUrl?: string | null;
  phones?: string[] | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  metaPixelId?: string | null;
  tiktokPixelId?: string | null;
  googleAnalyticsId?: string | null;
  snapchatPixelId?: string | null;
  twitterPixelId?: string | null;
  customHeadSnippet?: string | null;
};

export type BannerPayload = {
  id: number;
  title?: string | null;
  image: string;
  linkUrl?: string | null;
};
