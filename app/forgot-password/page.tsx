"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, t } from '@/lib/locale'

export default function ForgotPasswordPage() {
  const { locale } = useLocale()
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
      // The recovery email will land the user on /auth/confirm, which calls
      // verifyOtp() server-side (stateless, cross-browser). After success, it
      // redirects the user to /reset-password where they can pick a new password.
      //
      // IMPORTANT: for this to work, Supabase Dashboard -> Authentication ->
      // Email Templates -> "Reset password" must use the {{ .TokenHash }}
      // template variable, NOT {{ .ConfirmationURL }}. The redirect_to below
      // is the base URL Supabase will resolve {{ .SiteURL }} against.
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          // We point at /auth/confirm and pass next=/reset-password so after
          // the OTP is verified, the user lands on the password form.
          redirectTo: `${origin}/auth/confirm?next=/reset-password`,
        },
      )
      if (err) { setError(err.message); return }
      setSent(true)
    } catch {
      setError(t(locale, 'Something went wrong. Please try again.', 'حدث خطأ ما. حاول مرة أخرى.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f3fae6] to-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm">
        <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-lime-700">
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t(locale, 'Back to sign in', 'العودة لتسجيل الدخول')}
        </Link>

        <div className="mt-6 flex size-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Mail className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-neutral-900">{t(locale, 'Reset your password', 'إعادة تعيين كلمة المرور')}</h1>

        {sent ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-lime-50 p-4 text-sm text-lime-800">
            <Check className="mt-0.5 size-5 shrink-0 text-lime-600" />
            <p>{t(locale, 'If an account exists for', 'إذا كان هناك حساب مرتبط بـ')} <strong>{email}</strong>{t(locale, ', a reset link is on its way. Check your inbox.', '، فإن رابط إعادة التعيين في طريقه إليك. تحقّق من بريدك.')}</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-neutral-500">
              {t(locale, "Enter the email linked to your account and we'll send you a reset link.", 'أدخل البريد المرتبط بحسابك وسنرسل لك رابط إعادة التعيين.')}
            </p>
            {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700">{t(locale, 'Email', 'البريد الإلكتروني')}</label>
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
                {loading ? t(locale, 'Sending…', 'جارٍ الإرسال…') : t(locale, 'Send reset link', 'إرسال رابط إعادة التعيين')}
              </button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-xs text-neutral-400">
          {t(locale, 'Remembered it?', 'تذكّرتها؟')}{' '}
          <Link href="/sign-in" className="font-semibold text-lime-700 hover:underline">{t(locale, 'Sign in', 'تسجيل الدخول')}</Link>
        </p>
      </div>
    </main>
  )
}
