import type { Metadata } from 'next'
import { canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Shop | المتجر',
  description:
    'Browse healthy snacks, protein bars, drinks, and supplements from Lover Diet Center. Free delivery across the UAE. تسوّق سناكس صحية وألواح بروتين ومكمّلات — توصيل مجاني في الإمارات.',
  alternates: { canonical: canonical('/shop') },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
