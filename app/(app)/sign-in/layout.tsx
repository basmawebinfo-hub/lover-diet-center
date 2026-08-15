import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | تسجيل الدخول',
  description: 'Sign in to your Lover Diet Center account to access your personalized plan. سجّل الدخول إلى حسابك.',
  robots: { index: false, follow: true },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
