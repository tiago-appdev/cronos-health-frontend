/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better deployment
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize images
  images: {
    domains: ["localhost"],
  },

  // Environment variables
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
