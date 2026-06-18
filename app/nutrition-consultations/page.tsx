import type { Metadata } from 'next'
import { NutritionConsultationsContent } from './nutrition-consultations-content'

export const metadata: Metadata = {
  title: 'Nutrition Consultations | الاستشارات الغذائية',
  description: 'One-on-one personalized nutrition consultations with certified dietitians at Lover Diet Center UAE. استشارات غذائية فردية مع أخصائيين معتمدين.',
}

export default function NutritionConsultationsPage() {
  return <NutritionConsultationsContent />
}
