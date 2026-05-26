import { NextResponse } from "next/server";

/**
 * Public config for the client (e.g. Meta Pixel ID).
 * Reads env at request time so Hostinger/runtime env vars work without rebuild.
 */
export function GET() {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
  return NextResponse.json({ metaPixelId });
}
