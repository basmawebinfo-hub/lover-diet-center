import type { Metadata } from 'next'
import { HealthyMealsContent } from './healthy-meals-content'

export const metadata: Metadata = {
  title: 'Healthy Meals | الوجبات الصحية',
  description: 'Chef-prepared, macro-balanced healthy meals delivered fresh to your door in UAE. وجبات صحية متوازنة يحضّرها الطهاة وتصلك طازجة في الإمارات.',
}

import { Reveal } from '@/components/ui/reveal'

export default function HealthyMealsPage() {
  return (
    <Reveal className="animate-fade-in">
      <HealthyMealsContent />
    </Reveal>
  )
}
