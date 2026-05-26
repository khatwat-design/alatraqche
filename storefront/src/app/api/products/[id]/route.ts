import { NextResponse, type NextRequest } from "next/server";
import { getProductByIdFromJson } from "@/lib/products-data";
import { fetchProductFromApi } from "@/lib/store-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const product =
    (await fetchProductFromApi(id)) ?? getProductByIdFromJson(id);
  if (!product) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }
  return NextResponse.json({ product });
}
