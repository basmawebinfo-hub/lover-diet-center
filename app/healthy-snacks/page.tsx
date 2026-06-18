import type { Metadata } from 'next'
import { HealthySnacksContent } from './healthy-snacks-content'

export const metadata: Metadata = {
  title: 'Healthy Snacks & Supplements | السناكس والمكمّلات الصحية',
  description: 'Guilt-free protein bars, dried fruits, nuts, and organic supplements from Lover Diet Center UAE. ألواح بروتين ومكسرات ومكمّلات صحية معتمدة.',
}

export default function HealthySnacksPage() {
  return <HealthySnacksContent />
}
