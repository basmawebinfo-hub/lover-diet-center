import { HealthyMealsContent } from './healthy-meals-content'
import { Reveal } from '@/components/ui/reveal'
import { makeLocaleMetadata } from '@/lib/seo'

export const generateMetadata = makeLocaleMetadata('/healthy-meals', {
  en: {
    title: 'Healthy Meals',
    description:
      'Chef-prepared, macro-balanced healthy meals delivered fresh to your door in the UAE.',
  },
  ar: {
    title: 'الوجبات الصحية',
    description:
      'وجبات صحية متوازنة يحضّرها الطهاة وتصلك طازجة إلى بابك في الإمارات.',
  },
})

export default function HealthyMealsPage() {
  return (
    <Reveal className="animate-fade-in">
      <HealthyMealsContent />
    </Reveal>
  )
}
