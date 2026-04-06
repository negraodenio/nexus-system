import type { NextConfig } from "next";

const nextConfig: any = {
  output: process.env.NEXT_STATIC_EXPORT ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
