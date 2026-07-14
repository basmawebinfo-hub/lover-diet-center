"use client"

import Image from 'next/image'
import Link from 'next/link'
import { WHATSAPP_DIRECT } from '@/lib/site'
import {
  ArrowRight, Award, GraduationCap, BadgeCheck, Stethoscope, Briefcase,
  Tv, Radio, School, Presentation, PlayCircle, Medal, HeartHandshake,
  ClipboardList, UserCheck, Salad, Scale, Repeat, Sparkles, Building2,
} from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

export function AboutContent() {
  const { locale } = useLocale()

  const stats = [
    { value: '30+',    label: t(locale, 'Years of Experience', 'سنة خبرة') },
    { value: '3,000+', label: t(locale, 'Happy Clients', 'عميل سعيد') },
    { value: '2',      label: t(locale, 'UAE Medical Licenses', 'ترخيص طبي إماراتي') },
    { value: '4.9',    label: t(locale, 'Average Rating', 'متوسط التقييم') },
  ]

  const education = [
    {
      year: '1994',
      en: 'Bachelor of Home Economics — Nutrition & Food Science',
      ar: 'بكالوريوس الاقتصاد المنزلي — قسم التغذية وعلوم الأطعمة',
      subEn: 'Helwan University, Egypt — Very Good degree',
      subAr: 'جامعة حلوان، مصر — بتقدير جيد جداً',
    },
    {
      year: '2000',
      en: 'Master\u2019s Degree in Nutrition & Food Science',
      ar: 'ماجستير في التغذية وعلوم الأطعمة',
      subEn: 'El-Menofiya University — thesis presented at the International Nutrition Conference, Vienna 2001',
      subAr: 'جامعة المنوفية — نوقشت رسالته في مؤتمر التغذية الدولي بفيينا 2001',
    },
    {
      year: '2003',
      en: 'Pre-PhD Degree in Nutrition',
      ar: 'درجة تمهيدي الدكتوراه في التغذية',
      subEn: 'Tanta University, Egypt',
      subAr: 'جامعة طنطا، مصر',
    },
    {
      year: 'UAE',
      en: 'Degrees officially equalized in the UAE',
      ar: 'معادلة رسمية للشهادات في الإمارات',
      subEn: 'Ministry of Higher Education & Scientific Research, UAE',
      subAr: 'وزارة التعليم العالي والبحث العلمي الإماراتية',
    },
  ]

  const licenses = [
    {
      icon: BadgeCheck,
      en: 'DHA Qualified',
      ar: 'معتمد من هيئة الصحة بدبي DHA',
      subEn: 'Licensed by the Dubai Health Authority',
      subAr: 'مرخّص من هيئة الصحة بدبي',
    },
    {
      icon: BadgeCheck,
      en: 'MOH Qualified',
      ar: 'معتمد من وزارة الصحة MOH',
      subEn: 'Licensed by the UAE Ministry of Health since 2010',
      subAr: 'مرخّص من وزارة الصحة الإماراتية منذ 2010',
    },
    {
      icon: Stethoscope,
      en: 'Medical Nutrition Specialist',
      ar: 'أخصائي تغذية علاجية',
      subEn: 'Therapeutic nutrition & clinical weight management',
      subAr: 'تغذية علاجية وإدارة الوزن إكلينيكياً',
    },
  ]

  const journey = [
    {
      period: '1996 – 2007',
      en: 'Nutrition Specialist — Ministry of Education, Egypt',
      ar: 'أخصائي تغذية — وزارة التربية والتعليم، مصر',
      subEn: '11 years in El-Menofia governorate, alongside clinical nutrition work at Schweppes International and hospital training programs',
      subAr: '11 سنة بمحافظة المنوفية، إلى جانب عمله بقسم التغذية في مصنع شويبس الدولي وبرامج تدريب بالمستشفيات',
    },
    {
      period: t(locale, '3 years', '3 سنوات'),
      en: 'Nutritionist — Dr. Nutrition Center, UAE',
      ar: 'أخصائي تغذية — مركز Dr. Nutrition، الإمارات',
      subEn: 'Personalized diet programs and client follow-up',
      subAr: 'برامج غذائية مخصصة ومتابعة العملاء',
    },
    {
      period: t(locale, '4 years', '4 سنوات'),
      en: 'Nutritionist — VLCC International',
      ar: 'أخصائي تغذية — VLCC International',
      subEn: 'Weight management and wellness programs',
      subAr: 'برامج إدارة الوزن والصحة العامة',
    },
    {
      period: t(locale, 'Ongoing', 'مستمر'),
      en: 'Lecturer & Media Nutrition Expert',
      ar: 'محاضر وخبير تغذية إعلامي',
      subEn: 'Lectures at Abu Dhabi & Al Ain universities and schools, plus TV and radio nutrition programs',
      subAr: 'محاضرات بجامعات أبوظبي والعين والمدارس، وبرامج تغذية تلفزيونية وإذاعية',
    },
    {
      period: t(locale, 'Today', 'اليوم'),
      en: 'Founder — Lovers Diet Center & Lovers Diet Restaurant',
      ar: 'مؤسس — Lovers Diet Center ومطعم Lovers Diet',
      subEn: 'Slimming, fitness and therapeutic massage center in Umm Al Quwain, and a healthy-food restaurant in Ajman',
      subAr: 'مركز تخسيس ولياقة ومساج علاجي في أم القيوين، ومطعم أكل صحي في عجمان',
    },
  ]

  const media = [
    { icon: Tv, en: 'Television Programs', ar: 'برامج تلفزيونية' },
    { icon: Radio, en: 'Radio Shows', ar: 'برامج إذاعية' },
    { icon: Building2, en: 'University Lectures', ar: 'محاضرات جامعية' },
    { icon: School, en: 'School Awareness Talks', ar: 'ندوات توعية بالمدارس' },
    { icon: Presentation, en: 'Scientific Conferences', ar: 'مؤتمرات علمية' },
    { icon: PlayCircle, en: 'YouTube Educational Content', ar: 'محتوى تعليمي على يوتيوب' },
  ]

  const awards = [
    {
      icon: Medal,
      en: 'Gold Medal — COVID-19 Front Lines',
      ar: 'ميدالية ذهبية — الخطوط الأمامية لجائحة كورونا',
      subEn: 'Awarded for frontline work during the coronavirus pandemic',
      subAr: 'تكريماً لعمله في الخطوط الأمامية خلال جائحة كورونا',
    },
    {
      icon: Award,
      en: 'Government & Private Sector Recognition',
      ar: 'تكريمات حكومية وقطاع خاص',
      subEn: 'Multiple certificates for scientific and charitable contributions',
      subAr: 'شهادات تقدير متعددة عن المشاركات العلمية والخيرية',
    },
    {
      icon: HeartHandshake,
      en: 'Community Health Contributions',
      ar: 'مساهمات صحية مجتمعية',
      subEn: 'Ongoing health campaigns and public nutrition education',
      subAr: 'حملات صحية مستمرة وتثقيف غذائي للمجتمع',
    },
  ]

  const whyChoose = [
    { icon: ClipboardList, en: 'Personalized Programs', ar: 'برامج غذائية مخصصة', subEn: 'Plans built around your weight, age, height and health status', subAr: 'خطط مبنية على وزنك وعمرك وطولك وحالتك الصحية' },
    { icon: Stethoscope, en: 'Medical Supervision', ar: 'إشراف طبي', subEn: 'Licensed therapeutic nutrition with clinical follow-up', subAr: 'تغذية علاجية مرخّصة بمتابعة إكلينيكية' },
    { icon: Sparkles, en: 'Lifestyle Coaching', ar: 'تغيير نمط الحياة', subEn: 'Sustainable habits, not temporary diets', subAr: 'عادات مستدامة، مش حميات مؤقتة' },
    { icon: Salad, en: 'Healthy Meal Planning', ar: 'تخطيط وجبات صحية', subEn: 'Balanced meals covering all food elements', subAr: 'وجبات متوازنة تشمل كل العناصر الغذائية' },
    { icon: Scale, en: 'Weight Management', ar: 'إدارة الوزن', subEn: 'Evidence-based programs for weight loss and gain', subAr: 'برامج علمية لإنقاص الوزن أو زيادته' },
    { icon: Repeat, en: 'Continuous Follow-up', ar: 'متابعة مستمرة', subEn: 'Programs reviewed and adjusted regularly', subAr: 'مراجعة وتعديل البرامج بشكل دوري' },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#4d7c0f]/10 text-[#4d7c0f] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Award className="w-4 h-4" />
              {t(locale, 'Professional Medical Nutrition Specialist', 'أخصائي تغذية علاجية معتمد')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 leading-tight text-balance">
              {locale === 'ar' ? (
                <>د. وائل موسى{' '}<span className="text-[#4d7c0f]">خبرة تتجاوز 30 عاماً</span></>
              ) : (
                <>Dr. Wael Mousa{' '}<span className="text-[#4d7c0f]">30+ Years of Expertise</span></>
              )}
            </h1>
            <p className="text-lg text-neutral-600 mb-4">
              {t(
                locale,
                'Founder of Lovers Diet Center — a DHA & MOH licensed medical nutrition specialist helping thousands across the UAE transform their health through science-based, personalized nutrition.',
                'مؤسس Lovers Diet Center — أخصائي تغذية علاجية مرخّص من هيئة الصحة بدبي ووزارة الصحة، ساعد الآلاف في الإمارات على تحويل صحتهم عبر تغذية علمية مخصصة.'
              )}
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#4d7c0f]/20 px-3 py-1 text-xs font-semibold text-[#4d7c0f]">
                <BadgeCheck className="size-3.5" /> DHA
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#4d7c0f]/20 px-3 py-1 text-xs font-semibold text-[#4d7c0f]">
                <BadgeCheck className="size-3.5" /> MOH
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#4d7c0f]/20 px-3 py-1 text-xs font-semibold text-[#4d7c0f]">
                <GraduationCap className="size-3.5" /> {t(locale, 'M.Sc. Nutrition', 'ماجستير تغذية')}
              </span>
            </div>
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#4d7c0f] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#155f56] transition-colors"
            >
              {t(locale, 'Book Your Consultation', 'احجز استشارتك')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </a>
          </div>
          {/* Founder photo with brand-colored circle backdrop */}
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <div className="size-[86%] rounded-full bg-gradient-to-br from-[#4d7c0f] to-[#3f6212]" />
              <div className="absolute size-[86%] rounded-full ring-4 ring-lime-300/40" />
              <div className="absolute size-[97%] rounded-full border border-dashed border-[#4d7c0f]/25" />
            </div>
            <div className="absolute inset-0 flex items-end justify-center">
              <Image
                src="/dr-wael.png"
                alt={t(locale, 'Dr. Wael Mousa — Founder of Lovers Diet Center', 'د. وائل موسى — مؤسس Lovers Diet Center')}
                width={796}
                height={1173}
                sizes="(max-width: 768px) 90vw, 440px"
                className="h-[98%] w-auto object-contain object-bottom drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-[#4d7c0f]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-white/80 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Professional Summary */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            {t(locale, 'Professional Summary', 'نبذة مهنية')}
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            {t(
              locale,
              'With over 30 years of experience in therapeutic nutrition, Dr. Wael Mousa designs balanced nutrition programs tailored to each client\u2019s weight, age, height and overall health status — then monitors results and adjusts the plan continuously.',
              'بخبرة تتجاوز 30 عاماً في التغذية العلاجية، يصمم د. وائل موسى برامج غذائية متوازنة مخصصة لكل عميل حسب وزنه وعمره وطوله وحالته الصحية — ثم يتابع النتائج ويعدّل الخطة باستمرار.'
            )}
          </p>
          <p className="text-neutral-600 leading-relaxed">
            {t(
              locale,
              'His approach goes beyond diets: it is a complete lifestyle change, with special care for clients whose health conditions are caused or complicated by excess weight.',
              'نهجه يتجاوز الحميات: هو تغيير كامل لنمط الحياة، مع عناية خاصة بالعملاء الذين تسببت زيادة الوزن في مشاكلهم الصحية أو فاقمتها.'
            )}
          </p>
        </div>
      </section>

      {/* Academic Qualifications — timeline */}
      <section className="py-16 px-4 bg-[#f0faf7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">
            {t(locale, 'Academic Qualifications', 'المؤهلات الأكاديمية')}
          </h2>
          <ol className="relative border-s-2 border-[#4d7c0f]/20 space-y-8 ms-4">
            {education.map((item, i) => (
              <li key={i} className="relative ps-8">
                <span className="absolute -start-[13px] top-1 flex size-6 items-center justify-center rounded-full bg-[#4d7c0f] text-white">
                  <GraduationCap className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold text-[#4d7c0f]">{item.year}</span>
                <h3 className="mt-0.5 font-bold text-neutral-900">{t(locale, item.en, item.ar)}</h3>
                <p className="mt-1 text-sm text-neutral-600">{t(locale, item.subEn, item.subAr)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* UAE Medical Qualifications — cards */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">
            {t(locale, 'UAE Medical Qualifications', 'التراخيص الطبية في الإمارات')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {licenses.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="rounded-3xl border border-neutral-100 bg-white p-6 text-center shadow-sm hover:shadow-md hover:border-lime-300 transition-all">
                  <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#4d7c0f]/10 text-[#4d7c0f]">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <h3 className="font-bold text-neutral-900">{t(locale, item.en, item.ar)}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{t(locale, item.subEn, item.subAr)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Professional Journey — timeline */}
      <section className="py-16 px-4 bg-[#f0faf7]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">
            {t(locale, 'Professional Journey', 'المسيرة المهنية')}
          </h2>
          <ol className="relative border-s-2 border-[#4d7c0f]/20 space-y-8 ms-4">
            {journey.map((item, i) => (
              <li key={i} className="relative ps-8">
                <span className="absolute -start-[13px] top-1 flex size-6 items-center justify-center rounded-full bg-[#4d7c0f] text-white">
                  <Briefcase className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold text-[#4d7c0f]">{item.period}</span>
                <h3 className="mt-0.5 font-bold text-neutral-900">{t(locale, item.en, item.ar)}</h3>
                <p className="mt-1 text-sm text-neutral-600">{t(locale, item.subEn, item.subAr)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Media Presence */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3 text-center">
            {t(locale, 'Media & Community Presence', 'الحضور الإعلامي والمجتمعي')}
          </h2>
          <p className="text-neutral-600 text-center mb-10 max-w-2xl mx-auto">
            {t(
              locale,
              'A trusted nutrition voice on UAE television and radio, in universities, schools, and international scientific conferences.',
              'صوت موثوق في التغذية عبر تلفزيون وإذاعة الإمارات، وفي الجامعات والمدارس والمؤتمرات العلمية الدولية.'
            )}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {media.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#4d7c0f]/10 text-[#4d7c0f]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-neutral-800">{t(locale, item.en, item.ar)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16 px-4 bg-[#f0faf7]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">
            {t(locale, 'Awards & Recognition', 'الجوائز والتكريمات')}
          </h2>

          {/* Featured award — Ajman Youth Council crystal trophy */}
          <figure className="mb-8 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-[#f0faf7] shadow-sm">
            <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
              <div className="relative mx-auto flex h-64 w-52 items-center justify-center p-4 sm:h-72 sm:w-60">
                <div aria-hidden className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/40 blur-2xl" />
                <Image
                  src="/images/awards/ajman-youth-council-award.png"
                  alt={t(
                    locale,
                    'Crystal award from Ajman Youth Council honoring Dr. Wael Mousa for the 30-Day Challenge',
                    'درع تكريم كريستالي من مجلس شباب عجمان للدكتور وائل موسى عن تحدي الـ30 يوم',
                  )}
                  fill
                  sizes="(max-width: 640px) 208px, 240px"
                  className="object-contain mix-blend-multiply drop-shadow-lg"
                />
              </div>
              <figcaption className="px-6 pb-8 text-center sm:px-8 sm:py-8 sm:text-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  <Award className="size-3.5" aria-hidden="true" />
                  {t(locale, 'Featured Recognition', 'تكريم مميز')}
                </span>
                <h3 className="mt-3 text-xl font-bold text-neutral-900 text-balance">
                  {t(locale, '30-Day Challenge Award', 'درع تحدي الـ30 يوم')}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#4d7c0f]">
                  {t(locale, 'Ajman Youth Council — Youth Councils, UAE', 'مجلس شباب عجمان — مجالس الشباب، الإمارات')}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 text-pretty">
                  {t(
                    locale,
                    'Presented to Dr. Wael Mousa in appreciation of his contribution to the 30-Day Challenge community health initiative, promoting healthy nutrition and sustainable lifestyle change among youth.',
                    'مُنح للدكتور وائل موسى تقديراً لمساهمته في مبادرة تحدي الـ30 يوم الصحية المجتمعية، ودوره في نشر ثقافة التغذية الصحية وتغيير نمط الحياة بين الشباب.',
                  )}
                </p>
              </figcaption>
            </div>
          </figure>

          {/* Featured award — MBZ Frontline Heroes gold medal (image second on desktop for visual rhythm) */}
          <figure className="mb-8 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-bl from-amber-50/60 via-white to-[#f0faf7] shadow-sm">
            <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
              <figcaption className="order-2 px-6 pb-8 text-center sm:order-1 sm:px-8 sm:py-8 sm:text-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  <Medal className="size-3.5" aria-hidden="true" />
                  {t(locale, 'National Honor', 'تكريم وطني')}
                </span>
                <h3 className="mt-3 text-xl font-bold text-neutral-900 text-balance">
                  {t(locale, 'Frontline Heroes Gold Medal', 'الميدالية الذهبية لأبطال خط الدفاع الأول')}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#4d7c0f]">
                  {t(
                    locale,
                    'Awarded by H.H. Sheikh Mohamed bin Zayed Al Nahyan — UAE, March 2023',
                    'مُنحت من صاحب السمو الشيخ محمد بن زايد آل نهيان — الإمارات، مارس 2023',
                  )}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 text-pretty">
                  {t(
                    locale,
                    '"To Our Frontline Heroes" — a national gold medal honoring Dr. Wael Mousa\u2019s heroic role during the COVID-19 pandemic in protecting the health and safety of the UAE community, accompanied by a personal letter of gratitude.',
                    '"لأبطالنا في خط الدفاع الأول" — ميدالية ذهبية وطنية تكريماً للدور البطولي للدكتور وائل موسى خلال جائحة كوفيد-19 في حماية صحة مجتمع دولة الإمارات وسلامته، مصحوبة بخطاب شكر وتقدير شخصي.',
                  )}
                </p>
              </figcaption>
              <div className="relative order-1 mx-auto flex h-64 w-52 items-center justify-center p-4 sm:order-2 sm:h-72 sm:w-60">
                <div aria-hidden className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/40 blur-2xl" />
                <Image
                  src="/images/awards/frontline-heroes-medal.jpeg"
                  alt={t(
                    locale,
                    'Gold "To Our Frontline Heroes" medal with a letter of appreciation from Sheikh Mohamed bin Zayed Al Nahyan for Dr. Wael Mousa\u2019s role during COVID-19',
                    'الميدالية الذهبية "لأبطالنا في خط الدفاع الأول" مع خطاب شكر من الشيخ محمد بن زايد آل نهيان للدكتور وائل موسى عن دوره خلال جائحة كوفيد-19',
                  )}
                  fill
                  sizes="(max-width: 640px) 208px, 240px"
                  className="rounded-2xl object-cover object-top shadow-md"
                />
              </div>
            </div>
          </figure>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {awards.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="rounded-3xl border border-amber-100 bg-white p-6 text-center shadow-sm">
                  <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <h3 className="font-bold text-neutral-900">{t(locale, item.en, item.ar)}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{t(locale, item.subEn, item.subAr)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Dr. Wael */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 mb-10 text-center">
            {t(locale, 'Why Choose Dr. Wael', 'لماذا تختار د. وائل')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-lime-300 transition-all">
                  <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#4d7c0f]/10 text-[#4d7c0f]">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-bold text-neutral-900">{t(locale, item.en, item.ar)}</h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{t(locale, item.subEn, item.subAr)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-[#4d7c0f]">
        <div className="max-w-3xl mx-auto text-center">
          <UserCheck className="mx-auto mb-4 size-10 text-lime-300" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {t(locale, 'Our Mission', 'رسالتنا')}
          </h2>
          <p className="text-white/90 text-lg leading-relaxed text-pretty">
            {t(
              locale,
              'To make expert, science-based nutrition accessible to everyone in the UAE — transforming health through personalized programs, honest medical guidance, and a lifestyle you can actually sustain.',
              'أن نجعل التغذية العلمية المتخصصة في متناول الجميع في الإمارات — نحوّل الصحة عبر برامج مخصصة وإرشاد طبي صادق ونمط حياة يمكنك الاستمرار عليه فعلاً.'
            )}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-50 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4 text-balance">
            {t(locale, 'Book Your Consultation Today', 'احجز استشارتك اليوم')}
          </h2>
          <p className="text-neutral-600 mb-8">
            {t(
              locale,
              'Join thousands of clients who have transformed their health with Dr. Wael Mousa.',
              'انضم إلى آلاف العملاء الذين غيّروا صحتهم مع د. وائل موسى.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#4d7c0f] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#155f56] transition-colors"
            >
              {t(locale, 'Create Free Account', 'أنشئ حساباً مجانياً')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-[#4d7c0f] text-[#4d7c0f] font-bold px-8 py-4 rounded-2xl hover:bg-[#4d7c0f]/5 transition-colors"
            >
              {t(locale, 'Chat on WhatsApp', 'تواصل عبر واتساب')}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
