'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, UserPlus, User, Mail, Lock, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, t } from '@/lib/locale'
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries'
import { GoogleButton } from '@/components/ui/google-button'

export function SignUpForm() {
  const { locale } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect') || '/onboarding'
  // Only permit same-site relative paths — prevents open-redirect via ?redirect=//evil.com
  const redirect = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(rawRedirect) ? rawRedirect : '/onboarding'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [country, setCountry] = useState(DEFAULT_COUNTRY.code)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError(t(locale, 'Please fill in all fields.', 'يرجى تعبئة جميع الحقول.'))
      return false
    }
    const digits = form.phone.replace(/[^0-9]/g, '')
    if (digits.length < 6) {
      setError(t(locale, 'Please enter a valid phone number.', 'يرجى إدخال رقم هاتف صحيح.'))
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
      const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? ''
      const fullPhone = `${dial}${form.phone.replace(/[^0-9]/g, '')}`
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email.toLowerCase().trim(),
        password: form.password,
        options: {
          data: { name: form.name.trim(), phone: fullPhone, country },
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Write the phone + name into the profile right away (session is active; email confirmation OFF)
      const { data: auth } = await supabase.auth.getUser()
      if (auth.user) {
        await supabase.from('profiles').update({
          phone: fullPhone,
          name_en: form.name.trim(),
          country,
        }).eq('id', auth.user.id)
      }

      // Go to onboarding.
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

      <div className="mb-5">
        <GoogleButton next={redirect} />
      </div>
      <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" />
        {t(locale, 'or continue with email', 'أو تابع بالبريد الإلكتروني')}
        <span className="h-px flex-1 bg-neutral-200" />
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

        {/* Phone with country selector */}
        <div className="flex gap-2">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="shrink-0 rounded-xl border border-neutral-200 bg-white px-2 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]/30 focus:border-[#4d7c0f]"
            aria-label={t(locale, 'Country', 'الدولة')}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <Phone className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input
              type="tel"
              inputMode="numeric"
              placeholder={t(locale, 'Phone number', 'رقم الهاتف')}
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/[^0-9]/g, '') }))}
              required
              className={inputClass}
            />
          </div>
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
