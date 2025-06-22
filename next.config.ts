import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
 // This includes files from the monorepo base two directories up
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;