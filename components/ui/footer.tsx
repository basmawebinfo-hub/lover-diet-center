import Link from 'next/link'
import { WHATSAPP_NUMBER, socialLinks } from '@/lib/site'

const NAV_COLS = [
  {
    title: 'Services',
    links: [
      { label: 'Nutrition Consultations', href: '/nutrition-consultations' },
      { label: 'Healthy Meals',           href: '/healthy-meals' },
      { label: 'Healthy Snacks',          href: '/healthy-snacks' },
      { label: 'Body Sculpting',          href: '/body-sculpting' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',  href: '/about' },
      { label: 'Contact',   href: '/contact' },
      { label: 'FAQ',       href: '/#faq' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign Up',   href: '/sign-up' },
      { label: 'Sign In',   href: '/sign-in' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
]

const SOCIALS = [
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
  return (
    <footer className="border-t border-neutral-100 bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Main footer grid */}
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-lime-600 text-white">
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
                  <path d="M12 3C8 3 5 6 5 10c0 5 7 11 7 11s7-6 7-11c0-4-3-7-7-7z" fill="currentColor" opacity=".9"/>
                  <path d="M12 8v8M9 11h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="leading-none">
                <span className="block text-base font-bold tracking-tight text-white">Lover Diet</span>
                <span className="block text-[10px] font-medium tracking-widest text-neutral-500 uppercase">Center</span>
              </div>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Science-based nutrition, chef-prepared meals, and certified experts — all working together for your transformation.
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
                  <li key={link.label}>
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
            © {new Date().getFullYear()} Lover Diet Center. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-lime-400">
              WhatsApp
            </a>
            <span className="text-neutral-700">·</span>
            <a href="mailto:support@loverdiet.com" className="transition-colors hover:text-lime-400">
              Email
            </a>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-600">UAE</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
