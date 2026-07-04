"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, t } from '@/lib/locale'
import { checkRateLimitClient } from '@/lib/security/rate-limit-client'

const COOLDOWN_SECONDS = 60

export default function ForgotPasswordPage() {
  const { locale } = useLocale()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)   // seconds remaining until the resend is unlocked
  const [resent, setResent] = useState(false)   // set true briefly after a successful resend
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown ticker for the resend button.
  useEffect(() => {
    if (cooldown <= 0) return
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [cooldown])

  const sendReset = async (opts: { isResend?: boolean } = {}) => {
    setError('')
    setResent(false)
    setLoading(true)
    const normalized = email.trim().toLowerCase()

    // Rate-limit pre-check (Phase 4 · M-01). First-time sends use the
    // forgot_password budget (3/hr per email); resend clicks use the
    // email_resend budget (5/hr per email). Fails-open on network error.
    const preset = opts.isResend ? 'email_resend' : 'forgot_password'
    const gate = await checkRateLimitClient(preset, normalized)
    if (!gate.ok) {
      setError(
        t(
          locale,
          `${gate.message} (retry in ${gate.retryAfterSec}s)`,
          `طلبات كثيرة. يرجى الانتظار قليلاً ثم إعادة المحاولة (${gate.retryAfterSec} ثانية).`,
        ),
      )
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      console.log('[forgot-password] requesting', opts.isResend ? 'resend' : 'initial', 'for', normalized)

      const { error: err } = await supabase.auth.resetPasswordForEmail(
        normalized,
        { redirectTo: `${origin}/auth/confirm?next=/reset-password` },
      )

      if (err) {
        console.error('[forgot-password] resetPasswordForEmail failed', err)
        setError(err.message)
        return
      }

      setSent(true)
      setCooldown(COOLDOWN_SECONDS)
      if (opts.isResend) {
        setResent(true)
        // Auto-hide the "resent" confirmation after 4 seconds.
        setTimeout(() => setResent(false), 4000)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[forgot-password] unexpected exception', e)
      setError(msg || t(locale, 'Something went wrong. Please try again.', 'حدث خطأ ما. حاول مرة أخرى.'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || cooldown > 0) return
    sendReset({ isResend: false })
  }

  const handleResend = () => {
    if (loading || cooldown > 0 || !email.trim()) return
    sendReset({ isResend: true })
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
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-lime-50 p-4 text-sm text-lime-800">
              <Check className="mt-0.5 size-5 shrink-0 text-lime-600" />
              <div>
                <p>{t(locale, 'If an account exists for', 'إذا كان هناك حساب مرتبط بـ')} <strong>{email}</strong>{t(locale, ', a reset link is on its way. Check your inbox (and spam folder).', '، فإن رابط إعادة التعيين في طريقه إليك. تحقّق من بريدك (والرسائل غير المرغوبة).')}</p>
                {resent && (
                  <p className="mt-1 text-xs font-semibold text-lime-700">
                    {t(locale, 'A new email has been sent.', 'تم إرسال بريد جديد.')}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 text-sm text-neutral-600">
              <p className="mb-3">
                {t(locale,
                  "Didn't receive it? You can resend the email once the countdown ends.",
                  "لم يصلك؟ يمكنك إعادة إرسال البريد بعد انتهاء العدّاد.")}
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-lime-200 bg-white px-5 py-3 text-sm font-semibold text-lime-800 transition hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
                {loading
                  ? t(locale, 'Sending…', 'جارٍ الإرسال…')
                  : cooldown > 0
                    ? t(locale, `Resend in ${cooldown}s`, `إعادة الإرسال خلال ${cooldown} ثانية`)
                    : t(locale, 'Resend email', 'إعادة إرسال البريد')}
              </button>
            </div>

            <p className="text-center text-xs text-neutral-400">
              {t(locale, "Wrong email?", "بريد خاطئ؟")}{' '}
              <button
                type="button"
                onClick={() => { setSent(false); setError(''); setResent(false) }}
                className="font-semibold text-lime-700 hover:underline"
              >
                {t(locale, 'Change it', 'تغييره')}
              </button>
            </p>
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
