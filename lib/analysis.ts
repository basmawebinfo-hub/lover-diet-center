// AI analysis module — analyzes the user's measurements and goal
// This is intentionally deterministic (rule-based) so the frontend works
// without a backend. When the backend is added, the same API contract
// can be replaced with a real LLM call.

import type {
  AnalysisResult,
  AvatarConfig,
  Gender,
  GoalType,
  User,
  WeightLog,
} from "./types"

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  if (heightM <= 0) return 0
  return weightKg / (heightM * heightM)
}

export function bmiCategory(bmi: number): AnalysisResult["bmiCategory"] {
  if (bmi < 18.5) return "underweight"
  if (bmi < 25) return "normal"
  if (bmi < 30) return "overweight"
  return "obese"
}

const ACTIVITY_FACTOR: Record<User["activityLevel"], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function bmrMifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === "male" ? base + 5 : base - 161
}

export function tdee(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activity: User["activityLevel"]
): number {
  return bmrMifflinStJeor(weightKg, heightCm, age, gender) * ACTIVITY_FACTOR[activity]
}

// Devine formula for ideal body weight reference
export function idealWeightKg(heightCm: number, gender: Gender): number {
  const inches = heightCm / 2.54
  const over5ft = Math.max(0, inches - 60)
  if (gender === "male") return 50 + 2.3 * over5ft
  return 45.5 + 2.3 * over5ft
}

const GOAL_DELTA: Record<GoalType, number> = {
  lose_weight: -500,
  gain_muscle: 350,
  maintain: 0,
  tone: -250,
}

export function analyzeUser(
  user: Pick<
    User,
    "age" | "gender" | "heightCm" | "startWeightKg" | "currentWeightKg" | "goal" | "activityLevel"
  > & {
    targetWeightKg?: number
  },
  locale: "en" | "ar" = "en"
): AnalysisResult {
  const bmi = calculateBMI(user.currentWeightKg, user.heightCm)
  const cat = bmiCategory(bmi)
  const ideal = idealWeightKg(user.heightCm, user.gender)
  const baseTdee = tdee(
    user.currentWeightKg,
    user.heightCm,
    user.age,
    user.gender,
    user.activityLevel
  )
  // Never recommend an unsafe / negative calorie target (e.g. new user with weight 0).
  const calorieFloor = user.gender === "male" ? 1500 : 1200
  const rawCalories = baseTdee + GOAL_DELTA[user.goal]
  const targetCalories = user.currentWeightKg < 30 ? 0 : Math.max(calorieFloor, rawCalories)

  const target = user.targetWeightKg ?? ideal
  const weightDiff = user.currentWeightKg - target
  const weightToLose = user.goal === "lose_weight" || user.goal === "tone" ? Math.max(0, weightDiff) : 0
  const weightToGain = user.goal === "gain_muscle" ? Math.max(0, -weightDiff) : 0

  // Realistic pace: 0.5kg/week for loss, 0.25kg/week for gain
  const weeklyRate = user.goal === "gain_muscle" ? 0.25 : 0.5
  const totalDelta = weightToLose + weightToGain
  const estimatedWeeks = totalDelta > 0 ? Math.ceil(totalDelta / weeklyRate) : 0

  const proteinG = Math.round(user.currentWeightKg * (user.goal === "gain_muscle" ? 2.0 : 1.6))
  const fatG = Math.round((targetCalories * 0.27) / 9)
  const carbsG = Math.round((targetCalories - proteinG * 4 - fatG * 9) / 4)

  const labels = {
    underweight: { en: "Underweight", ar: "نحيف" },
    normal: { en: "Healthy", ar: "مثالي" },
    overweight: { en: "Overweight", ar: "زيادة وزن" },
    obese: { en: "Obese", ar: "سمنة" },
  } as const

  const catLabel = labels[cat]
  const idealDiff = user.currentWeightKg - ideal

  const summaryEn = buildSummaryEn({
    bmi,
    cat: catLabel.en,
    weightDiffKg: idealDiff,
    goal: user.goal,
    estimatedWeeks,
  })
  const summaryAr = buildSummaryAr({
    bmi,
    cat: catLabel.ar,
    weightDiffKg: idealDiff,
    goal: user.goal,
    estimatedWeeks,
  })

  const motivationEn = pickMotivationEn(user.goal, cat)
  const motivationAr = pickMotivationAr(user.goal, cat)

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory: cat,
    bmiCategoryEn: catLabel.en,
    bmiCategoryAr: catLabel.ar,
    idealWeightKg: Math.round(ideal * 10) / 10,
    weightToLose: Math.round(weightToLose * 10) / 10,
    weightToGain: Math.round(weightToGain * 10) / 10,
    recommendedDailyCalories: Math.round(targetCalories),
    recommendedProteinG: proteinG,
    recommendedCarbsG: Math.max(0, carbsG),
    recommendedFatG: fatG,
    estimatedWeeks,
    summaryEn,
    summaryAr,
    motivationEn,
    motivationAr,
  }
}

function buildSummaryEn(p: {
  bmi: number
  cat: string
  weightDiffKg: number
  goal: User["goal"]
  estimatedWeeks: number
}): string {
  const direction = p.weightDiffKg > 0 ? "lose" : "gain"
  const absDiff = Math.abs(p.weightDiffKg).toFixed(1)
  if (p.goal === "maintain") {
    return `Your BMI is ${p.bmi.toFixed(1)} — that's ${p.cat}. With a balanced plan we can keep you in this range while you build strength and energy.`
  }
  if (p.estimatedWeeks === 0) {
    return `You're already at a great spot. We'll keep you lean and strong.`
  }
  return `Your BMI is ${p.bmi.toFixed(1)} (${p.cat}). To reach your ideal weight you need to ${direction} about ${absDiff}kg. Realistic timeline: ~${p.estimatedWeeks} weeks.`
}

function buildSummaryAr(p: {
  bmi: number
  cat: string
  weightDiffKg: number
  goal: User["goal"]
  estimatedWeeks: number
}): string {
  const direction = p.weightDiffKg > 0 ? "تخسر" : "تزيد"
  const absDiff = Math.abs(p.weightDiffKg).toFixed(1)
  if (p.goal === "maintain") {
    return `مؤشر كتلة الجسم ${p.bmi.toFixed(1)} — ${p.cat}. مع خطة متوازنة هنحافظ على وزنك ونبني قوة وطاقة.`
  }
  if (p.estimatedWeeks === 0) {
    return `أنت في مكان ممتاز. هنحافظ على لياقتك وقوتك.`
  }
  return `مؤشر كتلة الجسم ${p.bmi.toFixed(1)} (${p.cat}). عشان توصل للوزن المثالي محتاج ${direction} حوالي ${absDiff} كيلو. وقت واقعي: ${p.estimatedWeeks} أسبوع تقريباً.`
}

function pickMotivationEn(goal: GoalType, cat: AnalysisResult["bmiCategory"]): string {
  if (goal === "lose_weight") {
    return "Every kilo you lose is a kilo you don't carry. Let's make it visible."
  }
  if (goal === "gain_muscle") {
    return "Strength is built one meal at a time. You're on the right path."
  }
  if (goal === "tone") {
    return "Tone is a mindset, not a number. Consistency wins."
  }
  if (cat === "obese" || cat === "overweight") {
    return "Small steps every day beat giant leaps once a week."
  }
  return "Stay consistent. The body follows the routine."
}

function pickMotivationAr(goal: GoalType, cat: AnalysisResult["bmiCategory"]): string {
  if (goal === "lose_weight") {
    return "كل كيلو بتخسره هو كيلو مش شايله. هنخلي التقدم يبان."
  }
  if (goal === "gain_muscle") {
    return "القوة بتتني وجبة ورا وجبة. أنت في الطريق الصح."
  }
  if (goal === "tone") {
    return "التنسيق عقلي مش رقم. الاستمرارية هي اللي بتفرق."
  }
  if (cat === "obese" || cat === "overweight") {
    return "خطوة صغيرة كل يوم أحسن من قفزة كبيرة مرة في الأسبوع."
  }
  return "استمر. الجسم بياكل الروتين."
}

// Convert weight logs + user into a visual avatar state
export function buildAvatarConfig(
  user: Pick<User, "gender" | "heightCm" | "currentWeightKg" | "startWeightKg" | "goal">,
  logs: WeightLog[]
): AvatarConfig {
  const bmi = calculateBMI(user.currentWeightKg, user.heightCm)
  const startBmi = calculateBMI(user.startWeightKg, user.heightCm)
  // bodyMass is a normalized value where 1.0 = BMI 25 (upper normal), 0 = BMI 18.5 (lower normal)
  const bodyMass = Math.max(0, Math.min(1, (bmi - 16) / 18))

  // Tone: based on starting vs current + goal
  let tone: AvatarConfig["tone"] = "soft"
  if (user.goal === "gain_muscle") tone = "fit"
  else if (user.goal === "tone") tone = "fit"
  else if (user.goal === "maintain") tone = bmi < 25 ? "fit" : "soft"
  else if (bmi < startBmi) tone = "lean"

  // Posture: gets more confident as weight moves toward goal
  const progressed = Math.abs(startBmi - bmi) > 0.5
  const posture: AvatarConfig["posture"] = progressed ? "confident" : "neutral"

  const face: AvatarConfig["face"] = bmi > 30 ? "round" : bmi > 25 ? "oval" : "angular"

  return {
    bodyMass,
    posture,
    tone,
    face,
    skinTone: user.gender === "male" ? "#E0B894" : "#F4D5BD",
    hairStyle: user.gender === "male" ? "short" : "medium",
    clothing: "sport",
  }
}

export function progressPercent(user: User): number {
  if (user.goal === "gain_muscle") {
    const total = user.targetWeightKg - user.startWeightKg
    if (total <= 0) return 100
    const gained = user.currentWeightKg - user.startWeightKg
    return Math.max(0, Math.min(100, (gained / total) * 100))
  }
  const total = user.startWeightKg - user.targetWeightKg
  if (total <= 0) return 100
  const lost = user.startWeightKg - user.currentWeightKg
  return Math.max(0, Math.min(100, (lost / total) * 100))
}
