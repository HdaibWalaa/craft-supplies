import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_ACCOUNT_PATHS = ["/account/login", "/account/register", "/account/forgot-password"];
const PUBLIC_ACCOUNT_PREFIXES = ["/account/reset-password/"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.includes(pathname);
  const isAccountRoute =
    pathname.startsWith("/account") &&
    !PUBLIC_ACCOUNT_PATHS.includes(pathname) &&
    !PUBLIC_ACCOUNT_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isAdminRoute) {
    if (!req.auth?.user || req.auth.user.role !== "ADMIN") {
      const url = new URL("/admin/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isAccountRoute) {
    if (!req.auth?.user) {
      const url = new URL("/account/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
