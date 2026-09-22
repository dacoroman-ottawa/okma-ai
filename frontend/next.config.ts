import type { NextConfig } from "next";

const backendUrl = process.env.INTERNAL_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // API proxy configuration - /api/* routes are proxied to backend
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/:path*` },
    ];
  },
};

export default nextConfig;
