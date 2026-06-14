// Official WhatsApp link (direct from loversdc.com)
export const WHATSAPP_DIRECT =
  'https://api.whatsapp.com/send/?phone=971529033110&text=Hello%2C+I%27d+like+to+book+a+consultation+at+Lover+Diet+Center&type=phone_number&app_absent=0'

export const WHATSAPP_NUMBER = '971529033110'

export function waLink(message: string) {
  return `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`
}

export const socialLinks = {
  facebook: 'https://www.facebook.com/wael.mousa.167/',
  tiktok: 'https://www.tiktok.com/@loversdiet',
  youtube: 'https://www.youtube.com/channel/UCb0n5fTajQsT8oUC3_2sG6Q',
  pinterest:
    'https://www.pinterest.com/loversdietcenter/?invite_code=fb77030b919d4558a6869735250daa6e&sender=909445855910890298',
  whatsapp: WHATSAPP_DIRECT,
}

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Diet Plans', href: '/nutrition-consultations' },
  { label: 'Meals', href: '/healthy-meals' },
  { label: 'Supplements', href: '/healthy-snacks' },
  { label: 'Services', href: '/body-sculpting' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export const services = [
  {
    slug: 'nutrition-consultations',
    title: 'Nutrition Consultations',
    titleAr: 'الاستشارات الغذائية',
    desc: 'One-on-one guidance from certified nutritionists tailored to your goals.',
    icon: 'Stethoscope',
  },
  {
    slug: 'healthy-meals',
    title: 'Healthy Meals',
    titleAr: 'الوجبات الصحية',
    desc: 'Chef-prepared, macro-balanced meals delivered fresh to your door.',
    icon: 'UtensilsCrossed',
  },
  {
    slug: 'healthy-snacks',
    title: 'Healthy Snacks',
    titleAr: 'منتجات الاسناك الصحية',
    desc: 'Guilt-free protein bars, dried fruits, nuts and organic treats.',
    icon: 'Cookie',
  },
  {
    slug: 'body-sculpting',
    title: 'Body Sculpting Sessions',
    titleAr: 'جلسات تكسير الدهون وتغيير قياسات الجسم',
    desc: 'Advanced fat-breaking sessions that reshape your body measurements.',
    icon: 'Activity',
  },
  {
    slug: 'training-courses',
    title: 'Training Courses',
    titleAr: 'دورات تدريبية',
    desc: 'Specialized courses to master nutrition, fitness and a healthy lifestyle.',
    icon: 'GraduationCap',
  },
]
