import type { Metadata } from 'next'
import { HealthyMealsContent } from './healthy-meals-content'

export const metadata: Metadata = {
  title: 'Healthy Meals | الوجبات الصحية',
  description: 'Chef-prepared, macro-balanced healthy meals delivered fresh to your door in UAE. وجبات صحية متوازنة يحضّرها الطهاة وتصلك طازجة في الإمارات.',
}

export default function HealthyMealsPage() {
  return <HealthyMealsContent />
}
