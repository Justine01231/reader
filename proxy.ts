import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic auth checks. The actual authorization happens in each protected
// page and every Server Action via the data access layer (lib/auth/dal.ts).
// Proxy only redirects based on cookie presence to avoid protecting static
// routes with database work.

const authenticatedOnly = ["/library", "/search", "/settings"];

function isAuthenticatedOnly(pathname: string): boolean {
  return authenticatedOnly.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get("session")?.value);

  if (pathname === "/login" || pathname === "/register") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    return NextResponse.next();
  }

  if (pathname === "/" && hasSession) {
    return NextResponse.next();
  }

  if (isAuthenticatedOnly(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};