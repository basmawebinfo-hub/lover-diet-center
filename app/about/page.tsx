import Image from 'next/image'
import Link from 'next/link'
import { WHATSAPP_DIRECT } from '@/lib/site'
import { ArrowRight, Award, Users, Star } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: "Learn about Lover Diet Center — UAE's leading nutrition and wellness center founded by Dr. Wael Mostafa.",
}

const stats = [
  { value: '3,000+', label: 'Happy Clients', labelAr: 'عميل سعيد' },
  { value: '150+', label: 'Certified Experts', labelAr: 'خبير معتمد' },
  { value: '96%', label: 'Success Rate', labelAr: 'معدل النجاح' },
  { value: '4.9', label: 'Average Rating', labelAr: 'متوسط التقييم' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1A7A6E]/10 text-[#1A7A6E] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Award className="w-4 h-4" />
              About Us
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
              Science-Based Nutrition,{' '}
              <span className="text-[#1A7A6E]">Real Results</span>
            </h1>
            <p className="text-lg text-neutral-600 mb-6">
              Lover Diet Center was founded with one mission: to make expert nutrition guidance accessible to everyone in the UAE. We combine cutting-edge science with personalized care to help you reach your health goals.
            </p>
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1A7A6E] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#155f56] transition-colors"
            >
              Talk to Us
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="relative h-80 rounded-3xl overflow-hidden bg-[#f0faf7]">
            <Image
              src="/dr-wael.png"
              alt="Dr. Wael Mostafa - Founder"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-[#1A7A6E]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-white/80 mt-1">{stat.label}</p>
              <p className="text-white/60 text-sm">{stat.labelAr}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Our Story</h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            Founded by Dr. Wael Mostafa, Lover Diet Center started as a small clinic in the UAE with a simple belief: that every person deserves a personalized approach to nutrition. No generic diets, no one-size-fits-all plans.
          </p>
          <p className="text-neutral-600 leading-relaxed mb-4">
            Today, we are proud to serve over 3,000 clients across the UAE with a team of 150+ certified nutritionists, dietitians, and wellness coaches. Our approach combines the latest nutritional science with cultural sensitivity and practical lifestyle guidance.
          </p>
          <p className="text-neutral-600 leading-relaxed">
            Whether you want to lose weight, build muscle, manage a health condition, or simply eat better — we are here to guide you every step of the way.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-50 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Start Your Journey Today</h2>
          <p className="text-neutral-600 mb-8">Join thousands of clients who have transformed their health with us.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#1A7A6E] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#155f56] transition-colors"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-[#1A7A6E] text-[#1A7A6E] font-bold px-8 py-4 rounded-2xl hover:bg-[#1A7A6E]/5 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
