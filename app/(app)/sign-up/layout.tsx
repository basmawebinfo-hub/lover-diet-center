import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account | إنشاء حساب',
  description: 'Create your Lover Diet Center account and start your personalized nutrition journey. أنشئ حسابك وابدأ رحلتك الصحية.',
  robots: { index: false, follow: true },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
