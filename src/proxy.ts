import { NextRequest, NextResponse } from "next/server";
import { normalizeLocale } from "@/lib/i18n/config";

const PUBLIC_ACCOUNT_PATHS = ["/account/login", "/account/register", "/account/forgot-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
    return NextResponse.redirect(new URL("/admin", apiUrl.replace(/\/api\/v1\/?$/, "")));
  }
  const protectedAccount = pathname.startsWith("/account") && !PUBLIC_ACCOUNT_PATHS.includes(pathname) && !pathname.startsWith("/account/reset-password/");
  if (!protectedAccount) return NextResponse.next();
  const token = request.cookies.get("kw_api_token")?.value;
  if (!token) return loginRedirect(request);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const locale = normalizeLocale(request.cookies.get("locale")?.value);
  const response = await fetch(`${baseUrl}/auth/me`, { headers: { Accept: "application/json", "Accept-Language": locale, Authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => null);
  if (!response?.ok) return loginRedirect(request);
  return NextResponse.next();
}

function loginRedirect(request: NextRequest) {
  const url = new URL("/account/login", request.nextUrl.origin);
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
