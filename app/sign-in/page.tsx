'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import { SignIn2 } from '@/components/ui/sign-in-form'
import { Check } from 'lucide-react'

function SignInLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="size-8 animate-spin rounded-full border-2 border-lime-200 border-t-lime-600" />
    </div>
  )
}

export default function SignInPage() {
  const trustBadges = [
    'Certified Nutritionists',
    'Science-backed meal plans',
    '500+ success stories',
  ]

  return (
    <div className="min-h-screen flex">
      {/* LEFT HALF - Decorative health-themed panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0D4F4A] to-[#1A7A6E]">
        {/* Subtle background pattern - scattered leaf/cross SVG icons */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <svg
            className="absolute top-10 left-10 w-16 h-16 text-white/20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
          </svg>
          <svg
            className="absolute top-32 right-20 w-12 h-12 text-white/15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
          </svg>
          <svg
            className="absolute bottom-20 left-1/4 w-10 h-10 text-white/25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
          </svg>
          <svg
            className="absolute top-1/2 right-1/4 w-14 h-14 text-white/20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
          </svg>
          <svg
            className="absolute bottom-1/3 left-1/3 w-8 h-8 text-white/15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
          </svg>
          <svg
            className="absolute top-20 right-1/3 w-10 h-10 text-white/10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
          </svg>
          <svg
            className="absolute bottom-10 right-10 w-12 h-12 text-white/15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
          </svg>
          <svg
            className="absolute top-1/3 left-1/4 w-6 h-6 text-white/20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M12 2L9 9H2l6 4.5L5.5 22 12 17l6.5 5-2.5-8.5L22 9h-7L12 2z" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          {/* Logo/Brand */}
          <div className="mb-10 flex items-center gap-3">
            <Image
              src="/ldc-logo.png"
              alt="Lover Diet Center logo"
              width={48}
              height={48}
              priority
              className="size-12 rounded-full object-cover shadow-md ring-2 ring-white/30"
            />
            <span className="text-2xl font-bold text-white tracking-tight">
              lovers<span className="text-lime-200">dc</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Your health journey starts here.
          </h1>

          {/* Subtext */}
          <p className="mt-4 text-lg text-white/70">
            Sign in to access your personalized nutrition plan.
          </p>

          {/* Trust badges */}
          <div className="mt-10 space-y-4">
            {trustBadges.map((badge) => (
              <div key={badge} className="flex items-center gap-3 text-white/90">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                  <Check className="size-4" />
                </span>
                <span className="font-medium">{badge}</span>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div className="mt-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
              Trusted by 2,000+ clients
            </span>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div
          className="absolute -bottom-20 -left-20 size-64 rounded-full bg-lime-600/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -top-10 -right-10 size-48 rounded-full bg-lime-400/20 blur-2xl"
          aria-hidden="true"
        />
      </div>

      {/* RIGHT HALF - Sign-in form (full width on mobile) */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F0FAF8] lg:bg-white">
        <div className="w-full max-w-sm lg:max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-2xl font-bold text-lime-700 tracking-tight">
              lovers<span className="text-lime-500">dc</span>
            </span>
          </div>

          <Suspense fallback={<SignInLoadingFallback />}>
            <SignIn2 />
          </Suspense>
        </div>
      </div>
    </div>
  )
}