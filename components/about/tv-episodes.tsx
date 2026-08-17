'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Tv, ChevronLeft, ChevronRight, Pause } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'
import {
  TV_EPISODES,
  youtubeEmbedUrl,
  youtubeThumbUrl,
  youtubeWatchUrl,
} from '@/lib/tv-episodes'

/** Pixels per animation frame. ~0.4px at 60fps is a slow, readable drift. */
const SPEED = 0.4

/**
 * Auto-scrolling strip of Dr. Wael's televised episodes.
 *
 * Built on a real overflow-x container rather than a CSS transform marquee, so
 * dragging, swiping, the scrollbar and keyboard scrolling all keep working
 * while the strip drifts. A transform-based marquee looks the same but takes
 * the content out of the scroller, which makes it unusable on touch.
 *
 * The list is rendered twice and the scroll position wraps at the halfway
 * point, which produces a seamless loop in both directions.
 *
 * Motion is paused whenever the visitor is likely to be aiming at something —
 * pointer over the strip, keyboard focus inside it, a card playing, or the tab
 * hidden — and there is an explicit play/pause control. These are not
 * decoration: WCAG 2.2.2 requires a way to stop content that moves for more
 * than five seconds, and the cards are click targets, so a strip that slides
 * out from under the cursor would be actively hostile. Visitors who ask for
 * reduced motion never get the animation at all; they get a normal scrollable
 * strip.
 */
export function TvEpisodes() {
  const { locale } = useLocale()
  const isRtl = locale === 'ar'

  const scrollerRef = useRef<HTMLUListElement>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)
  const resumeTimer = useRef<number | null>(null)

  /** Hold the strip still while the visitor is interacting with it. */
  const hold = useCallback(() => {
    if (resumeTimer.current !== null) {
      window.clearTimeout(resumeTimer.current)
      resumeTimer.current = null
    }
    setHeld(true)
  }, [])

  /**
   * Release after a beat.
   *
   * The delay matters on touch: touchend fires the moment the finger lifts,
   * but momentum scrolling is still running, and resuming the drift into a
   * decelerating flick fights the user. Without any release at all — which is
   * what a bare onTouchStart gives you — the first tap on a phone would stop
   * the strip permanently.
   */
  const release = useCallback((delayMs = 0) => {
    if (resumeTimer.current !== null) window.clearTimeout(resumeTimer.current)
    resumeTimer.current = window.setTimeout(() => {
      setHeld(false)
      resumeTimer.current = null
    }, delayMs)
  }, [])

  useEffect(
    () => () => {
      if (resumeTimer.current !== null) window.clearTimeout(resumeTimer.current)
    },
    [],
  )

  // Start from the OS preference and follow it if the user changes it live.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mql.matches)
    apply()
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [])

  // A card with an iframe open must not slide away mid-video.
  const shouldAnimate = !reducedMotion && !paused && !held && playing === null

  useEffect(() => {
    if (!shouldAnimate) return
    const el = scrollerRef.current
    if (!el) return

    let frame = 0
    const step = () => {
      // In RTL, scrollLeft runs negative away from the start edge, so move in
      // whichever direction takes us away from zero.
      el.scrollLeft += isRtl ? -SPEED : SPEED

      // Wrap at the halfway mark — that is exactly one copy of the list, so
      // the jump is invisible.
      const half = el.scrollWidth / 2
      if (half > 0 && Math.abs(el.scrollLeft) >= half) {
        el.scrollLeft += isRtl ? half : -half
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [shouldAnimate, isRtl])

  // Nudge by roughly one card.
  const nudge = useCallback(
    (direction: 'forward' | 'back') => {
      const el = scrollerRef.current
      if (!el) return
      const amount = el.clientWidth * 0.8
      const away = direction === 'forward' ? 1 : -1
      el.scrollBy({ left: (isRtl ? -away : away) * amount, behavior: 'smooth' })
    },
    [isRtl],
  )

  const items = [...TV_EPISODES, ...TV_EPISODES]

  return (
    <div>
      <div className="mb-6 flex items-center justify-center gap-2 text-[#4d7c0f]">
        <Tv className="size-5" aria-hidden="true" />
        <h3 className="text-lg font-bold">
          {t(locale, 'Television Episodes', 'الحلقات التلفزيونية')}
        </h3>
      </div>
      <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-neutral-600">
        {t(
          locale,
          'Episodes aired on Sharjah TV, covering nutrition topics for a general audience.',
          'حلقات عُرضت على تلفزيون الشارقة تتناول موضوعات التغذية لجمهور عام.'
        )}
      </p>

      {/* Controls */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => nudge('back')}
          aria-label={t(locale, 'Previous episodes', 'الحلقات السابقة')}
          className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-[#4d7c0f] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
        >
          {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>

        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={
              paused
                ? t(locale, 'Resume automatic scrolling', 'استئناف الحركة التلقائية')
                : t(locale, 'Pause automatic scrolling', 'إيقاف الحركة التلقائية')
            }
            className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-[#4d7c0f] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
        )}

        <button
          type="button"
          onClick={() => nudge('forward')}
          aria-label={t(locale, 'Next episodes', 'الحلقات التالية')}
          className="flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-[#4d7c0f] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
        >
          {isRtl ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
      </div>

      {/* Strip */}
      <div className="relative">
        {/* Fade the edges so cards look like they enter and leave, rather than
            being chopped off at the container border. */}
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-8 bg-gradient-to-r from-white to-transparent rtl:bg-gradient-to-l sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-8 bg-gradient-to-l from-white to-transparent rtl:bg-gradient-to-r sm:w-16" />

        <ul
          ref={scrollerRef}
          onMouseEnter={hold}
          onMouseLeave={() => release()}
          onFocusCapture={hold}
          onBlurCapture={() => release()}
          onTouchStart={hold}
          onTouchEnd={() => release(2500)}
          onTouchCancel={() => release(2500)}
          className="flex gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((ep, i) => {
            const title = locale === 'ar' ? ep.titleAr : ep.titleEn
            const isPlaying = playing === ep.id
            // Only the first copy is exposed to assistive tech — the second is
            // a visual device for the loop, not 13 extra episodes.
            const isClone = i >= TV_EPISODES.length

            return (
              <li
                key={`${ep.id}-${i}`}
                aria-hidden={isClone || undefined}
                className="w-[16rem] shrink-0 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md sm:w-[19rem]"
              >
                <div className="relative aspect-video bg-neutral-900">
                  {isPlaying ? (
                    <iframe
                      src={youtubeEmbedUrl(ep.id)}
                      title={title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 size-full"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlaying(ep.id)}
                      tabIndex={isClone ? -1 : undefined}
                      aria-label={t(locale, `Play: ${title}`, `تشغيل: ${title}`)}
                      className="group absolute inset-0 size-full cursor-pointer"
                    >
                      <Image
                        src={youtubeThumbUrl(ep.id)}
                        alt=""
                        fill
                        sizes="19rem"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex size-14 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">
                          <Play className="size-6 translate-x-0.5 fill-[#4d7c0f] text-[#4d7c0f]" />
                        </span>
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="line-clamp-2 text-sm font-bold text-neutral-900">{title}</h4>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {ep.date ? (
                      <time dateTime={ep.date} className="text-xs text-neutral-400">
                        {new Date(ep.date).toLocaleDateString(
                          locale === 'ar' ? 'ar-AE' : 'en-GB',
                          { year: 'numeric', month: 'long', day: 'numeric' },
                        )}
                      </time>
                    ) : (
                      <span />
                    )}
                    <a
                      href={youtubeWatchUrl(ep.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={isClone ? -1 : undefined}
                      className="text-xs font-semibold text-[#4d7c0f] hover:underline"
                    >
                      {t(locale, 'Watch on YouTube', 'شاهد على يوتيوب')}
                    </a>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
