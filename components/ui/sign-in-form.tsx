'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'

export function SignIn2() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/onboarding'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate sign-in - replace with actual auth logic
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // After successful sign-in, redirect to the intended destination
    router.push(redirect)
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#E8F5F3] mb-4">
          <LogIn className="size-6 text-[#0D4F4A]" />
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900">Welcome back</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Sign in to access your personalized health plan.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A6E]/30 focus:border-[#1A7A6E] transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A6E]/30 focus:border-[#1A7A6E] transition-shadow"
          />
        </div>

        <div className="flex items-center justify-end">
          <a
            href="/forgot-password"
            className="text-sm text-[#0D4F4A] hover:text-[#0a3d38] font-medium transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0D4F4A] hover:bg-[#0a3d38] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Get Started
              <LogIn className="size-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign up link */}
      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <a href="/sign-up" className="text-[#0D4F4A] font-medium hover:text-[#0a3d38] transition-colors">
          Create one
        </a>
      </p>
    </div>
  )
}