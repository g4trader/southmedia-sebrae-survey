import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone para Docker/Cloud Run
  output: 'standalone',
  
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
