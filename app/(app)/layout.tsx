import { RootShell } from '@/components/root-shell'
import { fontClassNames } from '@/lib/fonts'
import { rootMetadata, rootViewport } from '@/lib/root-metadata'
import { getLocaleServer } from '@/lib/locale-server'
import { dirFor } from '@/lib/locale-shared'
import '../globals.css'

/**
 * Root layout for the authenticated half of the app — dashboard, admin,
 * onboarding and the auth screens.
 *
 * These routes have no locale in their URL, so the language still comes from
 * the `ldc_locale` cookie. Reading a cookie forces dynamic rendering, which
 * costs nothing here: every one of these pages is behind a session and renders
 * per-user data anyway. The public site avoids this by taking the locale from
 * the path instead — see app/(site)/[locale]/layout.tsx.
 *
 * These pages are also excluded from indexing: they are private, and letting
 * Google crawl a sign-in wall produces nothing but soft-404s.
 */
export const metadata = {
  ...rootMetadata,
  robots: { index: false, follow: false },
}
export const viewport = rootViewport

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocaleServer()

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
