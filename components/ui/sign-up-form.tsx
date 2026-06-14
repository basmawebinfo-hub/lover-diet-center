'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, UserPlus, User, Mail, Lock } from 'lucide-react'

function setAuthCookie(email: string) {
  const token = btoa(`${email}:${Date.now()}`)
  document.cookie = `ldc_auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  localStorage.setItem('ldc_auth_email', email)
}

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
    try {
      // Check if email already registered
      const storedUsers = JSON.parse(localStorage.getItem('ldc_users') || '[]') as Array<{ email: string; password: string; name: string }>
      const exists = storedUsers.find((u) => u.email.toLowerCase() === form.email.toLowerCase())
      if (exists) {
        setError('An account with this email already exists. Please sign in.')
        return
      }

      // Save new user
      storedUsers.push({
        email: form.email.toLowerCase(),
        password: form.password,
        name: form.name.trim(),
      })
      localStorage.setItem('ldc_users', JSON.stringify(storedUsers))

      // Set auth cookie and redirect to onboarding
      setAuthCookie(form.email)
      router.push(redirect)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
        <p className="text-sm text-neutral-500 mt-1">Start your health journey today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="password"
            placeholder="Password (min. 8 characters)"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#1A7A6E] text-white font-semibold py-3.5 rounded-xl hover:bg-[#155f56] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
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

      <p className="text-center text-sm text-neutral-500 mt-6">
        Already have an account?{' '}
        <a href="/sign-in" className="text-[#1A7A6E] font-semibold hover:underline">
          Sign in
        </a>
      </p>
    </div>
  )
}
