import type { Metadata } from 'next'
import { NutritionConsultationsContent } from './nutrition-consultations-content'
import { canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Nutrition Consultations | الاستشارات الغذائية',
  description: 'One-on-one personalized nutrition consultations with certified dietitians at Lover Diet Center UAE. استشارات غذائية فردية مع أخصائيين معتمدين.',
  alternates: { canonical: canonical('/nutrition-consultations') },
}

import { Reveal } from '@/components/ui/reveal'

export default function NutritionConsultationsPage() {
  return (
    <Reveal className="animate-fade-in">
      <NutritionConsultationsContent />
    </Reveal>
  )
}
