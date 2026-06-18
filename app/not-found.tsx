"use client"

import Link from 'next/link'
import { Leaf, ArrowLeft } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

export default function NotFound() {
  const { locale } = useLocale()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-lime-50 text-lime-600">
        <Leaf className="size-8" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900">{t(locale, 'Page not found', 'الصفحة غير موجودة')}</h1>
      <p className="mt-3 max-w-md text-pretty text-neutral-500">
        {t(locale, "The page you're looking for doesn't exist or has been moved.", 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.')}
      </p>
      <Link
        href="/"
        className="mt-8 flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {t(locale, 'Back to home', 'العودة للرئيسية')}
      </Link>
    </div>
  )
}
