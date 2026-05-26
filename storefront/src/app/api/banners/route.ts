import { NextResponse } from "next/server";
import { fetchRemoteBanners } from "@/lib/store-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const banners = await fetchRemoteBanners();
  return NextResponse.json({ banners: banners ?? [] });
}
