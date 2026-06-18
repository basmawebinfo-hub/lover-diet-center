'use client'

import { usePathname } from 'next/navigation'
import { SegmentedHeader } from '@/components/landing/segmented-header'
import { WhatsAppButton } from '@/components/whatsapp-button'

// Pages that render WITHOUT the public header / floating WhatsApp button.
const HIDE_LAYOUT_ON = ['/sign-in', '/sign-up', '/forgot-password', '/onboarding']

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideExact = HIDE_LAYOUT_ON.some(
    (path) => pathname === path || pathname.startsWith(path + '?'),
  )
  // The dashboard has its own sidebar/header — hide the public chrome on every /dashboard route.
  const inDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (hideExact || inDashboard) {
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
