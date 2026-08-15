import { TrainingCoursesContent } from './training-courses-content'
import { Reveal } from '@/components/ui/reveal'
import { makeLocaleMetadata } from '@/lib/seo'

export const generateMetadata = makeLocaleMetadata('/training-courses', {
  en: {
    title: 'Training Courses',
    description:
      'Online and in-person nutrition, fitness, and healthy-lifestyle courses with certificates from Lover Diet Center.',
  },
  ar: {
    title: 'الدورات التدريبية',
    description:
      'دورات تغذية ولياقة ونمط حياة صحي، أونلاين وحضوريًا، بشهادات معتمدة من Lover Diet Center.',
  },
})

export default function TrainingCoursesPage() {
  return (
    <Reveal className="animate-fade-in">
      <TrainingCoursesContent />
    </Reveal>
  )
}
