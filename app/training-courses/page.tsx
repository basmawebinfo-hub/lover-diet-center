import type { Metadata } from 'next'
import { TrainingCoursesContent } from './training-courses-content'
import { canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Training Courses | الدورات التدريبية',
  description: 'Online and in-person nutrition, fitness, and healthy-lifestyle courses with certificates from Lover Diet Center. دورات تغذية ولياقة ونمط حياة صحي بشهادات.',
  alternates: { canonical: canonical('/training-courses') },
}

import { Reveal } from '@/components/ui/reveal'

export default function TrainingCoursesPage() {
  return (
    <Reveal className="animate-fade-in">
      <TrainingCoursesContent />
    </Reveal>
  )
}
