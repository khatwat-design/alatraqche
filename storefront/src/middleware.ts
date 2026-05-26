import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isStandaloneStore } from "@/lib/store-mode";

export function middleware(request: NextRequest) {
  if (!isStandaloneStore()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/account")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    pathname.startsWith("/api/store/auth") ||
    pathname.startsWith("/api/store/my") ||
    pathname === "/api/store/me"
  ) {
    return NextResponse.json(
      { message: "غير متاح في النسخة المستقلة للمتجر." },
      { status: 404 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/account/:path*",
    "/api/store/auth/:path*",
    "/api/store/my/:path*",
    "/api/store/me",
  ],
};
