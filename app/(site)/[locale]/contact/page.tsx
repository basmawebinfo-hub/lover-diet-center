import { ContactContent } from './contact-content'
import { makeLocaleMetadata } from '@/lib/seo'

export const generateMetadata = makeLocaleMetadata('/contact', {
  en: {
    title: 'Contact Us',
    description:
      'Get in touch with Lover Diet Center UAE. Book a consultation or ask us anything.',
  },
  ar: {
    title: 'تواصل معنا',
    description:
      'تواصل مع Lover Diet Center في الإمارات. احجز استشارتك أو اسألنا عن أي شيء.',
  },
})

export default function ContactPage() {
  return <ContactContent />
}
