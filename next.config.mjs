/** @type {import('next').NextConfig} */

// Content-Security-Policy tailored to Next 16 + Supabase + Vercel Analytics
// + open.er-api.com (FX rates). Kept as a single-line string to avoid
// newline injection in header parsers.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https: https://*.supabase.co https://*.supabase.in",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://vitals.vercel-insights.com https://va.vercel-scripts.com https://open.er-api.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' https://*.supabase.co https://*.supabase.in",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig = {
  // Explicit — Next defaults to true, but we re-assert it so it never regresses.
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
  },

  experimental: {
    // Avoid stale chunk URLs in Turbopack HMR (dev only impact)
    staleTimes: { dynamic: 0 },
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
