/** @type {import('next').NextConfig} */
const nextConfig = {
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
