import type { Metadata } from 'next'
import { BodySculptingContent } from './body-sculpting-content'
import { canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Body Sculpting Sessions | جلسات نحت الجسم',
  description: 'Advanced fat-breaking and body sculpting sessions at Lover Diet Center UAE. جلسات تكسير دهون ونحت الجسم المتقدّمة.',
  alternates: { canonical: canonical('/body-sculpting') },
}

import { Reveal } from '@/components/ui/reveal'

export default function BodySculptingPage() {
  return (
    <Reveal className="animate-fade-in">
      <BodySculptingContent />
    </Reveal>
  )
}
