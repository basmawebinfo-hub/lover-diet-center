"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, t } from '@/lib/locale'

// User lands here after clicking the recovery link in their email.
//
// There are TWO possible flows depending on how the Supabase recovery email
// template is configured:
//
// 1. TokenHash flow (recommended, requires /auth/confirm):
//    The user lands here with a real session cookie already set by
//    supabase.auth.verifyOtp() in /auth/confirm/route.ts. supabase.auth.getUser()
//    returns the correct user, and we can call updateUser({ password }).
//
// 2. Fragment flow (legacy Supabase default template):
//    The email link goes to <project>.supabase.co/auth/v1/verify which then
//    redirects here with #access_token=…&refresh_token=…&type=recovery in the
//    URL fragment. The client Supabase SDK's detectSessionInUrl picks it up
//    when it initializes, but with @supabase/ssr's createBrowserClient the
//    behaviour differs. We manually parse the fragment and call setSession().
//
// Either way, we then just check auth state and let the user pick a password.
export default function ResetPasswordPage() {
  const { locale } = useLocale()
  const router = useRouter()

  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // Boot: handle the fragment case, then verify session.
  useEffect(() => {
    const supabase = createClient()

    // 1) If the URL fragment carries recovery tokens (legacy flow), consume them.
    //    Fragment sample: #access_token=xxx&refresh_token=yyy&expires_in=3600&type=recovery
    let usedFragment = false
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      const type = params.get('type')
      if (access_token && refresh_token && type === 'recovery') {
        usedFragment = true
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(({ data }) => {
            setAuthed(!!data.user)
            setChecking(false)
            // Clear the sensitive tokens from the URL so they aren't logged anywhere.
            window.history.replaceState(null, '', window.location.pathname)
          })
          .catch(() => {
            setAuthed(false)
            setChecking(false)
          })
      }
    }

    if (usedFragment) return

    // 2) Normal path: /auth/confirm has already set the session cookie via
    //    verifyOtp(). Just read it.
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user)
      setChecking(false)
    })

    // 3) Also listen for PASSWORD_RECOVERY events (belt-and-suspenders for the
    //    fragment flow when setSession fires later).
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setAuthed(true)
        setChecking(false)
      }
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(t(locale, 'Password must be at least 8 characters.', 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.'))
      return
    }
    if (password !== confirm) {
      setError(t(locale, 'Passwords do not match.', 'كلمتا المرور غير متطابقتين.'))
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) { setError(err.message); return }
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError(t(locale, 'Something went wrong. Please try again.', 'حدث خطأ ما. حاول مرة أخرى.'))
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-lime-600" />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f3fae6] to-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm">
        <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-lime-700">
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t(locale, 'Back to sign in', 'العودة لتسجيل الدخول')}
        </Link>

        <div className="mt-6 flex size-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Lock className="size-6" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-neutral-900">
          {t(locale, 'Choose a new password', 'اختر كلمة مرور جديدة')}
        </h1>

        {!authed ? (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            {t(locale,
              "This reset link has expired or is invalid. Request a new one.",
              'انتهت صلاحية هذا الرابط أو أنه غير صالح. اطلب رابطاً جديداً.')}
            <div className="mt-3">
              <Link href="/forgot-password" className="font-semibold text-lime-700 hover:underline">
                {t(locale, 'Request a new link', 'اطلب رابطاً جديداً')}
              </Link>
            </div>
          </div>
        ) : done ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-lime-50 p-4 text-sm text-lime-800">
            <Check className="mt-0.5 size-5 shrink-0 text-lime-600" />
            <p>{t(locale,
              'Password updated. Redirecting to your dashboard…',
              'تم تحديث كلمة المرور. جارٍ إعادة التوجيه إلى لوحتك…')}</p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-neutral-500">
              {t(locale,
                'Pick a strong password you have not used before. Minimum 8 characters.',
                'اختر كلمة مرور قوية لم تستخدمها من قبل. 8 أحرف على الأقل.')}
            </p>
            {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700">
                  {t(locale, 'New password', 'كلمة المرور الجديدة')}
                </label>
                <input
                  type="password" required minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700">
                  {t(locale, 'Confirm password', 'تأكيد كلمة المرور')}
                </label>
                <input
                  type="password" required minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full rounded-xl bg-gradient-to-b from-lime-400 to-lime-500 py-3.5 text-base font-bold text-lime-950 shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? t(locale, 'Saving…', 'جارٍ الحفظ…') : t(locale, 'Update password', 'تحديث كلمة المرور')}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
