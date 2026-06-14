/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    // Avoid stale chunk URLs in Turbopack HMR
    staleTimes: { dynamic: 0 },
  },
}

export default nextConfig
