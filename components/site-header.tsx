'use client'

import Link from 'next/link'
import { Leaf, Menu, X, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Diet Plans', href: '/sign-in?redirect=/onboarding' },
  { label: 'Meals', href: '/sign-in?redirect=/healthy-meals' },
  { label: 'Supplements', href: '/sign-in?redirect=/healthy-snacks' },
  { label: 'Services', href: '/sign-in?redirect=/body-sculpting' },
  { label: 'About', href: '/sign-in?redirect=/about' },
  { label: 'Contact', href: '/sign-in?redirect=/contact' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      dir="ltr"
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 bg-black/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-black/60 backdrop-blur-md',
      )}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="LoverDiet home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-pink-600 text-white">
              <Leaf className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">LoverDiet</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in?redirect=/dashboard"
              className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white sm:flex"
            >
              <LayoutDashboard className="size-4" />
              <span>Account</span>
            </Link>
            <Link
              href="/sign-in?redirect=/onboarding"
              className="hidden items-center gap-2 rounded-full bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-pink-700 sm:flex"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/80 xl:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mt-2 rounded-3xl border border-white/10 bg-black/95 p-3 backdrop-blur-xl xl:hidden">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/sign-in?redirect=/dashboard"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-base font-medium text-white/80"
              >
                <LayoutDashboard className="size-4" />Account
              </Link>
              <div className="mt-1 flex gap-2">
                <Link
                  href="/sign-in?redirect=/onboarding"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 py-3 text-base font-semibold text-white"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}