'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'

// Simple auth helper — sets a cookie so middleware can protect routes.
// Replace this with a real Supabase/API call once the backend is ready.
function setAuthCookie(email: string) {
  const token = btoa(`${email}:${Date.now()}`)
  // httpOnly can't be set from JS — this is a client-side cookie for now.
  // When Supabase is added, the server will set a proper httpOnly cookie.
  document.cookie = `ldc_auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  localStorage.setItem('ldc_auth_email', email)
}

export function SignIn2() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Basic validation
      if (!email || !password) {
        setError('Please enter your email and password.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }

      // Check if user exists in localStorage (pre-Supabase flow)
      const storedUsers = JSON.parse(localStorage.getItem('ldc_users') || '[]') as Array<{ email: string; password: string; name: string }>
      const user = storedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        setError('No account found with this email. Please sign up first.')
        return
      }

      if (user.password !== password) {
        setError('Incorrect password. Please try again.')
        return
      }

      // Set auth cookie & redirect
      setAuthCookie(email)
      router.push(redirect)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8">
      {/* Heading */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#4d7c0f]/10 rounded-2xl mb-4">
          <LogIn className="w-6 h-6 text-[#4d7c0f]" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
        <p className="text-neutral-500 mt-1">Sign in to access your personalized health plan.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]/30 focus:border-[#4d7c0f] transition-shadow"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-neutral-700">Password</label>
            <a href="/forgot-password" className="text-xs text-[#4d7c0f] hover:underline">
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]/30 focus:border-[#4d7c0f] transition-shadow"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#4d7c0f] text-white font-semibold py-3.5 rounded-xl hover:bg-[#155f56] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Get Started
              <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-neutral-500 mt-6">
        Don&apos;t have an account?{' '}
        <a href="/sign-up" className="text-[#4d7c0f] font-semibold hover:underline">
          Create one
        </a>
      </p>
    </div>
  )
}
