'use client'

import Link from 'next/link'
import { socialLinks } from '@/lib/site'

export function WhatsAppButton() {
  return (
    <div className="fixed bottom-5 end-5 z-50">
      {/* Continuous glow ring — outer */}
      <span className="absolute -inset-3 animate-ping rounded-full bg-lime-400/20" style={{ animationDuration: '2.5s' }} />
      {/* Glow ring — middle */}
      <span className="absolute -inset-2 animate-pulse rounded-full bg-lime-400/15" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
      {/* Glow ring — inner */}
      <span className="absolute -inset-1 animate-pulse rounded-full bg-lime-400/25" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }} />

      <Link
        href={socialLinks.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex size-14 animate-float items-center justify-center rounded-full bg-white shadow-lg shadow-lime-500/30 transition-all hover:scale-110 hover:shadow-xl"
      >
        <img
          src="/icons/whatsapp.svg"
          alt=""
          className="size-9"
          aria-hidden="true"
        />
      </Link>
    </div>
  )
}
