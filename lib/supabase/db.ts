import { createClient } from '@/lib/supabase/client'
import type { Session, User, WeightLog } from '@/lib/types'

// ---- Sessions ----
export async function insertSession(userId: string, s: Session): Promise<void> {
  const supabase = createClient()
  await supabase.from('sessions').insert({
    user_id: userId,
    type: s.type,
    doctor_name: s.doctorName,
    date: s.date,
    time: s.time,
    duration_minutes: s.durationMinutes,
    status: s.status,
    location: s.location,
    notes: s.notes ?? null,
  })
}

export async function fetchSessions(userId: string): Promise<Session[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions').select('*').eq('user_id', userId).order('date', { ascending: false })
  if (error || !data) return []
  const typeMap: Record<string, { en: string; ar: string }> = {
    consultation: { en: 'Nutrition Consultation', ar: 'استشارة تغذية' },
    body_sculpting: { en: 'Body Sculpting Session', ar: 'جلسة نحت الجسم' },
    follow_up: { en: 'Follow-up Check', ar: 'متابعة' },
    training: { en: 'Training Course', ar: 'دورة تدريبية' },
  }
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    type: r.type as Session['type'],
    typeEn: typeMap[r.type as string]?.en ?? (r.type as string),
    typeAr: typeMap[r.type as string]?.ar ?? '',
    doctorName: (r.doctor_name as string) ?? 'Dr. Wael Mostafa',
    date: r.date as string,
    time: (r.time as string) ?? '',
    durationMinutes: (r.duration_minutes as number) ?? 45,
    status: r.status as Session['status'],
    location: r.location as Session['location'],
    notes: (r.notes as string) ?? undefined,
  }))
}

// ---- Weight logs ----
export async function insertWeightLog(userId: string, log: WeightLog): Promise<void> {
  const supabase = createClient()
  // one entry per day: delete same-day then insert
  await supabase.from('weight_logs').delete().eq('user_id', userId).eq('date', log.date)
  await supabase.from('weight_logs').insert({
    user_id: userId,
    date: log.date,
    weight_kg: log.weightKg,
    body_fat_pct: log.bodyFatPct ?? null,
    note: log.note ?? null,
  })
}

export async function fetchWeightLogs(userId: string): Promise<WeightLog[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('weight_logs').select('*').eq('user_id', userId).order('date', { ascending: false })
  if (error || !data) return []
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    date: r.date as string,
    weightKg: Number(r.weight_kg),
    bodyFatPct: r.body_fat_pct != null ? Number(r.body_fat_pct) : undefined,
    note: (r.note as string) ?? undefined,
  }))
}

// ---- Orders (checkout) ----
export async function placeOrder(
  userId: string,
  items: { productId: string; quantity: number; price: number }[],
  total: number,
): Promise<string | null> {
  const supabase = createClient()
  const { data: order, error } = await supabase
    .from('orders').insert({ user_id: userId, total, status: 'pending' }).select('id').single()
  if (error || !order) return null
  const orderId = order.id as string
  if (items.length > 0) {
    await supabase.from('order_items').insert(
      items.map((it) => ({
        order_id: orderId,
        product_id: it.productId,
        quantity: it.quantity,
        price_at_purchase: it.price,
      })),
    )
  }
  return orderId
}

// ---- Profiles ----

export async function fetchProfile(userId: string): Promise<Partial<User> & { role?: string } | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error || !data) return null
  const r = data as Record<string, unknown>
  return {
    id: r.id as string,
    nameEn: (r.name_en as string) ?? '',
    nameAr: (r.name_ar as string) ?? undefined,
    email: (r.email as string) ?? '',
    phone: (r.phone as string) ?? undefined,
    age: (r.age as number) ?? 0,
    gender: (r.gender as User['gender']) ?? 'male',
    heightCm: Number(r.height_cm) || 0,
    startWeightKg: Number(r.start_weight_kg) || 0,
    currentWeightKg: Number(r.current_weight) || 0,
    goal: (r.goal as User['goal']) ?? 'lose_weight',
    targetWeightKg: Number(r.target_weight) || 0,
    activityLevel: (r.activity_level as User['activityLevel']) ?? 'light',
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
    role: (r.role as string) ?? 'user',
  }
}

export async function upsertProfile(userId: string, u: Partial<User>): Promise<boolean> {
  const supabase = createClient()
  const row: Record<string, unknown> = { id: userId }
  if (u.nameEn !== undefined) row.name_en = u.nameEn
  if (u.nameAr !== undefined) row.name_ar = u.nameAr
  if (u.email !== undefined) row.email = u.email
  if (u.phone !== undefined) row.phone = u.phone
  if (u.age !== undefined) row.age = u.age
  if (u.gender !== undefined) row.gender = u.gender
  if (u.heightCm !== undefined) row.height_cm = u.heightCm
  if (u.startWeightKg !== undefined) row.start_weight_kg = u.startWeightKg
  if (u.currentWeightKg !== undefined) row.current_weight = u.currentWeightKg
  if (u.goal !== undefined) row.goal = u.goal
  if (u.targetWeightKg !== undefined) row.target_weight = u.targetWeightKg
  if (u.activityLevel !== undefined) row.activity_level = u.activityLevel
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })
  return !error
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return (data as { role?: string } | null)?.role === 'admin'
}

// ---- Water logs ----
export async function upsertWaterLog(userId: string, date: string, liters: number): Promise<void> {
  const supabase = createClient()
  await supabase.from('water_logs').upsert(
    { user_id: userId, date, liters },
    { onConflict: 'user_id,date' },
  )
}

export async function fetchWaterLogs(userId: string): Promise<{ date: string; liters: number }[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('water_logs').select('*').eq('user_id', userId)
  if (error || !data) return []
  return data.map((r: Record<string, unknown>) => ({ date: r.date as string, liters: Number(r.liters) }))
}
