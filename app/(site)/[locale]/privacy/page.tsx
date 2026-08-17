import { PrivacyContent } from './privacy-content'
import { makeLocaleMetadata } from '@/lib/seo'

export const generateMetadata = makeLocaleMetadata('/privacy', {
  en: {
    title: 'Privacy Policy',
    description:
      'What personal and health data Lover Diet Center collects, why we hold it, who else can see it, and how to have it corrected or deleted.',
  },
  ar: {
    title: 'سياسة الخصوصية',
    description:
      'ما البيانات الشخصية والصحية التي يجمعها Lover Diet Center، ولماذا نحتفظ بها، ومن غيرنا يطّلع عليها، وكيف تطلب تصحيحها أو حذفها.',
  },
})

export default function PrivacyPage() {
  return <PrivacyContent />
}
