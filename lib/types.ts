// Type definitions for the Lover Diet Center app
// These are the data shapes used across the dashboard, onboarding, and AI analysis modules.

export type Locale = "en" | "ar"

export type GoalType = "lose_weight" | "gain_muscle" | "maintain" | "tone"

export type Gender = "male" | "female"

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"

export type WeightLog = {
  id: string
  date: string // ISO date string YYYY-MM-DD
  weightKg: number
  bodyFatPct?: number
  note?: string
}

export type Meal = {
  id: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  imageUrl: string
  calories: number
  protein: number
  carbs: number
  fat: number
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  tags: string[]
}

export type Product = {
  id: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  imageUrl: string
  price: number // stored in the canonical currency configured in lib/currency.tsx (USD base)
  category: "snack" | "supplement" | "meal" | "drink"
  inStock: boolean
}

export type Session = {
  id: string
  type: "consultation" | "body_sculpting" | "follow_up" | "training"
  typeEn: string
  typeAr: string
  doctorName: string
  date: string // ISO
  time: string // HH:MM
  durationMinutes: number
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  notes?: string
  location: "clinic" | "online"
}

export type CartItem = {
  productId: string
  quantity: number
}

export type PlanItem = {
  id: string
  dayOfWeek: number // 0..6, 0 = Sunday
  meal: Meal
}

export type DoctorPlan = {
  id: string
  doctorName: string
  startDate: string // ISO
  endDate: string // ISO
  goal: GoalType
  notesEn: string
  notesAr: string
  planItems: PlanItem[]
  dailyCalories: number
  waterLiters: number
}

export type OrderItem = {
  productId: string
  nameEn: string
  nameAr: string
  quantity: number
  price: number // USD — snapshot of the product price at time of purchase (see lib/currency.tsx)
  imageUrl?: string // Snapshot of the product image URL at fetch time (added PR #20 for Orders History).
  inStock?: boolean // Whether the product is currently buyable (added PR #20 for Reorder).
}

export type Order = {
  id: string
  date: string // ISO
  items: OrderItem[]
  subtotal: number // USD — sum of item.price * quantity
  shipping: number // USD — see SHIPPING_USD in app/dashboard/cart/page.tsx
  total: number // USD — subtotal + shipping
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
}

export type WaterLog = {
  date: string // YYYY-MM-DD
  liters: number
}

export type AnalysisResult = {
  bmi: number
  bmiCategory: "underweight" | "normal" | "overweight" | "obese"
  bmiCategoryEn: string
  bmiCategoryAr: string
  idealWeightKg: number
  weightToLose: number
  weightToGain: number
  recommendedDailyCalories: number
  recommendedProteinG: number
  recommendedCarbsG: number
  recommendedFatG: number
  estimatedWeeks: number
  summaryEn: string
  summaryAr: string
  motivationEn: string
  motivationAr: string
}

export type User = {
  id: string
  nameEn: string
  nameAr?: string
  email: string
  phone?: string
  age: number
  gender: Gender
  heightCm: number
  startWeightKg: number
  currentWeightKg: number
  goal: GoalType
  targetWeightKg: number
  activityLevel: ActivityLevel
  avatarConfig: AvatarConfig
  avatarUrl?: string
  createdAt: string
  role?: "user" | "admin"
}

export type AvatarConfig = {
  // Visual state of the avatar — recalculated whenever weight changes
  bodyMass: number // 0..1 — relative to "normal" reference
  posture: "slouch" | "neutral" | "confident"
  tone: "soft" | "fit" | "lean"
  face: "round" | "oval" | "angular"
  skinTone: string
  hairStyle: "short" | "medium" | "long" | "bald"
  clothing: "casual" | "sport" | "formal"
}

// ============================================================================
// Admin panel types
// ----------------------------------------------------------------------------
// These describe the shapes returned by the admin-facing DB helpers in
// lib/supabase/db.ts. They used to live in lib/admin-mock.ts alongside seed
// data; the seed data has been removed, and the types are canonical here so
// admin pages don't import "mock" modules in production.
// ============================================================================

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

export type AdminOrder = {
  id: string
  client: string
  date: string
  items: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
}

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
