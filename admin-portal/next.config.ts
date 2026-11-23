import type { NextConfig } from "next";
import dns from "node:dns";
import path from "node:path";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
