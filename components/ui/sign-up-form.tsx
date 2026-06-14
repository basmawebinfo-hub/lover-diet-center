'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, UserPlus, User, Mail, Lock } from 'lucide-react'

export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/onboarding'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address.')
      return false
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return false
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    router.push(redirect)
  }

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A6E]/30 focus:border-[#1A7A6E] transition-shadow text-sm"

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#E8F5F3] mb-4">
          <UserPlus className="size-6 text-[#0D4F4A]" />
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900">Create your account</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Start your personalized health journey today.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="relative">
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <User className="size-4 text-neutral-400" />
            </div>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="Sarah Al Maktoum"
              className={inputClass}
            />
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail className="size-4 text-neutral-400" />
            </div>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              placeholder="sarah@example.com"
              className={inputClass}
            />
          </div>
        </div>

        {/* Password */}
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock className="size-4 text-neutral-400" />
            </div>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              placeholder="Min. 8 characters"
              className={inputClass}
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock className="size-4 text-neutral-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              required
              placeholder="Repeat password"
              className={inputClass}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#0D4F4A] hover:bg-[#0a3d38] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <UserPlus className="size-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign in link */}
      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <a
          href={`/sign-in${redirect ? `?redirect=${redirect}` : ''}`}
          className="text-[#0D4F4A] font-medium hover:text-[#0a3d38] transition-colors"
        >
          Sign in
        </a>
      </p>
    </div>
  )
}