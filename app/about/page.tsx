import type { Metadata } from 'next'
import { AboutContent } from './about-content'
import { canonical, SITE_URL, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Dr. Wael Mousa — Medical Nutrition Specialist | د. وائل موسى',
  description:
    'Meet Dr. Wael Mousa — DHA & MOH licensed medical nutrition specialist with 30+ years of experience, founder of Lovers Diet Center UAE. تعرّف على د. وائل موسى، أخصائي التغذية العلاجية المعتمد ومؤسس Lovers Diet Center.',
  alternates: { canonical: canonical('/about') },
  keywords: [
    'Dr. Wael Mousa', 'nutrition specialist UAE', 'dietitian Dubai',
    'therapeutic nutrition', 'Lovers Diet Center', 'د. وائل موسى', 'أخصائي تغذية الإمارات',
  ],
}

// Person schema — establishes Dr. Wael's professional identity for search engines.
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/about#person`,
  name: 'Dr. Wael Mousa',
  alternateName: 'د. وائل موسى',
  jobTitle: 'Medical Nutrition Specialist',
  description:
    'DHA & MOH licensed medical nutrition specialist with over 30 years of experience in therapeutic nutrition and weight management. Founder of Lovers Diet Center.',
  image: `${SITE_URL}/dr-wael.png`,
  url: `${SITE_URL}/about`,
  worksFor: { '@id': `${SITE_URL}/#organization` },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Helwan University' },
    { '@type': 'CollegeOrUniversity', name: 'El-Menofiya University' },
    { '@type': 'CollegeOrUniversity', name: 'Tanta University' },
  ],
  hasCredential: [
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'Bachelor of Home Economics — Nutrition & Food Science, Helwan University (1994)' },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: "Master's Degree in Nutrition & Food Science, El-Menofiya University (2000)" },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'license', name: 'DHA Qualified — Dubai Health Authority' },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'license', name: 'MOH Qualified — UAE Ministry of Health' },
  ],
  award: 'Gold Medal for frontline work during the COVID-19 pandemic',
  knowsAbout: ['Therapeutic Nutrition', 'Weight Management', 'Meal Planning', 'Lifestyle Coaching'],
  sameAs: [
    'https://www.instagram.com/lovers_diet_center',
    'https://www.youtube.com/channel/UCb0n5fTajQsT8oUC3_2sG6Q',
  ],
} as const

// MedicalBusiness schema for the center itself.
const medicalBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  '@id': `${SITE_URL}/about#medicalbusiness`,
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  logo: `${SITE_URL}/ldc-logo.png`,
  description:
    'Medical nutrition center offering personalized diet programs, therapeutic nutrition, healthy meals, body sculpting and weight management in the UAE.',
  founder: { '@id': `${SITE_URL}/about#person` },
  medicalSpecialty: 'Nutrition',
  areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
  address: { '@type': 'PostalAddress', addressCountry: 'AE' },
} as const

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'About Dr. Wael Mousa', item: `${SITE_URL}/about` },
  ],
} as const

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is Dr. Wael Mousa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dr. Wael Mousa is a DHA & MOH licensed medical nutrition specialist with over 30 years of experience in therapeutic nutrition, and the founder of Lovers Diet Center in the UAE.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Dr. Wael Mousa licensed in the UAE?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — he is qualified by both the Dubai Health Authority (DHA) and the UAE Ministry of Health (MOH), and his academic degrees are officially equalized by the UAE Ministry of Higher Education.',
      },
    },
    {
      '@type': 'Question',
      name: 'What services does Lovers Diet Center offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Personalized nutrition programs, therapeutic nutrition consultations, healthy meal plans, body sculpting sessions, and continuous weight-management follow-up.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I book a consultation with Dr. Wael Mousa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can book directly through the Lovers Diet Center website at loversdc.com or via WhatsApp.',
      },
    },
  ],
} as const

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <AboutContent />
    </>
  )
}
