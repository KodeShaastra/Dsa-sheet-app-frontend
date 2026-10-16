import { NextResponse, type NextRequest } from "next/server";

// Must match the backend's REFRESH_COOKIE_NAME. We check the 7-day refresh cookie, not the
// 15-minute access cookie, so people aren't sent to /login while their session is still valid.
const REFRESH_COOKIE = "dsa_refresh";

const PROTECTED = ["/sheet", "/calendar"];
const AUTH_PAGES = ["/login", "/signup"];

const isUnder = (path: string, roots: string[]) =>
  roots.some((root) => path === root || path.startsWith(`${root}/`));

/**
 * Optimistic route guard: it only checks that the cookie exists. Express does the real check,
 * and lib/api.ts handles an expired session.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);

  if (!hasSession && isUnder(pathname, PROTECTED)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/sheet", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sheet/:path*", "/calendar/:path*", "/login", "/signup"],
};
