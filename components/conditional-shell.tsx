'use client'

import { usePathname } from 'next/navigation'
import { SegmentedHeader } from '@/components/landing/segmented-header'
import { WhatsAppButton } from '@/components/whatsapp-button'

const HIDE_LAYOUT_ON = ['/sign-in', '/sign-up', '/forgot-password', '/onboarding']

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (HIDE_LAYOUT_ON.some((path) => pathname === path || pathname.startsWith(path + '?'))) {
    return <>{children}</>
  }

  return (
    <>
      <SegmentedHeader />
      <main id="main-content">{children}</main>
      <WhatsAppButton />
    </>
  )
}