'use client'

import Link from 'next/link'
import {
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  PinterestIcon,
  WhatsAppIcon,
} from '@/components/social-icons'
import { socialLinks } from '@/lib/site'

const socials = [
  { label: 'Facebook', icon: FacebookIcon, href: socialLinks.facebook },
  { label: 'TikTok', icon: TikTokIcon, href: socialLinks.tiktok },
  { label: 'YouTube', icon: YouTubeIcon, href: socialLinks.youtube },
  { label: 'Pinterest', icon: PinterestIcon, href: socialLinks.pinterest },
  { label: 'WhatsApp', icon: WhatsAppIcon, href: socialLinks.whatsapp },
]

export function Community() {
  return (
    <section className="relative overflow-hidden bg-black py-20 sm:py-28">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[30rem] rounded-full bg-pink-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Join Our{' '}
          <span className="text-pink-500">Community</span>
        </h2>
        <p className="mt-4 text-pretty text-white/50">
          Follow us on social media for tips, recipes, and success stories.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {socials.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 backdrop-blur-sm transition-all hover:scale-110 hover:border-pink-500/50 hover:bg-pink-600/20 hover:text-pink-500"
            >
              <social.icon className="size-5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
