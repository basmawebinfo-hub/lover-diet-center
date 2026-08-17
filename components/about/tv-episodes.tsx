'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Play, Tv } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'
import {
  TV_EPISODES,
  youtubeEmbedUrl,
  youtubeThumbUrl,
  youtubeWatchUrl,
} from '@/lib/tv-episodes'

/**
 * Gallery of Dr. Wael's televised episodes.
 *
 * Each card is a facade: a static thumbnail plus a play button. The YouTube
 * iframe is only created for the card the visitor actually clicks. Rendering
 * thirteen iframes up front would pull in several megabytes of player script
 * on a page that is otherwise prerendered static HTML, and would do it for
 * every visitor including the ones who never press play.
 */
export function TvEpisodes() {
  const { locale } = useLocale()
  const [playing, setPlaying] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-6 flex items-center justify-center gap-2 text-[#4d7c0f]">
        <Tv className="size-5" aria-hidden="true" />
        <h3 className="text-lg font-bold">
          {t(locale, 'Television Episodes', 'الحلقات التلفزيونية')}
        </h3>
      </div>
      <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-neutral-600">
        {t(
          locale,
          'Episodes aired on Sharjah TV, covering nutrition topics for a general audience.',
          'حلقات عُرضت على تلفزيون الشارقة تتناول موضوعات التغذية لجمهور عام.'
        )}
      </p>

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TV_EPISODES.map((ep) => {
          const title = locale === 'ar' ? ep.titleAr : ep.titleEn
          const isPlaying = playing === ep.id

          return (
            <li
              key={ep.id}
              className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
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
                    aria-label={t(locale, `Play: ${title}`, `تشغيل: ${title}`)}
                    className="group absolute inset-0 size-full cursor-pointer"
                  >
                    <Image
                      src={youtubeThumbUrl(ep.id)}
                      alt=""
                      fill
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
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
                    <time
                      dateTime={ep.date}
                      className="text-xs text-neutral-400"
                      // Fixed locale so the digits do not switch between
                      // Arabic-Indic and Latin depending on the browser.
                    >
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
  )
}
