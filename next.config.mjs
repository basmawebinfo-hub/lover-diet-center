/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don't fail production builds on lint errors (lint is run separately in dev)
    ignoreDuringBuilds: true,
  },
  images: {
    // Allow images from any domain (update with specific domains when backend is added)
    remotePatterns: [],
  },
  experimental: {
    // Avoid stale chunk URLs in Turbopack HMR
    staleTimes: { dynamic: 0 },
  },
}

export default nextConfig
