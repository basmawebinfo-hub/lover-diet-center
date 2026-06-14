import Link from 'next/link'
import { WHATSAPP_DIRECT } from '@/lib/site'
import { CheckCircle, ArrowRight, Stethoscope } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nutrition Consultations',
  description: 'One-on-one personalized nutrition consultations with certified dietitians at Lover Diet Center UAE.',
}

const features = [
  { en: 'Personalized meal plan tailored to your goals', ar: 'خطة وجبات مخصصة حسب أهدافك' },
  { en: 'BMI & body composition analysis', ar: 'تحليل مؤشر كتلة الجسم والتركيب الجسدي' },
  { en: 'Weekly follow-up sessions', ar: 'جلسات متابعة أسبوعية' },
  { en: 'Supplement & lifestyle guidance', ar: 'إرشادات المكملات الغذائية ونمط الحياة' },
  { en: '150+ certified nutritionists', ar: 'أكثر من 150 خبير تغذية معتمد' },
  { en: 'Online & in-clinic options', ar: 'خيارات عبر الإنترنت وفي العيادة' },
]

export default function NutritionConsultationsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#4d7c0f]/10 text-[#4d7c0f] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Stethoscope className="w-4 h-4" />
            Nutrition Consultations
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Your Personal Nutrition Expert,{' '}
            <span className="text-[#4d7c0f]">On Your Side</span>
          </h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Get a science-backed, personalized nutrition plan from certified dietitians. Whether your goal is weight loss, muscle gain, or simply eating better — we have a plan for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#4d7c0f] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#155f56] transition-colors"
            >
              Book a Free Consultation
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#4d7c0f] text-[#4d7c0f] font-semibold px-8 py-4 rounded-2xl hover:bg-[#4d7c0f]/5 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">
            What's Included in Every Consultation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-[#f0faf7] rounded-2xl">
                <CheckCircle className="w-5 h-5 text-[#4d7c0f] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-neutral-800">{f.en}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">{f.ar}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#4d7c0f] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-white/80 mb-8">Join 3,000+ members who transformed their health with Lover Diet Center.</p>
          <a
            href={WHATSAPP_DIRECT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#4d7c0f] font-bold px-8 py-4 rounded-2xl hover:bg-neutral-100 transition-colors"
          >
            Chat on WhatsApp
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </main>
  )
}
