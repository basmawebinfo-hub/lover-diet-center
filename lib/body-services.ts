export type ServiceCategory = {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  sortOrder: number
  isActive: boolean
}

export type BodyService = {
  id: string
  categoryId: string
  slug: string
  nameEn: string
  nameAr: string
  shortDescriptionEn: string
  shortDescriptionAr: string
  descriptionEn: string
  descriptionAr: string
  benefitsEn: string[]
  benefitsAr: string[]
  durationMinutes: number
  price: number
  compareAtPrice: number | null
  badgeEn: string | null
  badgeAr: string | null
  imageUrl: string
  gallery: string[]
  isFeatured: boolean
  isActive: boolean
  sortOrder: number
}

export type ServiceReview = {
  id: string
  serviceId: string | null
  customerName: string
  rating: number
  commentEn: string
  commentAr: string
  isApproved: boolean
  createdAt: string
}

export type ServiceGalleryItem = {
  id: string
  serviceId: string | null
  imageUrl: string
  titleEn: string
  titleAr: string
  kind: "service" | "result" | "facility"
  isActive: boolean
  sortOrder: number
}

export type ServiceBookingInput = {
  serviceId: string
  customerName: string
  phone: string
  email?: string
  bookingDate: string
  bookingTime: string
  notes?: string
  locale: "ar" | "en"
}

export const serviceCategories: ServiceCategory[] = [
  { id: "cat-body", slug: "body-shaping", nameEn: "Body Shaping", nameAr: "نحت وتشكيل الجسم", descriptionEn: "Advanced treatments for contouring and recovery.", descriptionAr: "جلسات متطورة لنحت القوام والتعافي.", sortOrder: 1, isActive: true },
  { id: "cat-beauty", slug: "beauty-care", nameEn: "Beauty Care", nameAr: "العناية والجمال", descriptionEn: "Skin and beauty treatments with visible results.", descriptionAr: "عناية بالبشرة والجمال بنتائج ملحوظة.", sortOrder: 2, isActive: true },
  { id: "cat-wellness", slug: "wellness", nameEn: "Wellness", nameAr: "الصحة والاسترخاء", descriptionEn: "Restorative wellness and relaxation sessions.", descriptionAr: "جلسات للصحة والاسترخاء واستعادة النشاط.", sortOrder: 3, isActive: true },
]

const services: BodyService[] = [
  { id: "svc-cupping", categoryId: "cat-wellness", slug: "advanced-cupping", nameEn: "Advanced Medical Cupping", nameAr: "الحجامة الطبية المتقدمة", shortDescriptionEn: "A premium cupping experience for circulation, recovery and relaxation.", shortDescriptionAr: "تجربة حجامة متقدمة لتحسين الدورة الدموية والاستشفاء والاسترخاء.", descriptionEn: "A carefully delivered 60-minute cupping session designed to support circulation, ease muscular tension and encourage deep relaxation. The specialist evaluates your needs before treatment.", descriptionAr: "جلسة حجامة مدتها 60 دقيقة تُقدّم بعناية لدعم الدورة الدموية، وتخفيف شد العضلات، وتعزيز الاسترخاء العميق بعد تقييم احتياجاتك من المختص.", benefitsEn: ["Supports blood circulation", "Eases muscle and joint tension", "Encourages relaxation", "Supports weight-management goals"], benefitsAr: ["تحسين الدورة الدموية", "تخفيف آلام العضلات والمفاصل", "تعزيز الاسترخاء", "دعم أهداف إدارة الوزن"], durationMinutes: 60, price: 250, compareAtPrice: 350, badgeEn: "VIP offer", badgeAr: "عرض VIP", imageUrl: "/images/body-sculpting/cupping-vip.jpeg", gallery: [], isFeatured: true, isActive: true, sortOrder: 1 },
  { id: "svc-hydra", categoryId: "cat-beauty", slug: "hydra-facial", nameEn: "Hydra Facial", nameAr: "هيدرا فيشل", shortDescriptionEn: "Deep cleansing, hydration and glow in one complete facial.", shortDescriptionAr: "تنظيف عميق وترطيب ونضارة في جلسة متكاملة.", descriptionEn: "A multi-step facial that cleanses, hydrates and refreshes the skin using advanced tips selected for your skin needs.", descriptionAr: "جلسة متعددة الخطوات تنظف البشرة بعمق وترطبها وتعيد إليها النضارة باستخدام رؤوس متطورة تناسب احتياجات بشرتك.", benefitsEn: ["Deep cleansing", "Intensive hydration", "Improves texture and tone", "Gentle for all skin types"], benefitsAr: ["تنظيف البشرة بعمق", "ترطيب مكثف", "تحسين ملمس ولون البشرة", "لطيف ومناسب لكل أنواع البشرة"], durationMinutes: 60, price: 225, compareAtPrice: 325, badgeEn: "VIP offer", badgeAr: "عرض VIP", imageUrl: "/images/body-sculpting/hydra-facial-vip.jpeg", gallery: [], isFeatured: true, isActive: true, sortOrder: 2 },
  { id: "svc-wood", categoryId: "cat-body", slug: "maderotherapy", nameEn: "Maderotherapy Wood Therapy", nameAr: "ماديروثيرابي - وود ثيرابي", shortDescriptionEn: "Natural wood therapy for contouring, lymphatic flow and relaxation.", shortDescriptionAr: "تقنية طبيعية لنحت القوام وتحسين التدفق اللمفاوي والاسترخاء.", descriptionEn: "A complete wood-therapy session using specialist tools to target selected areas and support a smoother, firmer appearance.", descriptionAr: "جلسة وود ثيرابي متكاملة بأدوات متخصصة لاستهداف المناطق المطلوبة ودعم مظهر أكثر نعومة وتناسقًا.", benefitsEn: ["Targets cellulite appearance", "Supports lymphatic flow", "Promotes natural skin firmness", "Releases muscular tension"], benefitsAr: ["تقليل مظهر السيلوليت", "تحسين التدفق اللمفاوي", "دعم شد الجلد طبيعيًا", "تخفيف توتر العضلات"], durationMinutes: 60, price: 250, compareAtPrice: 300, badgeEn: "Most popular", badgeAr: "الأكثر طلبًا", imageUrl: "/images/body-sculpting/maderotherapy-vip.jpeg", gallery: ["/images/body-sculpting/wood-therapy-tools.jpeg"], isFeatured: true, isActive: true, sortOrder: 3 },
  { id: "svc-slimming", categoryId: "cat-body", slug: "integrated-slimming", nameEn: "Integrated Slimming System", nameAr: "جهاز التخسيس المتكامل", shortDescriptionEn: "A targeted body treatment supporting circulation and contouring.", shortDescriptionAr: "جلسة موجهة لدعم الدورة الدموية ونحت مناطق الجسم.", descriptionEn: "An integrated device-based session for targeted contouring and a lighter, more relaxed feeling.", descriptionAr: "جلسة متكاملة بالأجهزة لنحت المناطق المستهدفة وتعزيز الإحساس بالخفة والاسترخاء.", benefitsEn: ["Supports fat-burning goals", "Stimulates circulation", "Reduces fluid retention", "Promotes relaxation"], benefitsAr: ["دعم أهداف حرق الدهون", "تنشيط الدورة الدموية", "تقليل احتباس السوائل", "تعزيز الاسترخاء"], durationMinutes: 45, price: 200, compareAtPrice: 300, badgeEn: "Ladies only", badgeAr: "للسيدات فقط", imageUrl: "/images/body-sculpting/slimming-system-vip.jpeg", gallery: [], isFeatured: true, isActive: true, sortOrder: 4 },
  { id: "svc-stone", categoryId: "cat-wellness", slug: "volcanic-hot-stone", nameEn: "Volcanic Hot Stone Therapy", nameAr: "مساج الأحجار البركانية", shortDescriptionEn: "Deep warmth and relaxation with professionally heated volcanic stones.", shortDescriptionAr: "دفء واسترخاء عميق بأحجار بركانية مسخنة باحتراف.", descriptionEn: "A deeply calming hot-stone experience using evenly heated natural volcanic stones to relax tense muscles.", descriptionAr: "تجربة أحجار ساخنة عميقة وهادئة باستخدام أحجار بركانية طبيعية موزعة الحرارة لإرخاء العضلات المشدودة.", benefitsEn: ["Deep muscular relaxation", "Supports circulation", "Reduces stress", "May ease fatigue"], benefitsAr: ["استرخاء عميق للعضلات", "تحسين الدورة الدموية", "تقليل التوتر", "المساعدة في تخفيف الإرهاق"], durationMinutes: 60, price: 250, compareAtPrice: 300, badgeEn: "VIP experience", badgeAr: "تجربة VIP", imageUrl: "/images/body-sculpting/hot-stone-vip.jpeg", gallery: [], isFeatured: false, isActive: true, sortOrder: 5 },
  { id: "svc-ems", categoryId: "cat-body", slug: "ems-body-toning", nameEn: "EMS Body Toning", nameAr: "نحت الجسم بتقنية EMS", shortDescriptionEn: "Electrical muscle stimulation supporting toning and contouring.", shortDescriptionAr: "تحفيز كهربائي للعضلات لدعم الشد ونحت القوام.", descriptionEn: "A focused EMS session that stimulates selected muscle groups and complements an active, healthy lifestyle.", descriptionAr: "جلسة EMS موجهة لتحفيز مجموعات عضلية محددة وتكمل نمط الحياة الصحي والنشط.", benefitsEn: ["Supports body contouring", "Stimulates muscle groups", "Targets cellulite appearance", "Supports circulation"], benefitsAr: ["دعم نحت مناطق الجسم", "تحفيز وتقوية العضلات", "تقليل مظهر السيلوليت", "تحسين الدورة الدموية"], durationMinutes: 45, price: 200, compareAtPrice: 300, badgeEn: "VIP offer", badgeAr: "عرض VIP", imageUrl: "/images/body-sculpting/ems-vip.jpeg", gallery: [], isFeatured: false, isActive: true, sortOrder: 6 },
]

export const fallbackBodyServices = services
export const fallbackReviews: ServiceReview[] = [
  { id: "rev-1", serviceId: "svc-wood", customerName: "Mariam A.", rating: 5, commentEn: "The team explained every step and the session was very comfortable.", commentAr: "الفريق شرح كل خطوة والجلسة كانت مريحة جدًا.", isApproved: true, createdAt: "2026-06-20" },
  { id: "rev-2", serviceId: "svc-hydra", customerName: "Sara M.", rating: 5, commentEn: "My skin felt fresh and hydrated from the first session.", commentAr: "بشرتي بقت أنضر ومرطبة من أول جلسة.", isApproved: true, createdAt: "2026-06-28" },
  { id: "rev-3", serviceId: null, customerName: "Noor H.", rating: 5, commentEn: "Clean center, professional specialists and easy booking.", commentAr: "المركز نظيف والمختصات محترفات والحجز سهل.", isApproved: true, createdAt: "2026-07-02" },
]
export const fallbackGallery: ServiceGalleryItem[] = services.map((service, index) => ({ id: `gallery-${index + 1}`, serviceId: service.id, imageUrl: service.imageUrl, titleEn: service.nameEn, titleAr: service.nameAr, kind: "service", isActive: true, sortOrder: index + 1 }))
fallbackGallery.push({ id: "gallery-tools", serviceId: "svc-wood", imageUrl: "/images/body-sculpting/wood-therapy-tools.jpeg", titleEn: "Professional wood therapy tools", titleAr: "أدوات الوود ثيرابي الاحترافية", kind: "facility", isActive: true, sortOrder: 7 })

export function getFallbackService(slug: string) {
  return fallbackBodyServices.find((service) => service.slug === slug && service.isActive) ?? null
}

export function validateBooking(input: Partial<ServiceBookingInput>) {
  const errors: string[] = []
  if (!input.serviceId || !fallbackBodyServices.some((service) => service.id === input.serviceId)) errors.push("Invalid service")
  if (!input.customerName || input.customerName.trim().length < 2 || input.customerName.length > 80) errors.push("Invalid name")
  if (!input.phone || !/^\+?[0-9\s-]{7,20}$/.test(input.phone)) errors.push("Invalid phone")
  if (!input.bookingDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.bookingDate)) errors.push("Invalid date")
  if (!input.bookingTime || !/^\d{2}:\d{2}$/.test(input.bookingTime)) errors.push("Invalid time")
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.push("Invalid email")
  if (input.notes && input.notes.length > 500) errors.push("Notes too long")
  return errors
}
