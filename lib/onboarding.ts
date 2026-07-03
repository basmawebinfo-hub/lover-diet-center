// Single source of truth for whether a user's profile is "complete enough"
// to enter the dashboard. Called from server (middleware) and client (dashboard).
//
// We treat onboarding as complete when ALL of these are present:
//   - name_en (real name, at least 2 chars — not just the email prefix)
//   - phone   (any digits)
//   - age     > 0
//   - gender  set
//   - height_cm >= 100
//   - current_weight >= 30 (kg)
//   - goal    set
//   - activity_level set
//
// If any of these are missing, the user must go through /onboarding first.

export type OnboardingProfile = {
  name_en?: string | null
  phone?: string | null
  age?: number | null
  gender?: string | null
  height_cm?: number | null
  current_weight?: number | null
  goal?: string | null
  activity_level?: string | null
} | null | undefined

// Set of profile fields required to enter the dashboard.
// Kept as an array so future additions are trivial.
export const REQUIRED_ONBOARDING_FIELDS = [
  'name_en',
  'phone',
  'age',
  'gender',
  'height_cm',
  'current_weight',
  'goal',
  'activity_level',
] as const

export function isOnboardingComplete(profile: OnboardingProfile): boolean {
  if (!profile) return false
  if (!profile.name_en || String(profile.name_en).trim().length < 2) return false
  if (!profile.phone || String(profile.phone).replace(/[^0-9]/g, '').length < 6) return false
  if (!profile.age || Number(profile.age) < 12) return false
  if (!profile.gender) return false
  if (!profile.height_cm || Number(profile.height_cm) < 100) return false
  if (!profile.current_weight || Number(profile.current_weight) < 30) return false
  if (!profile.goal) return false
  if (!profile.activity_level) return false
  return true
}

// List of columns to SELECT from profiles when we only need to check completeness.
// Matches the shape used by isOnboardingComplete().
export const ONBOARDING_SELECT =
  'name_en, phone, age, gender, height_cm, current_weight, goal, activity_level, role, blocked'
