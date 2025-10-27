import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ✅ Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  experimental: {
    serverComponentsExternalPackages: ['@trpc/server'],  // If server tRPC
  },
};

export default nextConfig;
