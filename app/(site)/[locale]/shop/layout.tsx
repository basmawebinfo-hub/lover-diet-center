import { makeLocaleMetadata } from '@/lib/seo'
import { FloatingCart } from '@/components/shop/floating-cart'

export const generateMetadata = makeLocaleMetadata('/shop', {
  en: {
    title: 'Shop',
    description:
      'Browse healthy snacks, protein bars, drinks, and supplements from Lover Diet Center. Free delivery across the UAE.',
  },
  ar: {
    title: 'المتجر',
    description:
      'تسوّق سناكس صحية وألواح بروتين ومشروبات ومكمّلات من Lover Diet Center — توصيل مجاني في الإمارات.',
  },
})

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingCart />
    </>
  )
}
