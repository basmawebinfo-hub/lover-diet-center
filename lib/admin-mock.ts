// Mock data for the admin dashboard (frontend phase — replaced by Supabase later)

export const ADMIN_EMAIL = "lovers@loversdc.com"

export type AdminClient = {
  id: string
  nameEn: string
  nameAr: string
  email: string
  phone: string
  gender: "male" | "female"
  age: number
  startWeightKg: number
  currentWeightKg: number
  targetWeightKg: number
  goal: string
  plan: string
  status: "active" | "inactive" | "trial"
  joinedAt: string
  lastActive: string
}

export const adminClients: AdminClient[] = [
  { id: "c1", nameEn: "Sara Ahmed", nameAr: "سارة أحمد", email: "sara@example.com", phone: "+971 50 111 2233", gender: "female", age: 29, startWeightKg: 90, currentWeightKg: 84, targetWeightKg: 66, goal: "lose_weight", plan: "Premium 3-month", status: "active", joinedAt: "2026-03-12", lastActive: "2026-06-25" },
  { id: "c2", nameEn: "Mohammed Ali", nameAr: "محمد علي", email: "mohammed@example.com", phone: "+971 55 222 3344", gender: "male", age: 35, startWeightKg: 102, currentWeightKg: 95, targetWeightKg: 80, goal: "lose_weight", plan: "Standard monthly", status: "active", joinedAt: "2026-04-02", lastActive: "2026-06-24" },
  { id: "c3", nameEn: "Layla Hassan", nameAr: "ليلى حسن", email: "layla@example.com", phone: "+971 52 333 4455", gender: "female", age: 26, startWeightKg: 70, currentWeightKg: 64, targetWeightKg: 60, goal: "tone", plan: "Premium 3-month", status: "active", joinedAt: "2026-02-20", lastActive: "2026-06-26" },
  { id: "c4", nameEn: "Khaled Omar", nameAr: "خالد عمر", email: "khaled@example.com", phone: "+971 50 444 5566", gender: "male", age: 41, startWeightKg: 88, currentWeightKg: 88, targetWeightKg: 78, goal: "lose_weight", plan: "Trial", status: "trial", joinedAt: "2026-06-20", lastActive: "2026-06-22" },
  { id: "c5", nameEn: "Noura Saeed", nameAr: "نورة سعيد", email: "noura@example.com", phone: "+971 56 555 6677", gender: "female", age: 33, startWeightKg: 78, currentWeightKg: 72, targetWeightKg: 65, goal: "lose_weight", plan: "Standard monthly", status: "active", joinedAt: "2026-01-15", lastActive: "2026-06-23" },
  { id: "c6", nameEn: "Yousef Adel", nameAr: "يوسف عادل", email: "yousef@example.com", phone: "+971 54 666 7788", gender: "male", age: 28, startWeightKg: 75, currentWeightKg: 80, targetWeightKg: 85, goal: "gain_muscle", plan: "Premium 3-month", status: "active", joinedAt: "2026-05-01", lastActive: "2026-06-21" },
  { id: "c7", nameEn: "Hana Tarek", nameAr: "هنا طارق", email: "hana@example.com", phone: "+971 50 777 8899", gender: "female", age: 38, startWeightKg: 95, currentWeightKg: 91, targetWeightKg: 72, goal: "lose_weight", plan: "Standard monthly", status: "inactive", joinedAt: "2025-12-10", lastActive: "2026-05-30" },
  { id: "c8", nameEn: "Omar Fathy", nameAr: "عمر فتحي", email: "omar@example.com", phone: "+971 55 888 9900", gender: "male", age: 45, startWeightKg: 110, currentWeightKg: 99, targetWeightKg: 85, goal: "lose_weight", plan: "Premium 6-month", status: "active", joinedAt: "2026-02-28", lastActive: "2026-06-26" },
]

export type AdminOrder = {
  id: string
  client: string
  date: string
  items: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
}

export const adminOrders: AdminOrder[] = [
  { id: "o1042", client: "Sara Ahmed", date: "2026-06-25", items: 3, total: 405, status: "processing" },
  { id: "o1041", client: "Mohammed Ali", date: "2026-06-24", items: 1, total: 220, status: "delivered" },
  { id: "o1040", client: "Layla Hassan", date: "2026-06-24", items: 2, total: 100, status: "shipped" },
  { id: "o1039", client: "Noura Saeed", date: "2026-06-23", items: 4, total: 168, status: "delivered" },
  { id: "o1038", client: "Omar Fathy", date: "2026-06-22", items: 2, total: 340, status: "pending" },
  { id: "o1037", client: "Yousef Adel", date: "2026-06-21", items: 1, total: 55, status: "cancelled" },
  { id: "o1036", client: "Hana Tarek", date: "2026-06-20", items: 3, total: 290, status: "delivered" },
]

export type AdminSession = {
  id: string
  client: string
  type: string
  typeAr: string
  doctor: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
}

export const adminSessions: AdminSession[] = [
  { id: "s1", client: "Sara Ahmed", type: "Nutrition Consultation", typeAr: "استشارة تغذية", doctor: "Dr. Wael Mostafa", date: "2026-06-27", time: "10:00", status: "scheduled" },
  { id: "s2", client: "Khaled Omar", type: "Body Sculpting", typeAr: "نحت الجسم", doctor: "Dr. Wael Mostafa", date: "2026-06-27", time: "12:30", status: "scheduled" },
  { id: "s3", client: "Layla Hassan", type: "Follow-up", typeAr: "متابعة", doctor: "Dr. Wael Mostafa", date: "2026-06-28", time: "11:00", status: "scheduled" },
  { id: "s4", client: "Mohammed Ali", type: "Nutrition Consultation", typeAr: "استشارة تغذية", doctor: "Dr. Wael Mostafa", date: "2026-06-25", time: "09:30", status: "completed" },
  { id: "s5", client: "Noura Saeed", type: "Follow-up", typeAr: "متابعة", doctor: "Dr. Wael Mostafa", date: "2026-06-24", time: "14:00", status: "completed" },
]

// Monthly revenue (last 8 months) for charts
export const adminRevenue = [
  { month: "Nov", value: 18500 },
  { month: "Dec", value: 21200 },
  { month: "Jan", value: 24800 },
  { month: "Feb", value: 23100 },
  { month: "Mar", value: 28600 },
  { month: "Apr", value: 31200 },
  { month: "May", value: 34800 },
  { month: "Jun", value: 38900 },
]
