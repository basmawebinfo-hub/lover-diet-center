import { HealthySnacksContent } from './healthy-snacks-content'
import { Reveal } from '@/components/ui/reveal'
import { makeLocaleMetadata } from '@/lib/seo'

export const generateMetadata = makeLocaleMetadata('/healthy-snacks', {
  en: {
    title: 'Healthy Snacks & Supplements',
    description:
      'Guilt-free protein bars, dried fruits, nuts, and organic supplements from Lover Diet Center UAE.',
  },
  ar: {
    title: 'السناكس والمكمّلات الصحية',
    description:
      'ألواح بروتين وفواكه مجففة ومكسرات ومكمّلات عضوية معتمدة من Lover Diet Center بالإمارات.',
  },
})

export default function HealthySnacksPage() {
  return (
    <Reveal className="animate-fade-in">
      <HealthySnacksContent />
    </Reveal>
  )
}
