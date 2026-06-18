'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, UserPlus, User, Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, t } from '@/lib/locale'

export function SignUpForm() {
  const { locale } = useLocale()
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
      setError(t(locale, 'Please fill in all fields.', 'يرجى تعبئة جميع الحقول.'))
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError(t(locale, 'Please enter a valid email address.', 'يرجى إدخال بريد إلكتروني صحيح.'))
      return false
    }
    if (form.password.length < 8) {
      setError(t(locale, 'Password must be at least 8 characters.', 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.'))
      return false
    }
    if (form.password !== form.confirmPassword) {
      setError(t(locale, 'Passwords do not match.', 'كلمتا المرور غير متطابقتين.'))
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
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        options: {
          data: { name: form.name.trim() },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Session is set automatically (email confirmation OFF). Go to onboarding.
      router.push(redirect)
      router.refresh()
    } catch {
      setError(t(locale, 'Something went wrong. Please try again.', 'حدث خطأ ما. حاول مرة أخرى.'))
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]/30 focus:border-[#4d7c0f] transition-shadow text-sm"

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Heading */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-[#E8F5F3] mb-4">
          <UserPlus className="size-6 text-[#0D4F4A]" />
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900">{t(locale, 'Create your account', 'أنشئ حسابك')}</h1>
        <p className="text-sm text-neutral-500 mt-1">{t(locale, 'Start your health journey today.', 'ابدأ رحلتك الصحية اليوم.')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="relative">
          <User className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            placeholder={t(locale, 'Full name', 'الاسم الكامل')}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="email"
            placeholder={t(locale, 'Email address', 'البريد الإلكتروني')}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="password"
            placeholder={t(locale, 'Password (min. 8 characters)', 'كلمة المرور (8 أحرف على الأقل)')}
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="password"
            placeholder={t(locale, 'Confirm password', 'تأكيد كلمة المرور')}
            value={form.confirmPassword}
            onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#4d7c0f] text-white font-semibold py-3.5 rounded-xl hover:bg-[#155f56] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t(locale, 'Creating account...', 'جارٍ إنشاء الحساب...')}
            </>
          ) : (
            <>
              {t(locale, 'Create Account', 'إنشاء حساب')}
              <UserPlus className="size-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-6">
        {t(locale, 'Already have an account?', 'لديك حساب بالفعل؟')}{' '}
        <a href="/sign-in" className="text-[#4d7c0f] font-semibold hover:underline">
          {t(locale, 'Sign in', 'تسجيل الدخول')}
        </a>
      </p>
    </div>
  )
}
