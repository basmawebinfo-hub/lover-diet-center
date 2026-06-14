'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Menu, X, Leaf, Globe, ArrowRight } from 'lucide-react'

const NAV_LINKS = [
  { id: 'consultations', label: 'Consultations', href: '/sign-in?redirect=/onboarding' },
  { id: 'meals', label: 'Meals', href: '/sign-in?redirect=/healthy-meals' },
  { id: 'snacks', label: 'Snacks', href: '/sign-in?redirect=/healthy-snacks' },
  { id: 'body-sculpting', label: 'Body Sculpting', href: '/sign-in?redirect=/body-sculpting' },
  { id: 'courses', label: 'Courses', href: '/sign-in?redirect=/training-courses' },
]

const MOBILE_NAV_LINKS = [
  { id: 'consultations', label: 'Consultations', href: '/sign-in?redirect=/onboarding' },
  { id: 'meals', label: 'Meals', href: '/sign-in?redirect=/healthy-meals' },
  { id: 'snacks', label: 'Snacks', href: '/sign-in?redirect=/healthy-snacks' },
  { id: 'body-sculpting', label: 'Body Sculpting', href: '/sign-in?redirect=/body-sculpting' },
  { id: 'courses', label: 'Courses', href: '/sign-in?redirect=/training-courses' },
  { id: 'book', label: 'Book a Consultation', href: '/sign-in?redirect=/onboarding', highlight: true },
]

export function SegmentedHeader() {
  const pathname = usePathname()
  const isAuthPage = pathname === '/sign-in' || pathname.startsWith('/sign-in?')
  if (isAuthPage) return null

  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = useCallback(() => {
    setOpen(false)
    toggleRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
      if (e.key !== 'Tab' || !menuRef.current) return
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, closeMenu])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-teal-100/60 bg-white/90 backdrop-blur-md shadow-sm shadow-teal-900/5'
          : 'bg-white',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:py-3.5">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="LoverDiet home"
        >
          <span
            className="flex size-9 items-center justify-center rounded-xl bg-teal-600 text-white"
            aria-hidden="true"
          >
            <Leaf className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-teal-700">
            LoverDiet
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Services"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            aria-label="Switch language to Arabic"
          >
            <Globe className="size-4" />
            <span>عر</span>
          </Link>
          <Link
            href="/sign-in?redirect=/onboarding"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 active:translate-y-0"
          >
            Book a Consultation
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex size-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-50 md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'overflow-hidden border-t border-neutral-100 bg-white/95 backdrop-blur-md transition-all duration-300 ease-out md:hidden',
          open ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-4 pb-5 pt-2" aria-label="Mobile services">
          {MOBILE_NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => closeMenu()}
              className={cn(
                'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                link.highlight
                  ? 'mt-2 bg-orange-500 text-center font-semibold text-white shadow-sm'
                  : 'text-neutral-700 hover:bg-neutral-50',
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex border-t border-neutral-100 pt-3">
            <Link
              href="/"
              onClick={() => closeMenu()}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-800"
            >
              <Globe className="size-4" /> العربية
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}