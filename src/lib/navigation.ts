/**
 * The `?next=` value, if it's a safe in-app path. Anything else (another site, "//evil.com",
 * "javascript:") falls back to /sheet, so the login page can't be used to send people elsewhere.
 */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/sheet";
  }
  return next;
}

/** /login?next=<where the user is now>. */
export function loginUrlFor(path: string): string {
  return `/login?next=${encodeURIComponent(path)}`;
}

/**
 * Full page load. Use right after logging in or out: the auth cookies just changed, and a normal
 * client-side navigation could reuse a page (or a route-guard redirect) prefetched under the old cookies.
 */
export function navigateAfterAuthChange(path: string) {
  window.location.replace(path);
}
