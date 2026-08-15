'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { useLocale } from '@/lib/locale'
import { localeHref } from '@/lib/locale-href'

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
}

/**
 * next/link that adds the active language prefix to public-site routes.
 *
 * Write `<LocaleLink href="/shop">` and an Arabic visitor gets /ar/shop, an
 * English one /en/shop. Paths outside the localized segment (/dashboard,
 * /sign-in) and external URLs pass through untouched, so this is a safe
 * drop-in for next/link anywhere in the app.
 *
 * Doing it here rather than hard-coding prefixes at every call site keeps the
 * nav tables, footer and CTAs written in terms of real routes, and means a
 * third language would not require touching any of them.
 */
export function LocaleLink({ href, ...rest }: LocaleLinkProps) {
  const { locale } = useLocale()
  return <Link href={localeHref(locale, href)} {...rest} />
}
