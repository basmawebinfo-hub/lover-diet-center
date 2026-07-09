'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

/**
 * Floating "back to home" pill shown on auth pages (sign-in / sign-up).
 * Positioned at the logical start of the page top so it mirrors correctly
 * in RTL. The arrow flips direction via rtl:rotate-180.
 */
export function BackToHome() {
  const { locale } = useLocale()
  return (
    <Link
      href="/"
      className="fixed top-5 z-50 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-lime-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 ltr:left-5 rtl:right-5"
    >
      <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
      {t(locale, 'Back to home', 'العودة للرئيسية')}
    </Link>
  )
}
