import type { Locale } from '@/lib/locale-shared'
import { isLocale } from '@/lib/locale-shared'

/**
 * Routes that live under app/(site)/[locale] and therefore need a language
 * prefix. Everything else — /dashboard, /admin, /sign-in, /api — has no
 * locale segment and must be linked to unchanged.
 *
 * Listed as top-level segments; nested paths like /shop/checkout match by
 * prefix.
 */
const LOCALIZED_ROOTS = [
  'about',
  'contact',
  'shop',
  'nutrition-consultations',
  'healthy-meals',
  'healthy-snacks',
  'body-sculpting',
  'training-courses',
] as const

/**
 * Prefix an internal path with the active locale.
 *
 *   localeHref('ar', '/shop')  -> '/ar/shop'
 *   localeHref('en', '/')      -> '/en'
 *   localeHref('ar', '/dashboard') -> '/dashboard'   (not a localized route)
 *   localeHref('ar', '/ar/shop')   -> '/ar/shop'     (already prefixed)
 *
 * External URLs, anchors and non-path values are returned untouched so this is
 * safe to apply blindly at a link site.
 */
export function localeHref(locale: Locale, href: string): string {
  if (!href.startsWith('/')) return href // external, mailto:, #anchor, wa.me…

  // Root of the public site.
  if (href === '/') return `/${locale}`

  const segments = href.split('/').filter(Boolean)
  const first = segments[0] ?? ''

  // Already carries a locale — leave it, so callers can hard-link a language.
  if (isLocale(first)) return href

  if ((LOCALIZED_ROOTS as readonly string[]).includes(first)) {
    return `/${locale}${href}`
  }

  return href
}

/**
 * Swap the locale on the current path, preserving the rest of the URL.
 * Used by the header's language toggle: on /ar/shop it returns /en/shop, so
 * switching language keeps the visitor on the page they were reading instead
 * of dumping them back on the homepage.
 */
export function swapLocaleInPath(pathname: string, next: Locale): string {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = next
    return '/' + segments.join('/')
  }

  // Not a localized path (dashboard, sign-in…). Nothing to swap.
  return pathname
}
