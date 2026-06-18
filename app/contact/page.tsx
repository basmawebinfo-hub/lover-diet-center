import type { Metadata } from 'next'
import { ContactContent } from './contact-content'

export const metadata: Metadata = {
  title: 'Contact Us | تواصل معنا',
  description: 'Get in touch with Lover Diet Center UAE. Book a consultation or ask us anything. تواصل مع Lover Diet Center في الإمارات.',
}

export default function ContactPage() {
  return <ContactContent />
}
