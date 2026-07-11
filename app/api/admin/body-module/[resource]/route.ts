import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/supabase/admin-server"

const TABLES = {
  services: "body_services",
  categories: "service_categories",
  bookings: "service_bookings",
  reviews: "service_reviews",
  gallery: "service_gallery",
} as const
type Resource = keyof typeof TABLES

function tableFor(resource: string) {
  return TABLES[resource as Resource]
}

const AUTH_MESSAGES: Record<string, string> = {
  missing_env: "إعدادات Supabase ناقصة على السيرفر: تأكد من إضافة SUPABASE_SERVICE_ROLE_KEY في متغيرات البيئة على Vercel ثم أعد النشر.",
  not_authenticated: "يجب تسجيل الدخول أولًا بحساب أدمن.",
  not_admin: "حسابك الحالي ليس أدمن. حدّث عمود role إلى admin في جدول profiles لهذا الحساب.",
}

async function authorize() {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return {
      error: NextResponse.json(
        { error: AUTH_MESSAGES[admin.reason], code: admin.reason },
        { status: admin.reason === "missing_env" ? 500 : admin.reason === "not_admin" ? 403 : 401 },
      ),
    }
  }
  return { admin }
}

export async function GET(_request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params
  const table = tableFor(resource)
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  const { admin, error: authError } = await authorize()
  if (authError || !admin) return authError!
  const orderColumn = resource === "bookings" || resource === "reviews" ? "created_at" : "sort_order"
  const { data, error } = await admin.service
    .from(table)
    .select("*")
    .order(orderColumn, { ascending: resource !== "bookings" && resource !== "reviews" })
  if (error) {
    const hint = error.message.includes("does not exist")
      ? " — الجدول غير موجود: شغّل ملف SQL الأول (إنشاء الجداول) في Supabase SQL Editor."
      : ""
    return NextResponse.json({ error: error.message + hint, code: "db_error" }, { status: 500 })
  }
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params
  const table = tableFor(resource)
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  const { admin, error: authError } = await authorize()
  if (authError || !admin) return authError!
  const body = await request.json()
  delete body.id
  delete body.created_at
  delete body.updated_at
  const { data, error } = await admin.service.from(table).insert(body).select().single()
  return error
    ? NextResponse.json({ error: error.message }, { status: 422 })
    : NextResponse.json({ data }, { status: 201 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params
  const table = tableFor(resource)
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  const { admin, error: authError } = await authorize()
  if (authError || !admin) return authError!
  const body = await request.json()
  const id = body.id
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  delete body.id
  delete body.created_at
  body.updated_at = new Date().toISOString()
  const { data, error } = await admin.service.from(table).update(body).eq("id", id).select().single()
  return error
    ? NextResponse.json({ error: error.message }, { status: 422 })
    : NextResponse.json({ data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params
  const table = tableFor(resource)
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 404 })
  const { admin, error: authError } = await authorize()
  if (authError || !admin) return authError!
  const id = new URL(request.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const { error } = await admin.service.from(table).delete().eq("id", id)
  return error
    ? NextResponse.json({ error: error.message }, { status: 422 })
    : NextResponse.json({ ok: true })
}
