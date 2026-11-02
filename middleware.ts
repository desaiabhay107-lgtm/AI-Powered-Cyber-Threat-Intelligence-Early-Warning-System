import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Base64Url decode helper
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  try {
    return atob(base64);
  } catch {
    return "";
  }
}

// Protected route paths
const protectedPaths = [
  "/dashboard",
  "/threats",
  "/iocs",
  "/cves",
  "/alerts",
  "/ai",
  "/reports",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("emberwatch_token")?.value;

  const isProtected = protectedPaths.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/auth/");

  let isValidSession = false;
  let userRole = "";

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadStr = base64UrlDecode(parts[1]);
        if (payloadStr) {
          const payload = JSON.parse(payloadStr);
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp > now && payload.userId) {
            isValidSession = true;
            userRole = payload.role || "analyst";
          }
        }
      }
    } catch {
      isValidSession = false;
    }
  }

  // 1. If accessing protected routes without valid session, redirect to login
  if (isProtected && !isValidSession) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already logged in and visiting login page, redirect to dashboard
  if (isAuthPage && isValidSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Strict RBAC for Settings / Admin configuration
  if (pathname.startsWith("/settings") && isValidSession && userRole !== "admin") {
    // Only Admin can configure feeds and manage users
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/threats/:path*",
    "/iocs/:path*",
    "/cves/:path*",
    "/alerts/:path*",
    "/ai/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/auth/:path*",
    "/admin/:path*",
  ],
};
