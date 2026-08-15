import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password | إعادة تعيين كلمة المرور',
  description: 'Reset your Lover Diet Center account password. إعادة تعيين كلمة مرور حسابك.',
  robots: { index: false, follow: true },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
