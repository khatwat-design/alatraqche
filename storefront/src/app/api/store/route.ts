import { NextResponse } from "next/server";
import { mergeRemoteStore, getLocalFallbackStore } from "@/lib/merge-remote-store";
import { fetchRemoteStorePayload } from "@/lib/store-api";
import { isStandaloneStore } from "@/lib/store-mode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (isStandaloneStore()) {
    return NextResponse.json(getLocalFallbackStore());
  }
  const remote = await fetchRemoteStorePayload();
  const merged = mergeRemoteStore(remote);
  return NextResponse.json(merged);
}
