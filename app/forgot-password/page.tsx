import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Reset your password',
}

export default function ForgotPasswordPage() {
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
        <p className="mt-3 text-sm text-neutral-500">
          Enter the email linked to your account and we'll send you a reset link.
        </p>

        <form className="mt-6 space-y-4" action="#">
          <div>
            <label className="block text-sm font-semibold text-neutral-700">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-b from-lime-400 to-lime-500 py-3.5 text-base font-bold text-lime-950 shadow-sm transition hover:-translate-y-0.5"
          >
            Send reset link
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-neutral-400">
          Remembered it?{' '}
          <Link href="/sign-in" className="font-semibold text-lime-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
