import { AboutContent } from './about-content'
import { makeLocaleMetadata } from '@/lib/seo'

export const generateMetadata = makeLocaleMetadata('/about', {
  en: {
    title: 'About Us',
    description:
      "Learn about Lover Diet Center — the UAE's leading nutrition and wellness center, founded by Dr. Wael Mostafa.",
  },
  ar: {
    title: 'من نحن',
    description:
      'تعرّف على Lover Diet Center، المركز الرائد للتغذية والعافية في الإمارات بتأسيس الدكتور وائل مصطفى.',
  },
})

export default function AboutPage() {
  return <AboutContent />
}
