"use client"

import Link from "next/link"
import { GraduationCap, ArrowRight, Clock } from "lucide-react"
import { WHATSAPP_DIRECT } from "@/lib/site"
import { useLocale, t } from "@/lib/locale"

export function TrainingCoursesContent() {
  const { locale } = useLocale()
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f3fae6] to-white">
      <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-5 rounded-full bg-lime-400/20 blur-2xl" />
          <div className="relative flex size-24 items-center justify-center rounded-3xl bg-lime-100 text-lime-700 shadow-sm">
            <GraduationCap className="size-11" />
          </div>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-lime-200 bg-white px-4 py-1.5 text-sm font-bold text-lime-700">
          <Clock className="size-4" />
          {t(locale, "Coming Soon", "قريباً")}
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          {t(locale, "Training Courses", "الدورات التدريبية")}
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600">
          {t(
            locale,
            "We're putting the finishing touches on our certified nutrition and fitness courses. They'll be available here very soon.",
            "نضع اللمسات الأخيرة على دوراتنا المعتمدة في التغذية واللياقة. ستكون متاحة هنا قريباً جداً."
          )}
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a
            href={WHATSAPP_DIRECT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#4d7c0f] px-7 py-4 text-base font-bold text-white transition hover:bg-[#155f56]"
          >
            {t(locale, "Notify me when ready", "أبلغني عند توفرها")}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-7 py-4 text-base font-semibold text-neutral-700 transition hover:border-lime-300"
          >
            {t(locale, "Back to home", "العودة للرئيسية")}
          </Link>
        </div>
      </section>
    </main>
  )
}
