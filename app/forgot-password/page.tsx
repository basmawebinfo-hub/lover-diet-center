"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/sign-in` : undefined,
      })
      if (err) { setError(err.message); return }
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f3fae6] to-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm">
        <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-lime-700">
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>

        <div className="mt-6 flex size-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Mail className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-neutral-900">Reset your password</h1>
        <p className="font-arabic text-sm text-neutral-500 mt-1" dir="rtl">إعادة تعيين كلمة المرور</p>

        {sent ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-lime-50 p-4 text-sm text-lime-800">
            <Check className="mt-0.5 size-5 shrink-0 text-lime-600" />
            <p>If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox.</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-neutral-500">
              Enter the email linked to your account and we&apos;ll send you a reset link.
            </p>
            {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-b from-lime-400 to-lime-500 py-3.5 text-base font-bold text-lime-950 shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-xs text-neutral-400">
          Remembered it?{' '}
          <Link href="/sign-in" className="font-semibold text-lime-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
