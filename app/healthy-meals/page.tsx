import type { Metadata } from 'next'
import { HealthyMealsContent } from './healthy-meals-content'
import { canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Healthy Meals | الوجبات الصحية',
  description: 'Chef-prepared, macro-balanced healthy meals delivered fresh to your door in UAE. وجبات صحية متوازنة يحضّرها الطهاة وتصلك طازجة في الإمارات.',
  alternates: { canonical: canonical('/healthy-meals') },
}

import { Reveal } from '@/components/ui/reveal'

export default function HealthyMealsPage() {
  return (
    <Reveal className="animate-fade-in">
      <HealthyMealsContent />
    </Reveal>
  )
}
