// Single source of truth for whether a user's profile is "complete enough"
// to enter the dashboard. Called from server (middleware) and client (dashboard).
//
// After the DB Hardening Round 2 migration, profiles carry a canonical
// `onboarding_completed BOOLEAN` column. Application code should PREFER that
// column. This helper still exposes the legacy field-presence check as a
// fallback for profiles created before the column existed (or profiles the
// app has partially written since).
//
// Completeness definition (used both server-side and by upsertProfile to
// decide whether to flip onboarding_completed to true):
//   - name_en          (>= 2 chars, not empty)
//   - phone            (>= 6 digits after stripping non-digits)
//   - age              (>= 12)
//   - gender           set
//   - height_cm        >= 100
//   - current_weight   >= 30
//   - goal             set
//   - activity_level   set

export type OnboardingProfile = {
  name_en?: string | null
  phone?: string | null
  age?: number | null
  gender?: string | null
  height_cm?: number | null
  current_weight?: number | null
  goal?: string | null
  activity_level?: string | null
  onboarding_completed?: boolean | null
} | null | undefined

// Fields required to consider onboarding complete via the legacy check.
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

// Slim SELECT for the middleware — cheap projection when we only need to know
// the gate state.
export const ONBOARDING_SELECT_MIN = 'role, blocked, onboarding_completed' as const

// Full SELECT for the fallback path (legacy profiles where the column is false
// but the fields are populated).
export const ONBOARDING_SELECT_FULL =
  'name_en, phone, age, gender, height_cm, current_weight, goal, activity_level, role, blocked, onboarding_completed' as const

// Legacy check: does the row LOOK complete based on field presence?
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

// Canonical check: trust the DB column when it's true. Callers that only
// have the slim projection can call this directly.
export function isOnboardedByColumn(
  profile: { onboarding_completed?: boolean | null } | null | undefined,
): boolean {
  return profile?.onboarding_completed === true
}

// Best-effort check that works whether the slim OR the full projection was
// fetched. Prefers the column when true; falls back to field presence when
// available.
export function isOnboardedOrLegacyComplete(profile: OnboardingProfile): boolean {
  if (!profile) return false
  if (profile.onboarding_completed === true) return true
  return isOnboardingComplete(profile)
}
