import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function hasSessionCookie(req: NextRequest): boolean {
  const candidates = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];
  return candidates.some((name) => {
    const v = req.cookies.get(name)?.value;
    return typeof v === "string" && v.length > 10;
  });
}

export function middleware(request: NextRequest) {
  try {
    const { pathname, searchParams } = request.nextUrl;
    const isProtected =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/launch") ||
      pathname.startsWith("/api/");

    if (pathname.startsWith("/api/auth")) return NextResponse.next();
    if (pathname.startsWith("/api/storefront/place-order")) return NextResponse.next();
    if (pathname.startsWith("/api/payments/status")) return NextResponse.next();
    if (pathname.startsWith("/api/env/check")) return NextResponse.next();
    if (pathname.startsWith("/api/webhooks/payfast")) return NextResponse.next();
    if (!isProtected) return NextResponse.next();

    if (hasSessionCookie(request)) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set(
      "next",
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")
    );

    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(url);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
