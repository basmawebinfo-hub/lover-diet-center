"use client"

import { useState } from 'react'
import { WHATSAPP_DIRECT, WHATSAPP_NUMBER, socialLinks, waLink } from '@/lib/site'
import { MessageCircle, MapPin, Clock, Phone, Send, CheckCircle2 } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

export function ContactContent() {
  const { locale } = useLocale()
  const [form, setForm] = useState({ name: '', phone: '', topic: '', message: '' })

  const topics = [
    t(locale, 'Book a consultation', 'حجز استشارة'),
    t(locale, 'Healthy meals & delivery', 'الوجبات الصحية والتوصيل'),
    t(locale, 'Body sculpting', 'نحت الجسم'),
    t(locale, 'Supplements & snacks', 'المكمّلات والسناكس'),
    t(locale, 'Training courses', 'الدورات التدريبية'),
    t(locale, 'Other inquiry', 'استفسار آخر'),
  ]

  const buildMessage = () => {
    const lines = [
      t(locale, 'Hello Lover Diet Center,', 'مرحباً Lover Diet Center،'),
      form.name ? `${t(locale, 'Name', 'الاسم')}: ${form.name}` : '',
      form.topic ? `${t(locale, 'Topic', 'الموضوع')}: ${form.topic}` : '',
      form.message ? `${t(locale, 'Message', 'الرسالة')}: ${form.message}` : '',
    ].filter(Boolean)
    return lines.join('\n')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.open(waLink(buildMessage()), '_blank', 'noopener,noreferrer')
  }

  const contactCards = [
    {
      icon: MessageCircle,
      title: t(locale, 'WhatsApp', 'واتساب'),
      value: `+${WHATSAPP_NUMBER}`,
      sub: t(locale, 'Fastest reply — within minutes', 'أسرع رد — خلال دقائق'),
      link: WHATSAPP_DIRECT,
      linkLabel: t(locale, 'Chat Now', 'تواصل الآن'),
      accent: 'bg-[#25D366]',
    },
    {
      icon: MapPin,
      title: t(locale, 'Location', 'الموقع'),
      value: t(locale, 'UAE — Dubai & Abu Dhabi', 'الإمارات — دبي وأبوظبي'),
      sub: t(locale, 'In-clinic & online sessions', 'جلسات في العيادة وعبر الإنترنت'),
      link: null,
      linkLabel: null,
      accent: 'bg-[#4d7c0f]',
    },
    {
      icon: Clock,
      title: t(locale, 'Working Hours', 'ساعات العمل'),
      value: t(locale, 'Sat–Thu: 9am – 9pm', 'السبت–الخميس: 9 صباحاً – 9 مساءً'),
      sub: t(locale, 'Friday: by appointment', 'الجمعة: بموعد مسبق'),
      link: null,
      linkLabel: null,
      accent: 'bg-[#0D4F4A]',
    },
  ]

  const benefits = [
    t(locale, 'Reply within minutes on WhatsApp', 'رد خلال دقائق على واتساب'),
    t(locale, 'Free 15-minute discovery call', 'مكالمة تعريفية مجانية 15 دقيقة'),
    t(locale, 'Certified nutritionists', 'أخصائيو تغذية معتمدون'),
    t(locale, 'Support in Arabic & English', 'دعم بالعربية والإنجليزية'),
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D4F4A] via-[#15604f] to-[#4d7c0f] px-4 pt-28 pb-24">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 6l-2 5h-5l4 3-1.5 5L20 21l4.5 3-1.5-5 4-3h-5z' fill='none' stroke='%23ffffff' stroke-width='0.6'/%3E%3C/svg%3E")`, backgroundSize: '40px 40px' }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            <MessageCircle className="size-4" />
            {t(locale, "We're here for you", 'نحن هنا من أجلك')}
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold text-white leading-tight">
            {t(locale, 'Talk to a real nutrition expert', 'تحدّث إلى خبير تغذية حقيقي')}
          </h1>
          <p className="mt-5 text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            {t(
              locale,
              'Have a question or ready to start? Send us a message and our team will get back to you — usually within minutes.',
              'لديك سؤال أو جاهز للبدء؟ أرسل لنا رسالة وسيرد عليك فريقنا — عادةً خلال دقائق.'
            )}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#1ebe5d] transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              {t(locale, 'Chat on WhatsApp', 'تواصل عبر واتساب')}
            </a>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="inline-flex items-center justify-center gap-2 border border-white/30 bg-white/10 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <Phone className="w-5 h-5" />
              {t(locale, 'Call us', 'اتصل بنا')}
            </a>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="px-4 -mt-14 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {contactCards.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-lg shadow-neutral-900/5 border border-neutral-100 flex flex-col">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${item.accent} rounded-2xl mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-neutral-700 text-sm font-medium" dir="ltr">{item.value}</p>
                <p className="text-neutral-400 text-xs mt-1">{item.sub}</p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-[#4d7c0f] font-semibold text-sm hover:gap-2 transition-all"
                  >
                    {item.linkLabel} <Send className="size-3.5 rtl:rotate-180" />
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Form + benefits */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-7 sm:p-8">
            <h2 className="text-2xl font-bold text-neutral-900">{t(locale, 'Send us a message', 'أرسل لنا رسالة')}</h2>
            <p className="text-neutral-500 text-sm mt-2 mb-6">
              {t(locale, "Fill in the form and we'll continue the conversation on WhatsApp.", 'املأ النموذج وسنكمل الحديث معك على واتساب.')}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t(locale, 'Your name', 'اسمك')}</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t(locale, 'e.g. Sara Ahmed', 'مثال: سارة أحمد')}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]/30 focus:border-[#4d7c0f]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t(locale, 'What can we help with?', 'بماذا يمكننا مساعدتك؟')}</label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]/30 focus:border-[#4d7c0f]"
                >
                  <option value="">{t(locale, 'Select a topic', 'اختر موضوعاً')}</option>
                  {topics.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t(locale, 'Your message', 'رسالتك')}</label>
                <textarea
                  rows={4} value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder={t(locale, 'Tell us a little about your goal...', 'أخبرنا قليلاً عن هدفك...')}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]/30 focus:border-[#4d7c0f] resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-xl hover:bg-[#1ebe5d] transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <MessageCircle className="size-5" />
                {t(locale, 'Send via WhatsApp', 'إرسال عبر واتساب')}
              </button>
            </form>
          </div>

          {/* Why contact us + social */}
          <div className="lg:pt-4">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">{t(locale, 'Why reach out?', 'لماذا تتواصل معنا؟')}</h2>
            <ul className="space-y-3 mb-10">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-lime-100 text-[#4d7c0f]">
                    <CheckCircle2 className="size-4" />
                  </span>
                  <span className="text-neutral-700">{b}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-3xl bg-[#f0faf7] p-6">
              <h3 className="font-bold text-neutral-900 mb-1">{t(locale, 'Follow Us', 'تابعنا')}</h3>
              <p className="text-neutral-500 text-sm mb-4">{t(locale, 'Tips, recipes, and success stories.', 'نصائح ووصفات وقصص نجاح.')}</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Facebook', href: socialLinks.facebook },
                  { label: 'TikTok', href: socialLinks.tiktok },
                  { label: 'YouTube', href: socialLinks.youtube },
                  { label: 'Pinterest', href: socialLinks.pinterest },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-white border border-neutral-200 rounded-xl font-semibold text-sm text-neutral-700 hover:border-[#4d7c0f] hover:text-[#4d7c0f] transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
