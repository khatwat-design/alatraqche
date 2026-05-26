import { NextResponse, type NextRequest } from "next/server";
import {
  getCategoriesFromJson,
  getProductsFromJson,
} from "@/lib/products-data";
import { fetchStoreCatalogFromApi } from "@/lib/store-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("category");

  const fromApi = await fetchStoreCatalogFromApi();
  let products = fromApi?.products ?? getProductsFromJson();
  const categories = fromApi?.categories ?? getCategoriesFromJson();

  if (categoryId) {
    products = products.filter((p) => p.categoryId === categoryId);
  }

  return NextResponse.json({ products, categories });
}
