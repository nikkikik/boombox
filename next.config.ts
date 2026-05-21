import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return [
      { source: "/icon.png", destination: "/icon" },
      { source: "/splash.png", destination: "/splash" },
      { source: "/image.png", destination: "/opengraph-image" },
    ];
  },
};

export default nextConfig;
