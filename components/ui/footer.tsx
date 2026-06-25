'use client'

import Image from 'next/image'
import Link from 'next/link'
import { WHATSAPP_NUMBER, socialLinks } from '@/lib/site'
import { useLocale, t } from '@/lib/locale'

const SOCIALS = [
  {
    label: 'Instagram',
    href: socialLinks.instagram,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07c1.17.05 1.8.25 2.23.41c.56.22.96.48 1.38.9c.42.42.68.82.9 1.38c.16.42.36 1.06.41 2.23c.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23c-.22.56-.48.96-.9 1.38c-.42.42-.82.68-1.38.9c-.42.16-1.06.36-2.23.41c-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23c-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23c.22-.56.48-.96.9-1.38c.42-.42.82-.68 1.38-.9c.42-.16 1.06-.36 2.23-.41c1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56c-.79.31-1.46.72-2.13 1.38C1.34 2.69.93 3.36.63 4.14c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91c.31.79.72 1.46 1.38 2.13c.67.66 1.34 1.07 2.13 1.38c.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38a5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.63.56-2.91c.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32a6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8a4 4 0 0 1 0 8m6.41-10.85a1.44 1.44 0 1 0 0 2.88a1.44 1.44 0 0 0 0-2.88" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: socialLinks.facebook,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: socialLinks.tiktok,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: socialLinks.youtube,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9c.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83c-.25.9-.83 1.48-1.73 1.73c-.47.13-1.33.22-2.65.28c-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44c-.9-.25-1.48-.83-1.73-1.73c-.13-.47-.22-1.1-.28-1.9c-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83c.25-.9.83-1.48 1.73-1.73c.47-.13 1.33-.22 2.65-.28c1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44c.9.25 1.48.83 1.73 1.73" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: socialLinks.whatsapp,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
]

export function FooterSimple() {
  const { locale } = useLocale()

  const NAV_COLS = [
    {
      title: t(locale, 'Services', 'الخدمات'),
      links: [
        { label: t(locale, 'Nutrition Consultations', 'الاستشارات الغذائية'), href: '/nutrition-consultations' },
        { label: t(locale, 'Healthy Meals', 'الوجبات الصحية'),               href: '/healthy-meals' },
        { label: t(locale, 'Healthy Snacks', 'السناكس الصحية'),              href: '/healthy-snacks' },
        { label: t(locale, 'Body Sculpting', 'نحت الجسم'),                   href: '/body-sculpting' },
      ],
    },
    {
      title: t(locale, 'Company', 'الشركة'),
      links: [
        { label: t(locale, 'About Us', 'من نحن'),       href: '/about' },
        { label: t(locale, 'Contact', 'تواصل معنا'),     href: '/contact' },
        { label: t(locale, 'FAQ', 'الأسئلة الشائعة'),    href: '/#faq' },
      ],
    },
    {
      title: t(locale, 'Account', 'الحساب'),
      links: [
        { label: t(locale, 'Sign Up', 'إنشاء حساب'),     href: '/sign-up' },
        { label: t(locale, 'Sign In', 'تسجيل الدخول'),   href: '/sign-in' },
        { label: t(locale, 'Dashboard', 'لوحة التحكم'),  href: '/dashboard' },
      ],
    },
  ]

  return (
    <footer className="border-t border-neutral-100 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Main footer grid */}
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/ldc-logo.png"
                alt="Lover Diet Center logo"
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
              <div className="leading-none">
                <span className="block text-base font-bold tracking-tight text-white">Lover Diet</span>
                <span className="block text-[10px] font-medium tracking-widest text-neutral-500 uppercase">Center</span>
              </div>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              {t(
                locale,
                'Science-based nutrition, chef-prepared meals, and certified experts — all working together for your transformation.',
                'تغذية قائمة على العلم، ووجبات يحضّرها الطهاة، وخبراء معتمدون — يعملون معاً من أجل تحوّلك.'
              )}
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-neutral-400 transition-colors hover:border-lime-500/40 hover:text-lime-400"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/8 py-6 sm:flex-row">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Lover Diet Center. {t(locale, 'All rights reserved.', 'جميع الحقوق محفوظة.')}
          </p>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-lime-400">
              {t(locale, 'WhatsApp', 'واتساب')}
            </a>
            <span className="text-neutral-700">·</span>
            <a href="mailto:support@loverdiet.com" className="transition-colors hover:text-lime-400">
              {t(locale, 'Email', 'البريد الإلكتروني')}
            </a>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-600">{t(locale, 'UAE', 'الإمارات')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
