/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve modern, smaller formats automatically (Next optimizes local images on Vercel)
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },
  experimental: {
    // Avoid stale chunk URLs in Turbopack HMR
    staleTimes: { dynamic: 0 },
  },
}

export default nextConfig
