import type { Metadata } from 'next'
import { TrainingCoursesContent } from './training-courses-content'

export const metadata: Metadata = {
  title: 'Training Courses | الدورات التدريبية',
  description: 'Online and in-person nutrition, fitness, and healthy-lifestyle courses with certificates from Lover Diet Center. دورات تغذية ولياقة ونمط حياة صحي بشهادات.',
}

export default function TrainingCoursesPage() {
  return <TrainingCoursesContent />
}
