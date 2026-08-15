import { notFound } from 'next/navigation'
import { RootShell } from '@/components/root-shell'
import { fontClassNames } from '@/lib/fonts'
import { rootMetadata, rootViewport } from '@/lib/root-metadata'
import { LOCALES, isLocale, dirFor } from '@/lib/locale-shared'
import '../../globals.css'

/**
 * Root layout for the public, path-localized site.
 *
 * This owns <html> for everything under /en and /ar. The locale comes from the
 * URL segment, so nothing here touches cookies() or headers() — which is the
 * whole reason these pages can be prerendered to static HTML and served from
 * the CDN. The authenticated half of the app has its own root layout in
 * app/(app)/layout.tsx and reads the cookie instead.
 *
 * Two root layouts means a navigation between the marketing site and the
 * dashboard is a full document load rather than a client transition. That is
 * the right boundary anyway: the two halves share no UI chrome.
 */
export const metadata = rootMetadata
export const viewport = rootViewport

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Anything that is not a known locale is a real 404. Without this a stray
  // /foo/about would render the English page at a nonsense URL and Google
  // would index the duplicate.
  if (!isLocale(locale)) notFound()

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      suppressHydrationWarning
      className={fontClassNames}
    >
      <RootShell locale={locale}>{children}</RootShell>
    </html>
  )
}
