'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/**
 * The splash the app shows while it boots.
 *
 * Android already paints a splash from the manifest's background_color and
 * icon before any of our code runs. That one disappears the moment the web
 * view has a document — which, on a cold start over a phone connection, is
 * well before the page is usable. The gap in between is where a wrapped site
 * looks like a slow website. This covers it with something intentional.
 *
 * Rendered on top of a fully working page, so if the timer never fires or
 * JavaScript fails, the app underneath is already there — the splash can
 * only ever hide something briefly, never break it.
 *
 * Only in the installed app: in a browser tab a splash on a website is an
 * interstitial, and an unwelcome one.
 */
export function AppSplash() {
  // Starts hidden. The server has no idea whether this is the app, so it must
  // render nothing and let the client decide — otherwise every browser visit
  // gets a full-screen overlay in its HTML.
  const [phase, setPhase] = useState<'hidden' | 'showing' | 'leaving'>('hidden')

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS: Safari exposes this rather than the media query, which it only
      // supported from 16.4 onward.
      (navigator as Navigator & { standalone?: boolean }).standalone === true ||
      // Trusted Web Activity: Chrome reports the launching Android app here.
      document.referrer.startsWith('android-app://')

    if (!standalone) return

    // Marks the document for the CSS fallback that hides site chrome on iOS
    // versions without the display-mode query.
    document.documentElement.setAttribute('data-app', '')

    // Once per launch, not once per navigation.
    if (sessionStorage.getItem('ldc:splash-shown')) return
    sessionStorage.setItem('ldc:splash-shown', '1')

    setPhase('showing')
    const hold = window.setTimeout(() => setPhase('leaving'), 900)
    const done = window.setTimeout(() => setPhase('hidden'), 1300)
    return () => {
      window.clearTimeout(hold)
      window.clearTimeout(done)
    }
  }, [])

  if (phase === 'hidden') return null

  return (
    <div
      // aria-hidden: this is decoration over a page that is already rendered,
      // so a screen reader should go straight to the real content.
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F6FAF8] transition-opacity duration-400 ${
        phase === 'leaving' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="animate-[splashIn_600ms_ease-out]">
          <Image
            src="/ldc-logo.png"
            alt=""
            width={88}
            height={88}
            priority
            className="size-22 rounded-3xl object-cover shadow-lg shadow-[#4D7C0F]/20"
          />
        </div>

        <p className="mt-5 text-lg font-extrabold tracking-tight text-neutral-900">
          Lover Diet <span className="text-[#4D7C0F]">Center</span>
        </p>
        <p className="mt-1 text-xs font-medium text-neutral-400">معاً من أجل حياة أفضل</p>
      </div>

      {/* A determinate-looking bar rather than a spinner: a spinner says
          "something is wrong and we are retrying", a filling bar says
          "this is starting". */}
      <div className="absolute bottom-24 h-1 w-28 overflow-hidden rounded-full bg-[#E4EEDA]">
        <div className="h-full w-1/3 animate-[splashBar_1100ms_ease-in-out_infinite] rounded-full bg-[#4D7C0F]" />
      </div>

      <style jsx global>{`
        @keyframes splashIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes splashBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[splashIn_600ms_ease-out\\],
          .animate-\\[splashBar_1100ms_ease-in-out_infinite\\] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
