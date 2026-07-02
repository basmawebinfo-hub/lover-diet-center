"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, t } from '@/lib/locale'

// User lands here after clicking the recovery link in their email.
// By this point /auth/callback has already exchanged the recovery `code`
// for a session, so supabase.auth.getUser() returns the correct user.
// We simply capture a new password and call updateUser.
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

  // Verify the recovery session is live.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user)
      setChecking(false)
    })
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
