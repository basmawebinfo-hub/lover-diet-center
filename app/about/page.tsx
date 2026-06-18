import type { Metadata } from 'next'
import { AboutContent } from './about-content'

export const metadata: Metadata = {
  title: 'About Us | من نحن',
  description:
    "Learn about Lover Diet Center — UAE's leading nutrition and wellness center founded by Dr. Wael Mostafa. تعرّف على Lover Diet Center، المركز الرائد للتغذية والعافية في الإمارات بتأسيس الدكتور وائل مصطفى.",
}

export default function AboutPage() {
  return <AboutContent />
}
