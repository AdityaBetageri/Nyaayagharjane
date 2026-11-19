import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: false },
      { source: "/index", destination: "/", permanent: false },
      { source: "/website", destination: "/", permanent: false },
      { source: "/site", destination: "/", permanent: false },
      { source: "/web", destination: "/", permanent: false },
      { source: "/home", destination: "/", permanent: false },
      { source: "/public", destination: "/", permanent: false },
      { source: "/reader", destination: "/reader/2026-11", permanent: false },
    ];
  },
};

export default nextConfig;
