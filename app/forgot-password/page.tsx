"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, t } from '@/lib/locale'

// Password recovery entry point.
//
// The email itself is sent by Supabase Auth (via the SMTP settings in
// the Supabase Dashboard — Resend in production). We do not send the
// email ourselves. What THIS component does:
//
//   1. Ask Supabase to enqueue a recovery email for `email`.
//   2. Log the exact SDK response to the browser console for diagnostics.
//   3. Surface any real error to the user (e.g. rate limit hit, SMTP
//      misconfigured, domain not verified).
//   4. On success, show the "check inbox" screen.
//
// The link Supabase includes in the email is built from the SiteURL
// and the "Reset Password" template (which must use {{ .TokenHash }},
// pointing at /auth/confirm — updated separately in the dashboard).
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
    const normalized = email.trim().toLowerCase()

    try {
      const supabase = createClient()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''

      // Log the attempt so admins can trace failures in the browser console.
      console.log('[forgot-password] requesting recovery email for', normalized)

      const { data, error: err } = await supabase.auth.resetPasswordForEmail(
        normalized,
        { redirectTo: `${origin}/auth/confirm?next=/reset-password` },
      )

      if (err) {
        // Real errors we might see:
        //   - "For security purposes, you can only request this once every 60 seconds"
        //   - "Error sending recovery email" (SMTP misconfigured / domain unverified)
        //   - "Email rate limit exceeded"
        console.error('[forgot-password] resetPasswordForEmail failed', err)
        setError(err.message)
        return
      }

      console.log('[forgot-password] enqueued OK', data)
      setSent(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[forgot-password] unexpected exception', e)
      setError(msg || t(locale, 'Something went wrong. Please try again.', 'حدث خطأ ما. حاول مرة أخرى.'))
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
            <p>{t(locale, 'If an account exists for', 'إذا كان هناك حساب مرتبط بـ')} <strong>{email}</strong>{t(locale, ', a reset link is on its way. Check your inbox (and spam folder).', '، فإن رابط إعادة التعيين في طريقه إليك. تحقّق من بريدك (والرسائل غير المرغوبة).')}</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-neutral-500">
              {t(locale, "Enter the email linked to your account and we'll send you a reset link.", 'أدخل البريد المرتبط بحسابك وسنرسل لك رابط إعادة التعيين.')}
            </p>
            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
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
