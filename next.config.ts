import type { NextConfig } from "next";

// Send /api/* to the Express backend so the browser sees one origin (cookies just work).
// Dev: defaults to localhost:4000. Production: off unless BACKEND_URL is set, because Nginx does this routing.
const backendUrl =
  process.env.BACKEND_URL ??
  (process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    if (!backendUrl) return [];
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
