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
