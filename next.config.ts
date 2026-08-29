import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_STATIC_EXPORT ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  // eslint and typescript checks are enforced at CI level — do NOT suppress here
};

export default nextConfig;
