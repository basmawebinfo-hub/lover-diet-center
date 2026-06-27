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
  price: number // AED
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
  price: number
}

export type Order = {
  id: string
  date: string // ISO
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
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
