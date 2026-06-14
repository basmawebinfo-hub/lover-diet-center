'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Leaf, ArrowRight, Check, Mail, Phone } from 'lucide-react'
import { socialLinks, WHATSAPP_DIRECT } from '@/lib/site'
import {
  FacebookIcon,
  TikTokIcon,
  YouTubeIcon,
  PinterestIcon,
  WhatsAppIcon,
} from '@/components/social-icons'

const columnKeys = ['company', 'services', 'support'] as const
const footerColumns: Record<string, { label: string; href: string; id: string }[]> = {
  company: [
    { label: 'About', href: '/sign-in?redirect=/about', id: 'company-about' },
    { label: 'Healthy Meals', href: '/sign-in?redirect=/healthy-meals', id: 'company-meals' },
    { label: 'Training Courses', href: '/sign-in?redirect=/training-courses', id: 'company-courses' },
    { label: 'Contact', href: '/sign-in?redirect=/contact', id: 'company-contact' },
  ],
  services: [
    { label: 'Healthy Meals', href: '/sign-in?redirect=/healthy-meals', id: 'services-meals' },
    { label: 'Healthy Snacks', href: '/sign-in?redirect=/healthy-snacks', id: 'services-snacks' },
    { label: 'Nutrition Consultations', href: '/sign-in?redirect=/onboarding', id: 'services-consultations' },
    { label: 'Body Sculpting', href: '/sign-in?redirect=/body-sculpting', id: 'services-body' },
  ],
  support: [
    { label: 'Help Center', href: '/sign-in?redirect=/contact', id: 'support-help' },
    { label: 'FAQ', href: '/#faq', id: 'support-faq' },
    { label: 'Privacy Policy', href: '/privacy', id: 'support-privacy' },
    { label: 'Terms of Service', href: '/terms', id: 'support-terms' },
  ],
}

const socials = [
  { label: 'Facebook', icon: FacebookIcon, href: socialLinks.facebook },
  { label: 'TikTok', icon: TikTokIcon, href: socialLinks.tiktok },
  { label: 'YouTube', icon: YouTubeIcon, href: socialLinks.youtube },
  { label: 'Pinterest', icon: PinterestIcon, href: socialLinks.pinterest },
  { label: 'WhatsApp', icon: WhatsAppIcon, href: socialLinks.whatsapp },
]

const columnLabels: Record<string, string> = {
  company: 'Company',
  services: 'Services',
  support: 'Support',
}

export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // best-effort
    }
    setDone(true)
    setEmail('')
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <footer id="footer" className="relative bg-black pb-10">
      {/* Newsletter */}
      <div className="mx-auto max-w-7xl px-4 pt-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm sm:p-10 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              Stay in the Loop
            </h3>
            <p className="mt-2 text-white/50">
              Get weekly tips, recipes, and exclusive offers straight to your inbox.
            </p>
          </div>
          <form
            onSubmit={onSubmit}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-12 flex-1 rounded-full border border-white/10 bg-white/5 px-5 text-base text-white placeholder:text-white/30 outline-none focus:border-pink-500/50 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-pink-600 px-6 font-semibold text-white transition-all hover:bg-pink-700"
            >
              {done ? (
                <><Check className="size-5" /> Subscribed</>
              ) : (
                <>Subscribe <ArrowRight className="size-5 rtl:rotate-180" /></>
              )}
            </button>
          </form>
        </div>

        {/* Main footer grid */}
        <div className="mt-14 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-pink-600 text-white">
                <Leaf className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">LoverDiet</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/40">
              Your trusted partner in health and nutrition — science-backed, chef-prepared, and delivered with care.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 transition-all hover:border-pink-500/50 hover:text-pink-500"
                >
                  <social.icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          {columnKeys.map((key) => (
            <div key={key}>
              <h4 className="text-sm font-semibold text-white">{columnLabels[key]}</h4>
              <ul className="mt-4 space-y-3">
                {footerColumns[key].map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-pink-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:support@loverdiet.com"
                  className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-pink-500"
                >
                  <Mail className="size-4 shrink-0" />
                  support@loverdiet.com
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_DIRECT}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-pink-500"
                >
                  <Phone className="size-4 shrink-0" />
                  +971 52 903 3110
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/30 sm:flex-row">
          <p>© 2026 LoverDiet Center. All rights reserved.</p>
          <p>Made with care in the UAE</p>
        </div>
      </div>
    </footer>
  )
}
