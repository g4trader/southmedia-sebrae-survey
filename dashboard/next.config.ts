import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone para Docker/Cloud Run
  output: 'standalone',
  
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  
  // Optimize for Vercel deployment
  generateBuildId: async () => {
    return 'build-' + Date.now();
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
