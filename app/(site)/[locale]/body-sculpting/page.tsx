import { BodySculptingContent } from './body-sculpting-content'
import { Reveal } from '@/components/ui/reveal'
import { makeLocaleMetadata } from '@/lib/seo'

export const generateMetadata = makeLocaleMetadata('/body-sculpting', {
  en: {
    title: 'Body Sculpting Sessions',
    description:
      'Advanced fat-breaking and body sculpting sessions at Lover Diet Center UAE.',
  },
  ar: {
    title: 'جلسات نحت الجسم',
    description:
      'جلسات تكسير دهون ونحت القوام المتقدّمة في Lover Diet Center بالإمارات.',
  },
})

export default function BodySculptingPage() {
  return (
    <Reveal className="animate-fade-in">
      <BodySculptingContent />
    </Reveal>
  )
}
