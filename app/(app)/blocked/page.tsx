"use client"

import Link from "next/link"
import { Ban, MessageCircle } from "lucide-react"
import { WHATSAPP_SUPPORT } from "@/lib/site"
import { useLocale, t } from "@/lib/locale"

export default function BlockedPage() {
  const { locale } = useLocale()
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <Ban className="size-8" />
        </span>
        <h1 className="text-2xl font-extrabold text-neutral-900">{t(locale, "Account suspended", "تم إيقاف الحساب")}</h1>
        <p className="mt-3 text-sm text-neutral-500">
          {t(locale,
            "Your account has been suspended. Please contact our team for assistance.",
            "تم إيقاف حسابك. يرجى التواصل مع فريقنا للمساعدة.")}
        </p>
        <a href={WHATSAPP_SUPPORT} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700">
          <MessageCircle className="size-4" /> {t(locale, "Contact support", "تواصل مع الدعم")}
        </a>
        <Link href="/" className="mt-3 inline-block text-sm font-semibold text-neutral-500 hover:text-neutral-700">
          {t(locale, "Back to home", "العودة للرئيسية")}
        </Link>
      </div>
    </div>
  )
}
