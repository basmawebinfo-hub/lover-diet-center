'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/site'
import { createClient } from '@/lib/supabase/client'
import { useLocale, t } from '@/lib/locale'

// Pages that hide the header completely
const HIDE_ON = ['/sign-in', '/sign-up', '/onboarding']

// Main nav — direct links to real pages
type NavItem = {
  id: string
  en: string
  ar: string
  href?: string
  dropdown?: { en: string; ar: string; href: string; descEn: string; descAr: string }[]
}

const NAV_LINKS: NavItem[] = [
  { id: 'about', en: 'About', ar: 'من نحن', href: '/about' },
  { id: 'shop', en: 'Shop', ar: 'المتجر', href: '/shop' },
  {
    id: 'services',
    en: 'Services',
    ar: 'الخدمات',
    dropdown: [
      { en: 'Nutrition Consultations', ar: 'الاستشارات الغذائية', href: '/nutrition-consultations', descEn: 'Personalized plans with certified experts', descAr: 'خطط مخصصة مع خبراء معتمدين' },
      { en: 'Healthy Meals',           ar: 'الوجبات الصحية',      href: '/healthy-meals',           descEn: 'Chef-prepared, macro-balanced meals',     descAr: 'وجبات متوازنة يحضّرها الطهاة' },
      { en: 'Healthy Snacks',          ar: 'السناكس الصحية',      href: '/healthy-snacks',          descEn: 'Protein bars, nuts & supplements',        descAr: 'ألواح بروتين ومكسرات ومكمّلات' },
      { en: 'Body Sculpting',          ar: 'نحت الجسم',           href: '/body-sculpting',          descEn: 'Non-invasive fat reduction sessions',     descAr: 'جلسات تكسير دهون غير جراحية' },
      { en: 'Training Courses',        ar: 'الدورات التدريبية',   href: '/training-courses',        descEn: 'Courses with certificates, online & in-person', descAr: 'دورات بشهادات، أونلاين وحضورياً' },
    ],
  },
  { id: 'contact', en: 'Contact', ar: 'تواصل معنا', href: '/contact' },
]

const MOBILE_LINKS = [
  { en: 'About',                   ar: 'من نحن',              href: '/about' },
  { en: 'Nutrition Consultations', ar: 'الاستشارات الغذائية', href: '/nutrition-consultations' },
  { en: 'Healthy Meals',           ar: 'الوجبات الصحية',      href: '/healthy-meals' },
  { en: 'Healthy Snacks',          ar: 'السناكس الصحية',      href: '/healthy-snacks' },
  { en: 'Body Sculpting',          ar: 'نحت الجسم',           href: '/body-sculpting' },
  { en: 'Training Courses',        ar: 'الدورات التدريبية',   href: '/training-courses' },
  { en: 'Contact',                 ar: 'تواصل معنا',          href: '/contact' },
]

export function SegmentedHeader() {
  const pathname = usePathname()

  // --- all hooks first, before any early return ---
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef    = useRef<HTMLDivElement>(null)
  const toggleRef  = useRef<HTMLButtonElement>(null)
  const dropRef    = useRef<HTMLDivElement>(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const { locale, toggleLocale } = useLocale()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track Supabase auth session for the dynamic Dashboard button
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsAuthed(!!data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session?.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  // Keyboard trap for mobile menu
  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    toggleRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [menuOpen, closeMenu])

  // Hide on auth / onboarding pages
  const hide = HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + '?'))
  if (hide) return null

  const isActive = (href?: string) => href && pathname === href

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-neutral-200/60 bg-white/95 shadow-sm backdrop-blur-md'
          : 'bg-white/80 backdrop-blur-sm',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Lover Diet Center home">
          <Image
            src="/ldc-logo.png"
            alt="Lover Diet Center logo"
            width={44}
            height={44}
            priority
            className="size-10 rounded-full object-cover shadow-sm transition-transform group-hover:scale-105"
          />
          <div className="leading-none">
            <span className="block text-base font-bold tracking-tight text-neutral-900">Lover Diet <span className="text-orange-500">Center</span></span>
            <span className="block text-[10px] font-medium tracking-widest text-neutral-400 uppercase">{t(locale, 'Together for a better life', 'معاً من أجل حياة أفضل')}</span>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) =>
            link.dropdown ? (
              // Dropdown item
              <div key={link.id} ref={dropRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    dropdownOpen
                      ? 'bg-lime-50 text-lime-700'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                  )}
                >
                  {locale === 'ar' ? link.ar : link.en}
                  <ChevronDown className={cn('size-3.5 transition-transform duration-200', dropdownOpen && 'rotate-180')} />
                </button>

                {/* Dropdown panel */}
                <div className={cn(
                  'absolute left-0 top-full mt-2 w-72 origin-top-left rounded-2xl border border-neutral-100 bg-white p-2 shadow-xl shadow-neutral-900/10 transition-all duration-200',
                  dropdownOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0',
                )}>
                  {link.dropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="flex flex-col rounded-xl px-4 py-3 transition-colors hover:bg-lime-50 group"
                    >
                      <span className="text-sm font-semibold text-neutral-800 group-hover:text-lime-700">{locale === 'ar' ? item.ar : item.en}</span>
                      <span className="mt-0.5 text-xs text-neutral-400">{locale === 'ar' ? item.descAr : item.descEn}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              // Regular link
              <Link
                key={link.id}
                href={link.href!}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-lime-50 text-lime-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                )}
              >
                {locale === 'ar' ? link.ar : link.en}
              </Link>
            )
          )}
        </nav>

        {/* ── Desktop right actions ── */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={toggleLocale}
            aria-label="Switch language"
            className="rounded-full border border-neutral-200 px-3 py-2 text-sm font-bold text-neutral-700 transition-colors hover:border-lime-300 hover:text-lime-700"
          >
            {locale === 'en' ? 'العربية' : 'EN'}
          </button>
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-lime-400 to-lime-500 px-6 py-2.5 text-sm font-bold text-lime-950 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              {t(locale, 'Dashboard', 'لوحة التحكم')}
              <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-lime-400 to-lime-500 px-6 py-2.5 text-sm font-bold text-lime-950 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              {t(locale, 'Sign in', 'تسجيل الدخول')}
              <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Link>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="flex size-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-50 md:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      <div
        ref={menuRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'overflow-hidden border-t border-neutral-100 bg-white/98 backdrop-blur-md transition-all duration-300 ease-out md:hidden',
          menuOpen ? 'max-h-[36rem] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-4 pb-6 pt-3" aria-label="Mobile navigation">
          {MOBILE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={cn(
                'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-lime-50 text-lime-700'
                  : 'text-neutral-700 hover:bg-neutral-50',
              )}
            >
              {locale === 'ar' ? link.ar : link.en}
            </Link>
          ))}

          {/* Language toggle (mobile) */}
          <button
            type="button"
            onClick={() => { toggleLocale(); closeMenu() }}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-base font-bold text-neutral-700"
          >
            {locale === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          </button>

          {/* Mobile CTA buttons */}
          <div className="mt-3 flex flex-col gap-2 border-t border-neutral-100 pt-4">
            <Link
              href={isAuthed ? "/dashboard" : "/sign-in"}
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-lime-400 to-lime-500 py-3.5 text-base font-bold text-lime-950 shadow-sm"
            >
              {isAuthed ? t(locale, 'Go to Dashboard', 'الذهاب إلى لوحة التحكم') : t(locale, 'Sign in', 'تسجيل الدخول')}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-base font-medium text-neutral-700"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-green-500">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t(locale, 'Chat on WhatsApp', 'تواصل عبر واتساب')}
            </a>
            {!isAuthed && (
            <Link
              href="/sign-up"
              onClick={closeMenu}
              className="text-center py-2 text-sm font-medium text-neutral-500"
            >
              {t(locale, "Don't have an account? Create one", 'ليس لديك حساب؟ أنشئ حساباً')}
            </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
