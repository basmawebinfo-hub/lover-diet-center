import { createClient } from '@/lib/supabase/client'
import type { Meal, Product, Session, User, WeightLog } from '@/lib/types'

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

/**
 * Update an existing weight log row by id. The id is trusted only after the
 * RLS policy checks user_id = auth.uid(); we still scope the update to the
 * caller's userId as a belt-and-suspenders guard so a stolen client cannot
 * update another user's rows even if RLS were misconfigured.
 * If the patch includes `date`, we first delete any other same-day row for
 * this user to preserve the (user_id, date) uniqueness the app relies on.
 */
export async function updateWeightLog(
  userId: string,
  logId: string,
  patch: { weightKg?: number; bodyFatPct?: number | null; note?: string | null; date?: string },
): Promise<boolean> {
  const supabase = createClient()
  const row: Record<string, unknown> = {}
  if (patch.weightKg !== undefined) row.weight_kg = patch.weightKg
  if (patch.bodyFatPct !== undefined) row.body_fat_pct = patch.bodyFatPct
  if (patch.note !== undefined) row.note = patch.note
  if (patch.date !== undefined) {
    // Delete any other same-day row for this user so the (user_id, date)
    // uniqueness invariant survives the date change.
    await supabase
      .from('weight_logs')
      .delete()
      .eq('user_id', userId)
      .eq('date', patch.date)
      .neq('id', logId)
    row.date = patch.date
  }
  if (Object.keys(row).length === 0) return true
  const { error } = await supabase
    .from('weight_logs')
    .update(row)
    .eq('id', logId)
    .eq('user_id', userId)
  return !error
}

/**
 * Delete a weight log row by id, scoped to the caller's userId.
 */
export async function deleteWeightLog(userId: string, logId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('weight_logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', userId)
  return !error
}

/**
 * Upsert-per-day helper: write a weight_logs row for `date` (default: today),
 * replacing any existing same-day row. Returns the persisted WeightLog with
 * its DB-generated id so the caller can put it straight into local state.
 *
 * The (user_id, date) invariant is enforced by delete-then-insert, matching
 * the pattern used by insertWeightLog.
 */
export async function upsertWeightLogForDate(
  userId: string,
  weightKg: number,
  date?: string,
  bodyFatPct?: number | null,
  note?: string | null,
): Promise<WeightLog | null> {
  const supabase = createClient()
  const d = date ?? new Date().toISOString().slice(0, 10)
  await supabase.from('weight_logs').delete().eq('user_id', userId).eq('date', d)
  const { data, error } = await supabase
    .from('weight_logs')
    .insert({
      user_id: userId,
      date: d,
      weight_kg: weightKg,
      body_fat_pct: bodyFatPct ?? null,
      note: note ?? null,
    })
    .select('id, date, weight_kg, body_fat_pct, note')
    .single()
  if (error || !data) return null
  const r = data as Record<string, unknown>
  return {
    id: r.id as string,
    date: r.date as string,
    weightKg: Number(r.weight_kg),
    bodyFatPct: r.body_fat_pct != null ? Number(r.body_fat_pct) : undefined,
    note: (r.note as string) ?? undefined,
  }
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

export async function fetchProfile(userId: string): Promise<(Partial<User> & { role?: "user" | "admin"; blocked?: boolean }) | null> {
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
    avatarUrl: (r.avatar_url as string) ?? undefined,
    age: (r.age as number) ?? 0,
    gender: (r.gender as User['gender']) ?? 'male',
    heightCm: Number(r.height_cm) || 0,
    startWeightKg: Number(r.start_weight_kg) || 0,
    currentWeightKg: Number(r.current_weight) || 0,
    goal: (r.goal as User['goal']) ?? 'lose_weight',
    targetWeightKg: Number(r.target_weight) || 0,
    activityLevel: (r.activity_level as User['activityLevel']) ?? 'light',
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
    role: ((r.role as string) === "admin" ? "admin" : "user"),
    blocked: (r.blocked as boolean) ?? false,
  }
}

export async function upsertProfile(userId: string, u: Partial<User>): Promise<boolean> {
  const supabase = createClient()

  // Map the camelCase payload to snake_case columns.
  const row: Record<string, unknown> = { id: userId }
  if (u.nameEn !== undefined) row.name_en = u.nameEn
  if (u.nameAr !== undefined) row.name_ar = u.nameAr
  if (u.email !== undefined) row.email = u.email
  if (u.phone !== undefined) row.phone = u.phone
  if (u.avatarUrl !== undefined) row.avatar_url = u.avatarUrl
  if (u.age !== undefined) row.age = u.age
  if (u.gender !== undefined) row.gender = u.gender
  if (u.heightCm !== undefined) row.height_cm = u.heightCm
  if (u.startWeightKg !== undefined) row.start_weight_kg = u.startWeightKg
  if (u.currentWeightKg !== undefined) row.current_weight = u.currentWeightKg
  if (u.goal !== undefined) row.goal = u.goal
  if (u.targetWeightKg !== undefined) row.target_weight = u.targetWeightKg
  if (u.activityLevel !== undefined) row.activity_level = u.activityLevel

  // Fetch the existing row once — we use it for two things:
  //   1) The onboarding_completed flip heuristic (completes false->true only).
  //   2) The weight-log sync check (only insert a log when current_weight
  //      actually changed).
  // If the fetch fails, `existingRow` stays null and both checks fall back to
  // conservative defaults (no false flip, always write the log).
  let existingRow: Record<string, unknown> | null = null
  try {
    const { data: existing } = await supabase
      .from('profiles')
      .select('name_en, phone, age, gender, height_cm, current_weight, goal, activity_level, onboarding_completed, role')
      .eq('id', userId)
      .single()
    existingRow = (existing as Record<string, unknown> | null) ?? {}
    const alreadyDone = existingRow.onboarding_completed === true
    const merged = { ...existingRow, ...row } as Record<string, unknown>
    const passes =
      String(merged.name_en ?? '').trim().length >= 2 &&
      String(merged.phone ?? '').replace(/[^0-9]/g, '').length >= 6 &&
      Number(merged.age) >= 12 &&
      typeof merged.gender === 'string' && (merged.gender as string).length > 0 &&
      Number(merged.height_cm) >= 100 &&
      Number(merged.current_weight) >= 30 &&
      typeof merged.goal === 'string' && (merged.goal as string).length > 0 &&
      typeof merged.activity_level === 'string' && (merged.activity_level as string).length > 0
    if (passes && !alreadyDone) {
      row.onboarding_completed = true
    }
    // Admins are exempt from the onboarding gate — keep them true regardless.
    if (existingRow.role === 'admin' && !alreadyDone) {
      row.onboarding_completed = true
    }
  } catch {
    // If the pre-fetch failed we still attempt the upsert; the DB column
    // stays at whatever it was.
  }

  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' })
  if (error) return false

  // Sync rule (Phase 2 PR 2): profiles.current_weight is the "latest snapshot"
  // and weight_logs is the "historical timeline". Any successful change to
  // current_weight from Profile Settings (or anywhere else that calls
  // upsertProfile) must also produce/update the same-day weight_logs row so
  // the Weight Tracker and Settings never diverge.
  //
  // We only write a log when the payload actually included a new current
  // weight AND that weight differs from what was in the row before. If the
  // pre-fetch failed (existingRow === null), we conservatively still write
  // the log so an unsynced state cannot silently persist.
  if (u.currentWeightKg !== undefined) {
    const prev = existingRow ? existingRow.current_weight : undefined
    const changed = prev === undefined || Number(prev) !== Number(u.currentWeightKg)
    if (changed) {
      try {
        await upsertWeightLogForDate(userId, Number(u.currentWeightKg))
      } catch {
        // Non-fatal: the profile write already succeeded. The next
        // Settings save or Weight Tracker save will reconcile.
      }
    }
  }

  return true
}

// Explicit setter used by the onboarding finalize step as a belt-and-suspenders
// on top of upsertProfile's heuristic. Also usable by an admin unblock flow.
export async function setOnboardingCompleted(
  userId: string,
  done: boolean = true,
): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: done })
    .eq('id', userId)
  if (error) {
    console.error('[setOnboardingCompleted] failed', error)
    return false
  }
  return true
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

// ---- Admin reads (RLS allows these only for role='admin') ----
export async function adminFetchClients() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    nameEn: (r.name_en as string) ?? '',
    nameAr: (r.name_ar as string) ?? '',
    email: (r.email as string) ?? '',
    phone: (r.phone as string) ?? '',
    country: (r.country as string) ?? '',
    gender: ((r.gender as string) === 'female' ? 'female' : 'male') as 'male' | 'female',
    age: (r.age as number) ?? 0,
    startWeightKg: Number(r.start_weight_kg) || 0,
    currentWeightKg: Number(r.current_weight) || 0,
    targetWeightKg: Number(r.target_weight) || 0,
    goal: (r.goal as string) ?? '',
    joinedAt: ((r.created_at as string) ?? '').slice(0, 10),
    blocked: (r.blocked as boolean) ?? false,
  }))
}

export async function adminFetchOrders() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('id, total, status, created_at, user_id, profiles(name_en), order_items(quantity)')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((r: Record<string, unknown>) => {
    const prof = r.profiles as { name_en?: string } | null
    const items = (r.order_items as { quantity: number }[]) ?? []
    return {
      id: r.id as string,
      client: prof?.name_en ?? '—',
      date: ((r.created_at as string) ?? '').slice(0, 10),
      items: items.reduce((s, it) => s + (it.quantity || 0), 0),
      total: Number(r.total) || 0,
      status: (r.status as string) ?? 'pending',
    }
  })
}

export async function adminUpdateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  return !error
}

export async function adminFetchSessions() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('id, type, doctor_name, date, time, status, profiles(name_en)')
    .order('date', { ascending: false })
  if (error || !data) return []
  return data.map((r: Record<string, unknown>) => {
    const prof = r.profiles as { name_en?: string } | null
    return {
      id: r.id as string,
      client: prof?.name_en ?? '—',
      type: (r.type as string) ?? '',
      doctor: (r.doctor_name as string) ?? 'Dr. Wael Mostafa',
      date: (r.date as string) ?? '',
      time: (r.time as string) ?? '',
      status: (r.status as string) ?? 'scheduled',
    }
  })
}

// ---- Product management (admin) ----

export async function adminFetchProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    nameEn: (r.name_en as string) ?? '',
    nameAr: (r.name_ar as string) ?? '',
    descriptionEn: (r.description_en as string) ?? '',
    descriptionAr: (r.description_ar as string) ?? '',
    imageUrl: (r.image_url as string) ?? '',
    price: Number(r.price) || 0,
    category: (r.category as Product['category']) ?? 'snack',
    inStock: (r.in_stock as boolean) ?? true,
  }))
}

export async function adminUpsertProduct(p: Product): Promise<boolean> {
  const supabase = createClient()
  const row = {
    id: p.id,
    name_en: p.nameEn,
    name_ar: p.nameAr,
    description_en: p.descriptionEn,
    description_ar: p.descriptionAr,
    image_url: p.imageUrl,
    price: p.price,
    category: p.category,
    in_stock: p.inStock,
  }
  const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' })
  return !error
}

export async function adminDeleteProduct(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  return !error
}

// Upload a product image to Supabase Storage ('product-images' bucket) -> returns public URL
export async function uploadProductImage(file: File): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() || 'png'
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) return null
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl ?? null
}

// Public product catalog read (RLS: products are world-readable)
export async function fetchProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true })
  if (error || !data) return []
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    nameEn: (r.name_en as string) ?? '',
    nameAr: (r.name_ar as string) ?? '',
    descriptionEn: (r.description_en as string) ?? '',
    descriptionAr: (r.description_ar as string) ?? '',
    imageUrl: (r.image_url as string) ?? '',
    price: Number(r.price) || 0,
    category: (r.category as Product['category']) ?? 'snack',
    inStock: (r.in_stock as boolean) ?? true,
  }))
}

// Public meals catalog read (full Meal)
export async function fetchMeals(): Promise<Meal[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('meals').select('*').order('created_at', { ascending: true })
  if (error || !data) return []
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    nameEn: (r.name_en as string) ?? '',
    nameAr: (r.name_ar as string) ?? '',
    descriptionEn: (r.description_en as string) ?? '',
    descriptionAr: (r.description_ar as string) ?? '',
    imageUrl: (r.image_url as string) ?? '',
    calories: Number(r.calories) || 0,
    protein: Number(r.protein) || 0,
    carbs: Number(r.carbs) || 0,
    fat: Number(r.fat) || 0,
    mealType: (r.meal_type as Meal['mealType']) ?? 'snack',
    tags: (r.tags as string[]) ?? [],
  }))
}

// ---- Admin: Meals CRUD ----
// meals RLS: public SELECT, admin ALL (backed by public.is_admin()).
// The client-side upsert therefore only works when signed in as an admin.
export async function adminFetchMeals(): Promise<Meal[]> {
  // Same shape as fetchMeals; kept as a separate function so we can add
  // admin-only column projections later (e.g. hidden/draft meals).
  return fetchMeals()
}

export async function adminUpsertMeal(m: Meal): Promise<boolean> {
  const supabase = createClient()
  const row = {
    id: m.id,
    name_en: m.nameEn,
    name_ar: m.nameAr || null,
    description_en: m.descriptionEn || null,
    description_ar: m.descriptionAr || null,
    image_url: m.imageUrl || null,
    calories: Math.max(0, Math.round(m.calories || 0)),
    protein:  Math.max(0, Math.round(m.protein  || 0)),
    carbs:    Math.max(0, Math.round(m.carbs    || 0)),
    fat:      Math.max(0, Math.round(m.fat      || 0)),
    meal_type: m.mealType,
    tags: Array.isArray(m.tags) ? m.tags : [],
  }
  const { error } = await supabase.from('meals').upsert(row, { onConflict: 'id' })
  if (error) {
    console.error('adminUpsertMeal failed', error)
    return false
  }
  return true
}

export async function adminDeleteMeal(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('meals').delete().eq('id', id)
  if (error) {
    console.error('adminDeleteMeal failed', error)
    return false
  }
  return true
}

// Upload a meal image to Supabase Storage ('meal-images' bucket) -> returns public URL.
// Bucket RLS restricts writes to admins; reads are public so the dashboard
// and marketing pages can render the image.
export async function uploadMealImage(file: File): Promise<string | null> {
  const supabase = createClient()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  // Path scheme: meals/<timestamp>-<rand>.<ext>. The 'meals/' prefix keeps
  // the bucket organized and is required by the storage RLS policy.
  const path = `meals/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('meal-images').upload(path, file, {
    upsert: true,
    cacheControl: '3600',
    contentType: file.type || undefined,
  })
  if (error) {
    console.error('uploadMealImage failed', error)
    return null
  }
  const { data } = supabase.storage.from('meal-images').getPublicUrl(path)
  return data.publicUrl ?? null
}

// ---- Admin: full detail for a single client ----
export type ClientDetail = {
  profile: Record<string, unknown> | null
  weightLogs: { date: string; weightKg: number }[]
  waterLogs: { date: string; liters: number }[]
  orders: { id: string; total: number; status: string; date: string; items: { name: string; quantity: number; price: number }[] }[]
  sessions: { id: string; type: string; doctor: string; date: string; time: string; status: string }[]
}

export async function adminFetchClientDetail(userId: string): Promise<ClientDetail> {
  const supabase = createClient()
  const [{ data: profile }, { data: wl }, { data: water }, { data: ord }, { data: ses }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('weight_logs').select('date, weight_kg').eq('user_id', userId).order('date', { ascending: true }),
    supabase.from('water_logs').select('date, liters').eq('user_id', userId).order('date', { ascending: true }),
    supabase.from('orders').select('id, total, status, created_at, order_items(quantity, price_at_purchase, products(name_en))').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('sessions').select('id, type, doctor_name, date, time, status').eq('user_id', userId).order('date', { ascending: false }),
  ])
  return {
    profile: (profile as Record<string, unknown>) ?? null,
    weightLogs: ((wl as Record<string, unknown>[]) ?? []).map((r) => ({ date: r.date as string, weightKg: Number(r.weight_kg) })),
    waterLogs: ((water as Record<string, unknown>[]) ?? []).map((r) => ({ date: r.date as string, liters: Number(r.liters) })),
    orders: ((ord as Record<string, unknown>[]) ?? []).map((r) => ({
      id: r.id as string, total: Number(r.total), status: r.status as string, date: ((r.created_at as string) ?? '').slice(0, 10),
      items: ((r.order_items as Record<string, unknown>[]) ?? []).map((it) => ({
        name: ((it.products as { name_en?: string } | null)?.name_en) ?? '—',
        quantity: Number(it.quantity), price: Number(it.price_at_purchase),
      })),
    })),
    sessions: ((ses as Record<string, unknown>[]) ?? []).map((r) => ({
      id: r.id as string, type: (r.type as string) ?? '', doctor: (r.doctor_name as string) ?? '', date: (r.date as string) ?? '', time: (r.time as string) ?? '', status: (r.status as string) ?? 'scheduled',
    })),
  }
}

export async function adminUpdateSessionStatus(sessionId: string, status: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('sessions').update({ status }).eq('id', sessionId)
  return !error
}

// ---- User's own orders (full Order shape) ----
export async function fetchUserOrders(userId: string): Promise<import('@/lib/types').Order[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('id, total, status, created_at, order_items(quantity, price_at_purchase, products(name_en, name_ar))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map((r: Record<string, unknown>) => {
    const items = ((r.order_items as Record<string, unknown>[]) ?? []).map((it) => {
      const prod = it.products as { name_en?: string; name_ar?: string } | null
      const qty = Number(it.quantity) || 1
      const price = Number(it.price_at_purchase) || 0
      return { productId: '', nameEn: prod?.name_en ?? '', nameAr: prod?.name_ar ?? prod?.name_en ?? '', quantity: qty, price }
    })
    const total = Number(r.total) || 0
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
    return {
      id: r.id as string,
      date: (r.created_at as string) ?? new Date().toISOString(),
      items,
      subtotal,
      shipping: Math.max(0, total - subtotal),
      total,
      status: (r.status as import('@/lib/types').Order['status']) ?? 'pending',
    }
  })
}

// ---- User's active diet plan (from meal_plans + plan_items) ----
export async function fetchUserPlan(userId: string): Promise<import('@/lib/types').DoctorPlan | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meal_plans')
    .select('id, doctor_name, start_date, end_date, goal, daily_calories, water_liters, notes_en, notes_ar, plan_items(id, day_of_week, meals(id, name_en, name_ar, description_en, description_ar, image_url, calories, protein, carbs, fat, meal_type, tags))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  const r = data as Record<string, unknown>
  const planItems = ((r.plan_items as Record<string, unknown>[]) ?? []).map((pi) => {
    const m = pi.meals as Record<string, unknown> | null
    return {
      id: pi.id as string,
      dayOfWeek: Number(pi.day_of_week) || 0,
      meal: {
        id: (m?.id as string) ?? '',
        nameEn: (m?.name_en as string) ?? '',
        nameAr: (m?.name_ar as string) ?? '',
        descriptionEn: (m?.description_en as string) ?? '',
        descriptionAr: (m?.description_ar as string) ?? '',
        imageUrl: (m?.image_url as string) ?? '',
        calories: Number(m?.calories) || 0,
        protein: Number(m?.protein) || 0,
        carbs: Number(m?.carbs) || 0,
        fat: Number(m?.fat) || 0,
        mealType: (m?.meal_type as import('@/lib/types').Meal['mealType']) ?? 'snack',
        tags: (m?.tags as string[]) ?? [],
      },
    }
  })
  return {
    id: r.id as string,
    doctorName: (r.doctor_name as string) ?? '',
    startDate: (r.start_date as string) ?? '',
    endDate: (r.end_date as string) ?? '',
    goal: (r.goal as import('@/lib/types').DoctorPlan['goal']) ?? 'lose_weight',
    notesEn: (r.notes_en as string) ?? '',
    notesAr: (r.notes_ar as string) ?? '',
    planItems,
    dailyCalories: Number(r.daily_calories) || 0,
    waterLiters: Number(r.water_liters) || 0,
  }
}

// ---- Admin: create/replace a client's diet plan ----
export async function adminUpsertPlan(userId: string, plan: {
  doctorName: string; startDate: string; endDate: string; goal: string;
  dailyCalories: number; waterLiters: number; notesEn: string; notesAr: string;
  items: { dayOfWeek: number; mealId: string }[];
}): Promise<boolean> {
  const supabase = createClient()
  // Replace any existing plans for this user (one active plan model)
  const { data: existing } = await supabase.from('meal_plans').select('id').eq('user_id', userId)
  if (existing && existing.length) {
    await supabase.from('meal_plans').delete().eq('user_id', userId)
  }
  const { data: created, error } = await supabase.from('meal_plans').insert({
    user_id: userId,
    doctor_name: plan.doctorName,
    start_date: plan.startDate || null,
    end_date: plan.endDate || null,
    goal: plan.goal,
    daily_calories: plan.dailyCalories,
    water_liters: plan.waterLiters,
    notes_en: plan.notesEn,
    notes_ar: plan.notesAr,
  }).select('id').single()
  if (error || !created) return false
  const planId = (created as { id: string }).id
  const items = plan.items.filter((i) => i.mealId)
  if (items.length) {
    await supabase.from('plan_items').insert(items.map((i) => ({ plan_id: planId, day_of_week: i.dayOfWeek, meal_id: i.mealId })))
  }
  return true
}

// ============================================================================
// Admin: Plan Builder (non-destructive CRUD on meal_plans + plan_items)
// ----------------------------------------------------------------------------
// The older adminUpsertPlan() destructively replaces every plan a user has.
// The functions below let the admin manage multiple plans and edit any one
// of them without losing history. They rely on the existing FK cascade:
// deleting a meal_plan row automatically removes its plan_items.
// ============================================================================

export type PlanMeta = {
  doctorName: string
  startDate: string    // '' or 'YYYY-MM-DD'
  endDate: string      // '' or 'YYYY-MM-DD'
  goal: string
  dailyCalories: number
  waterLiters: number
  notesEn: string
  notesAr: string
}

export type PlanItemInput = {
  dayOfWeek: number    // 0..6 (0 = Sunday)
  mealId: string
}

export type PlanSummary = {
  id: string
  userId: string
  clientNameEn: string
  clientNameAr: string
  doctorName: string
  goal: string
  startDate: string
  endDate: string
  dailyCalories: number
  itemCount: number
  createdAt: string
}

// List every plan across all clients (admin overview).
export async function adminFetchAllPlans(): Promise<PlanSummary[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meal_plans')
    .select('id, user_id, doctor_name, goal, start_date, end_date, daily_calories, created_at, profiles(name_en, name_ar), plan_items(id)')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as Record<string, unknown>[]).map((r) => {
    const prof = (r.profiles as Record<string, unknown> | null)
    const items = (r.plan_items as Record<string, unknown>[]) ?? []
    return {
      id: r.id as string,
      userId: r.user_id as string,
      clientNameEn: (prof?.name_en as string) ?? '',
      clientNameAr: (prof?.name_ar as string) ?? '',
      doctorName: (r.doctor_name as string) ?? '',
      goal: (r.goal as string) ?? '',
      startDate: (r.start_date as string) ?? '',
      endDate: (r.end_date as string) ?? '',
      dailyCalories: Number(r.daily_calories) || 0,
      itemCount: items.length,
      createdAt: (r.created_at as string) ?? '',
    }
  })
}

// List plans belonging to a single client (admin view on client detail).
export async function adminFetchPlansForClient(userId: string): Promise<PlanSummary[]> {
  const all = await adminFetchAllPlans()
  return all.filter((p) => p.userId === userId)
}

// Fetch a single plan by id, including its items with the full nested Meal.
export async function adminFetchPlan(planId: string): Promise<{
  meta: PlanMeta & { id: string; userId: string; clientNameEn: string; clientNameAr: string }
  items: { id: string; dayOfWeek: number; meal: import('@/lib/types').Meal }[]
} | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meal_plans')
    .select('id, user_id, doctor_name, start_date, end_date, goal, daily_calories, water_liters, notes_en, notes_ar, profiles(name_en, name_ar), plan_items(id, day_of_week, meals(id, name_en, name_ar, description_en, description_ar, image_url, calories, protein, carbs, fat, meal_type, tags))')
    .eq('id', planId)
    .maybeSingle()
  if (error || !data) return null
  const r = data as Record<string, unknown>
  const prof = (r.profiles as Record<string, unknown> | null)
  const items = ((r.plan_items as Record<string, unknown>[]) ?? []).map((pi) => {
    const m = pi.meals as Record<string, unknown> | null
    return {
      id: pi.id as string,
      dayOfWeek: Number(pi.day_of_week) || 0,
      meal: {
        id: (m?.id as string) ?? '',
        nameEn: (m?.name_en as string) ?? '',
        nameAr: (m?.name_ar as string) ?? '',
        descriptionEn: (m?.description_en as string) ?? '',
        descriptionAr: (m?.description_ar as string) ?? '',
        imageUrl: (m?.image_url as string) ?? '',
        calories: Number(m?.calories) || 0,
        protein: Number(m?.protein) || 0,
        carbs: Number(m?.carbs) || 0,
        fat: Number(m?.fat) || 0,
        mealType: (m?.meal_type as import('@/lib/types').Meal['mealType']) ?? 'snack',
        tags: (m?.tags as string[]) ?? [],
      },
    }
  })
  return {
    meta: {
      id: r.id as string,
      userId: r.user_id as string,
      clientNameEn: (prof?.name_en as string) ?? '',
      clientNameAr: (prof?.name_ar as string) ?? '',
      doctorName: (r.doctor_name as string) ?? '',
      startDate: (r.start_date as string) ?? '',
      endDate: (r.end_date as string) ?? '',
      goal: (r.goal as string) ?? 'lose_weight',
      dailyCalories: Number(r.daily_calories) || 0,
      waterLiters: Number(r.water_liters) || 0,
      notesEn: (r.notes_en as string) ?? '',
      notesAr: (r.notes_ar as string) ?? '',
    },
    items,
  }
}

// Create a new empty plan for a client. Returns new plan id.
export async function adminCreatePlan(userId: string, meta: PlanMeta): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      user_id: userId,
      doctor_name: meta.doctorName || null,
      start_date: meta.startDate || null,
      end_date:   meta.endDate   || null,
      goal:       meta.goal      || null,
      daily_calories: meta.dailyCalories || null,
      water_liters:   meta.waterLiters   || null,
      notes_en:  meta.notesEn || null,
      notes_ar:  meta.notesAr || null,
    })
    .select('id')
    .single()
  if (error || !data) {
    console.error('adminCreatePlan failed', error)
    return null
  }
  return (data as { id: string }).id
}

// Update the metadata columns on an existing plan (does NOT touch plan_items).
export async function adminUpdatePlanMeta(planId: string, meta: PlanMeta): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('meal_plans')
    .update({
      doctor_name: meta.doctorName || null,
      start_date: meta.startDate || null,
      end_date:   meta.endDate   || null,
      goal:       meta.goal      || null,
      daily_calories: meta.dailyCalories || null,
      water_liters:   meta.waterLiters   || null,
      notes_en:  meta.notesEn || null,
      notes_ar:  meta.notesAr || null,
    })
    .eq('id', planId)
  if (error) {
    console.error('adminUpdatePlanMeta failed', error)
    return false
  }
  return true
}

// Delete a plan (cascade removes its plan_items via the FK).
export async function adminDeletePlan(planId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('meal_plans').delete().eq('id', planId)
  if (error) {
    console.error('adminDeletePlan failed', error)
    return false
  }
  return true
}

// Replace the full set of plan_items for a plan.
// Two-step: delete-all then insert-all. Wrapped so partial failure surfaces.
export async function adminSetPlanItems(planId: string, items: PlanItemInput[]): Promise<boolean> {
  const supabase = createClient()
  const { error: delErr } = await supabase.from('plan_items').delete().eq('plan_id', planId)
  if (delErr) {
    console.error('adminSetPlanItems delete failed', delErr)
    return false
  }
  const rows = items.filter((i) => i.mealId).map((i) => ({
    plan_id: planId,
    day_of_week: Math.max(0, Math.min(6, Number(i.dayOfWeek))),
    meal_id: i.mealId,
  }))
  if (rows.length === 0) return true
  const { error: insErr } = await supabase.from('plan_items').insert(rows)
  if (insErr) {
    console.error('adminSetPlanItems insert failed', insErr)
    return false
  }
  return true
}


// ---- Admin: create a session/booking for a client ----
export async function adminCreateSession(s: {
  userId: string; type: string; doctorName: string; date: string; time: string;
  durationMinutes: number; location: string; notes?: string;
}): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('sessions').insert({
    user_id: s.userId,
    type: s.type,
    doctor_name: s.doctorName,
    date: s.date || null,
    time: s.time || null,
    duration_minutes: s.durationMinutes,
    status: 'scheduled',
    location: s.location,
    notes: s.notes ?? null,
  })
  return !error
}

// Upload a user avatar to Supabase Storage ('avatars' bucket) -> public URL
export async function uploadUserAvatar(userId: string, file: File): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() || 'png'
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) return null
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const url = data.publicUrl ?? null
  if (url) await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
  return url
}

// ---- Admin: delete a client's profile (removes them from the dashboard) ----
export async function adminDeleteClient(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('profiles').delete().eq('id', userId)
  return !error
}

// ---- Admin: block / unblock a client ----
export async function adminToggleBlock(userId: string, blocked: boolean): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('profiles').update({ blocked }).eq('id', userId)
  return !error
}
