import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Photo meal logging.
 *
 * Two rules run through every function here:
 *
 *  1. The numbers are estimates from a vision model, never clinical values.
 *     `status` carries that: a row is 'pending' until a human at the clinic
 *     looks at it. Nothing may render a pending row as reviewed.
 *  2. The photos are health data. They live in a private bucket and are only
 *     ever read through a short-lived signed URL — never a public one, the way
 *     avatars and product images are.
 */

export type FoodLogStatus = 'pending' | 'analyzing' | 'failed' | 'confirmed' | 'corrected'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type FoodLog = {
  id: string
  photoPath: string
  loggedOn: string
  mealType: MealType
  detectedItems: string | null
  calories: number | null
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
  confidence: number | null
  status: FoodLogStatus
  reviewerNote: string | null
  reviewedAt: string | null
  createdAt: string
}

/** A reviewed row is one a person at the clinic has actually signed off. */
export function isReviewed(log: Pick<FoodLog, 'status'>): boolean {
  return log.status === 'confirmed' || log.status === 'corrected'
}

/** Rows that carry usable numbers. Failed and analyzing rows do not. */
export function hasNumbers(log: Pick<FoodLog, 'status' | 'calories'>): boolean {
  return log.calories !== null && log.status !== 'failed' && log.status !== 'analyzing'
}

function mapRow(r: Record<string, unknown>): FoodLog {
  return {
    id: r.id as string,
    photoPath: (r.photo_path as string) ?? '',
    loggedOn: (r.logged_on as string) ?? '',
    mealType: (r.meal_type as MealType) ?? 'snack',
    detectedItems: (r.detected_items as string) ?? null,
    calories: r.calories === null ? null : Number(r.calories),
    proteinG: r.protein_g === null ? null : Number(r.protein_g),
    carbsG: r.carbs_g === null ? null : Number(r.carbs_g),
    fatG: r.fat_g === null ? null : Number(r.fat_g),
    confidence: r.confidence === null ? null : Number(r.confidence),
    status: (r.status as FoodLogStatus) ?? 'pending',
    reviewerNote: (r.reviewer_note as string) ?? null,
    reviewedAt: (r.reviewed_at as string) ?? null,
    createdAt: (r.created_at as string) ?? '',
  }
}

/** Local calendar date — not UTC, so a late dinner counts as today. */
export function localDay(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export async function fetchFoodLogs(
  supabase: SupabaseClient,
  userId: string,
  day: string,
): Promise<FoodLog[]> {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('logged_on', day)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return (data as Record<string, unknown>[]).map(mapRow)
}

/**
 * Signed URL for a stored photo.
 *
 * Deliberately short-lived. These are pictures of a named client's meals; a
 * link that keeps working after the screen is closed is a link that can be
 * forwarded.
 */
export async function signedPhotoUrl(
  supabase: SupabaseClient,
  path: string,
  expiresInSeconds = 300,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('food-photos')
    .createSignedUrl(path, expiresInSeconds)
  if (error) return null
  return data?.signedUrl ?? null
}

/** Day totals. Only rows that actually carry numbers contribute. */
export function dayTotals(logs: FoodLog[]) {
  return logs.reduce(
    (acc, l) => {
      if (!hasNumbers(l)) return acc
      acc.calories += l.calories ?? 0
      acc.protein += l.proteinG ?? 0
      acc.carbs += l.carbsG ?? 0
      acc.fat += l.fatG ?? 0
      acc.counted += 1
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, counted: 0 },
  )
}
