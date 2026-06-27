import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Host_Grotesk, Rubik } from 'next/font/google'
import { ConditionalShell } from '@/components/conditional-shell'
import { AppProvider } from '@/lib/store'
import { LocaleProvider } from '@/lib/locale'
import { CurrencyProvider } from '@/lib/currency'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  variable: '--font-host-grotesk',
  display: 'swap',
})

// Arabic + Latin typeface (Rubik — supports Arabic)
const rubik = Rubik({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loversdc.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lover Diet Center — Science-Based Nutrition in UAE',
    template: '%s | Lover Diet Center',
  },
  description:
    'Personalized nutrition consultations, chef-prepared healthy meals, healthy snacks, body sculpting sessions, and training courses. 150+ certified nutritionists. 3,000+ members.',
  keywords: [
    'nutritionist UAE',
    'healthy meals Dubai',
    'weight loss program',
    'body sculpting',
    'personalized meal plan',
    'healthy snacks',
    'online nutrition consultation',
    'Lover Diet Center',
    'dietitian Abu Dhabi',
    'healthy food delivery UAE',
    'weight loss clinic',
  ],
  openGraph: {
    title: 'Lover Diet Center — Transform Your Health',
    description:
      'Expert nutrition consultations, healthy meal delivery, and body sculpting in the UAE. Join 3,000+ members.',
    url: siteUrl,
    siteName: 'Lover Diet Center',
    locale: 'en_AE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Lover Diet Center' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lover Diet Center — Science-Based Nutrition',
    description:
      'Personalized nutrition, chef-prepared meals, and certified experts. Book your free discovery call.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f8f7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`light-mode ${hostGrotesk.variable} ${rubik.variable}`}
    >
      <body className="font-sans antialiased text-neutral-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-full focus:bg-lime-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <LocaleProvider>
          <AppProvider>
            <CurrencyProvider>
              <ToastProvider>
                <ConditionalShell>{children}</ConditionalShell>
              </ToastProvider>
            </CurrencyProvider>
          </AppProvider>
        </LocaleProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}