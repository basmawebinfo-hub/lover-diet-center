// Centralized SEO constants and helpers.
// Import from here to keep canonical URLs, OG images, and structured data in sync.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loversdc.com'

export const SITE_NAME = 'Lover Diet Center'

// Absolute URL to the shared OG/Twitter card image.
// Route-level metadata should NOT override openGraph.images; the root layout
// already declares them and Next merges the object shallowly — overriding
// openGraph at the route drops images unless we redeclare them.
export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: 'Lover Diet Center — Science-Based Nutrition in UAE',
}

// Build an absolute canonical URL from a route path.
// Always returns an https://www.loversdc.com/... URL — never bare loversdc.com.
export function canonical(path: string): string {
  if (!path.startsWith('/')) path = '/' + path
  return `${SITE_URL}${path === '/' ? '' : path}`
}

// Structured data snippets. Returned as plain JS objects — serialize with
// JSON.stringify at the render site.

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/ldc-logo.png`,
  sameAs: [
    'https://www.facebook.com/wael.mousa.167/',
    'https://www.instagram.com/lovers_diet_center',
    'https://www.tiktok.com/@loversdiet',
    'https://www.youtube.com/channel/UCb0n5fTajQsT8oUC3_2sG6Q',
  ],
} as const

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: ['en', 'ar'],
} as const

export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndBeautyBusiness',
  '@id': `${SITE_URL}/#business`,
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  logo: `${SITE_URL}/ldc-logo.png`,
  description:
    'Personalized nutrition consultations, chef-prepared healthy meals, healthy snacks, body sculpting sessions, and training courses. Certified nutritionists serving the UAE.',
  telephone: '+971529033110',
  priceRange: '$$',
  areaServed: [
    { '@type': 'Country', name: 'United Arab Emirates' },
    { '@type': 'City', name: 'Dubai' },
    { '@type': 'City', name: 'Abu Dhabi' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'AE',
    addressRegion: 'Dubai',
  },
  sameAs: [
    'https://www.facebook.com/wael.mousa.167/',
    'https://www.instagram.com/lovers_diet_center',
    'https://www.tiktok.com/@loversdiet',
    'https://www.youtube.com/channel/UCb0n5fTajQsT8oUC3_2sG6Q',
  ],
} as const

// Helper to build a Product schema at runtime (used on /shop/[id]).
export function productJsonLd(p: {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  price: number
  inStock?: boolean
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/shop/${p.id}#product`,
    name: p.name,
    description: p.description ?? undefined,
    image: p.imageUrl ?? `${SITE_URL}/og-image.png`,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/shop/${p.id}`,
      priceCurrency: 'AED',
      price: p.price,
      availability:
        p.inStock === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  }
}
