"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, Share, PlusSquare, Download } from "lucide-react"
import { useLocale, t } from "@/lib/locale"

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const DISMISS_KEY = "ldc_install_dismissed"

export function InstallPrompt() {
  const { locale } = useLocale()
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // already installed (standalone) -> never show
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true
    if (standalone) return

    // dismissed recently? (7 days)
    try {
      const d = localStorage.getItem(DISMISS_KEY)
      if (d && Date.now() - Number(d) < 7 * 24 * 3600 * 1000) return
    } catch { /* ignore */ }

    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    const isSafari = ios && /safari/.test(ua) && !/crios|fxios|edgios/.test(ua)

    if (ios) {
      // iOS: only Safari can add to home screen; show instructions
      if (isSafari) {
        setIsIOS(true)
        const tmo = setTimeout(() => setShow(true), 2500)
        return () => clearTimeout(tmo)
      }
      return
    }

    // Android / desktop Chrome: native install prompt
    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", onBIP)
    return () => window.removeEventListener("beforeinstallprompt", onBIP)
  }, [])

  const dismiss = () => {
    setShow(false)
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* ignore */ }
  }

  const installNative = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  if (!show) return null

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md animate-fade-up sm:inset-x-auto sm:right-4 sm:left-auto sm:w-96">
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl">
        <div className="flex items-start gap-3 p-4">
          <Image src="/ldc-logo.png" alt="LoverDiet" width={48} height={48} className="size-12 shrink-0 rounded-2xl object-cover" />
          <div className="flex-1">
            <p className="font-extrabold text-neutral-900">{t(locale, "Install LoverDiet", "ثبّت تطبيق LoverDiet")}</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {t(locale, "Add the app to your home screen for a faster, full-screen experience.", "أضف التطبيق إلى شاشتك الرئيسية لتجربة أسرع وبملء الشاشة.")}
            </p>
          </div>
          <button onClick={dismiss} aria-label="close" className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-50"><X className="size-4" /></button>
        </div>

        {isIOS ? (
          <div className="border-t border-neutral-100 bg-neutral-50/60 px-4 py-3">
            <ol className="space-y-2 text-sm text-neutral-700">
              <li className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">1</span>
                {t(locale, "Tap", "اضغط على")} <Share className="size-4 text-emerald-600" /> {t(locale, "Share", "مشاركة")}
              </li>
              <li className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</span>
                {t(locale, "Choose", "اختر")} <PlusSquare className="size-4 text-emerald-600" /> {t(locale, "Add to Home Screen", "إضافة إلى الشاشة الرئيسية")}
              </li>
            </ol>
          </div>
        ) : (
          <div className="border-t border-neutral-100 p-3">
            <button onClick={installNative} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700">
              <Download className="size-4" /> {t(locale, "Install app", "تثبيت التطبيق")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
