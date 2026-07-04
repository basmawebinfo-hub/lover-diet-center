'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, t } from '@/lib/locale'
import { checkRateLimitClient } from '@/lib/security/rate-limit-client'
import { GoogleButton } from '@/components/ui/google-button'

export function SignIn2() {
  const { locale } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect') || '/dashboard'
  // Only permit same-site relative paths — prevents open-redirect via ?redirect=//evil.com
  const redirect = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(rawRedirect) ? rawRedirect : '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  // Surface auth-callback errors (e.g. Google OAuth failure, expired recovery link).
  // Also handle success flashes: ?reset=1 -> password was just reset.
  useEffect(() => {
    const e = searchParams.get('error')
    if (e) setError(decodeURIComponent(e))
    if (searchParams.get('reset') === '1') {
      setFlash(t(locale, 'Password updated. Please sign in with your new password.', 'تم تحديث كلمة المرور. يرجى تسجيل الدخول بكلمة المرور الجديدة.'))
    }
    if (searchParams.get('signedout') === '1') {
      setFlash(t(locale, 'You have been signed out.', 'تم تسجيل خروجك.'))
    }
  }, [searchParams, locale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Basic validation
      if (!email || !password) {
        setError(t(locale, 'Please enter your email and password.', 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'))
        return
      }
      if (password.length < 8) {
        setError(t(locale, 'Password must be at least 8 characters.', 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.'))
        return
      }

      // Rate-limit pre-check (Phase 4 · M-01). Fails-open on network error.
      // Admin sign-in is auto-upgraded to admin_auth server-side when the
      // submitted email matches the known admin address.
      const gate = await checkRateLimitClient('sign_in', email.toLowerCase().trim())
      if (!gate.ok) {
        setError(
          t(
            locale,
            `${gate.message} (retry in ${gate.retryAfterSec}s)`,
            `طلبات كثيرة. يرجى الانتظار قليلاً ثم إعادة المحاولة (${gate.retryAfterSec} ثانية).`,
          ),
        )
        return
      }

      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (signInError) {
        setError(t(locale, 'Invalid email or password. Please try again.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة. حاول مرة أخرى.'))
        return
      }

      // Admins go straight to the admin dashboard
      const { data: auth } = await supabase.auth.getUser()
      let dest = redirect
      if (auth.user) {
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', auth.user.id).single()
        if ((prof as { role?: string } | null)?.role === 'admin') dest = '/admin'
      }

      router.push(dest)
      router.refresh()
    } catch {
      setError(t(locale, 'Something went wrong. Please try again.', 'حدث خطأ ما. حاول مرة أخرى.'))
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
        <h1 className="text-2xl font-bold text-neutral-900">{t(locale, 'Welcome back', 'مرحباً بعودتك')}</h1>
        <p className="text-neutral-500 mt-1">{t(locale, 'Sign in to access your personalized health plan.', 'سجّل الدخول للوصول إلى خطتك الصحية المخصصة.')}</p>
      </div>

      {/* OAuth */}
      <div className="mb-5">
        <GoogleButton next={redirect} />
      </div>
      <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        {t(locale, 'or continue with email', 'أو تابع بالبريد الإلكتروني')}
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {flash && !error && (
          <div className="bg-lime-50 border border-lime-200 text-lime-800 text-sm px-4 py-3 rounded-xl">
            {flash}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t(locale, 'Email', 'البريد الإلكتروني')}</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]/30 focus:border-[#4d7c0f] transition-shadow"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-neutral-700">{t(locale, 'Password', 'كلمة المرور')}</label>
            <a href="/forgot-password" className="text-xs text-[#4d7c0f] hover:underline">
              {t(locale, 'Forgot password?', 'نسيت كلمة المرور؟')}
            </a>
          </div>
          <input
            type="password"
            autoComplete="current-password"
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
              {t(locale, 'Signing in...', 'جارٍ تسجيل الدخول...')}
            </>
          ) : (
            <>
              {t(locale, 'Get Started', 'ابدأ الآن')}
              <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-neutral-500 mt-6">
        {t(locale, "Don't have an account?", 'ليس لديك حساب؟')}{' '}
        <a href="/sign-up" className="text-[#4d7c0f] font-semibold hover:underline">
          {t(locale, 'Create one', 'أنشئ حساباً')}
        </a>
      </p>
    </div>
  )
}
