"use client"

import { WHATSAPP_DIRECT, WHATSAPP_NUMBER, socialLinks } from '@/lib/site'
import { MessageCircle, MapPin, Clock } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

export function ContactContent() {
  const { locale } = useLocale()

  const contactInfo = [
    {
      icon: MessageCircle,
      title: t(locale, 'WhatsApp', 'واتساب'),
      value: `+${WHATSAPP_NUMBER}`,
      link: WHATSAPP_DIRECT,
      linkLabel: t(locale, 'Chat Now', 'تواصل الآن'),
    },
    {
      icon: MapPin,
      title: t(locale, 'Location', 'الموقع'),
      value: t(locale, 'UAE — Dubai & Abu Dhabi', 'الإمارات — دبي وأبوظبي'),
      link: null,
      linkLabel: null,
    },
    {
      icon: Clock,
      title: t(locale, 'Working Hours', 'ساعات العمل'),
      value: t(locale, 'Sat–Thu: 9am – 9pm', 'السبت–الخميس: 9 صباحاً – 9 مساءً'),
      link: null,
      linkLabel: null,
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            {locale === 'ar' ? (
              <>نحن هنا{' '}<span className="text-[#4d7c0f]">لمساعدتك</span></>
            ) : (
              <>We're Here to{' '}<span className="text-[#4d7c0f]">Help You</span></>
            )}
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            {t(
              locale,
              'Have a question? Want to book a consultation? Reach out to us on WhatsApp — we typically respond within minutes.',
              'لديك سؤال؟ تريد حجز استشارة؟ تواصل معنا عبر واتساب — نردّ عادةً خلال دقائق.'
            )}
          </p>
          <a
            href={WHATSAPP_DIRECT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#1ebe5d] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {t(locale, 'Chat on WhatsApp', 'تواصل عبر واتساب')}
          </a>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="bg-[#f0faf7] rounded-3xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#4d7c0f]/10 rounded-2xl mb-4">
                    <Icon className="w-6 h-6 text-[#4d7c0f]" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-1">{item.title}</h3>
                  <p className="text-neutral-600 text-sm mb-3" dir="ltr">{item.value}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4d7c0f] font-semibold text-sm hover:underline"
                    >
                      {item.linkLabel}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">{t(locale, 'Follow Us', 'تابعنا')}</h2>
          <p className="text-neutral-600 mb-8">{t(locale, 'Stay updated with tips, recipes, and success stories.', 'ابقَ على اطلاع بالنصائح والوصفات وقصص النجاح.')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-neutral-200 rounded-2xl font-semibold text-neutral-700 hover:border-[#4d7c0f] hover:text-[#4d7c0f] transition-colors">Facebook</a>
            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-neutral-200 rounded-2xl font-semibold text-neutral-700 hover:border-[#4d7c0f] hover:text-[#4d7c0f] transition-colors">TikTok</a>
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-neutral-200 rounded-2xl font-semibold text-neutral-700 hover:border-[#4d7c0f] hover:text-[#4d7c0f] transition-colors">YouTube</a>
            <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-neutral-200 rounded-2xl font-semibold text-neutral-700 hover:border-[#4d7c0f] hover:text-[#4d7c0f] transition-colors">Pinterest</a>
          </div>
        </div>
      </section>
    </main>
  )
}
