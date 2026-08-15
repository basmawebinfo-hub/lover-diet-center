import { NutritionConsultationsContent } from './nutrition-consultations-content'
import { Reveal } from '@/components/ui/reveal'
import { makeLocaleMetadata } from '@/lib/seo'

export const generateMetadata = makeLocaleMetadata('/nutrition-consultations', {
  en: {
    title: 'Nutrition Consultations',
    description:
      'One-on-one personalized nutrition consultations with certified dietitians at Lover Diet Center UAE.',
  },
  ar: {
    title: 'الاستشارات الغذائية',
    description:
      'استشارات غذائية فردية مخصصة مع أخصائيين معتمدين في Lover Diet Center بالإمارات.',
  },
})

export default function NutritionConsultationsPage() {
  return (
    <Reveal className="animate-fade-in">
      <NutritionConsultationsContent />
    </Reveal>
  )
}
