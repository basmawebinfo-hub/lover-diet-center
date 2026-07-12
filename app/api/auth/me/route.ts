import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Lightweight identity endpoint for the public header.
// Returns the signed-in user's display name (or 401 when signed out).
export async function GET() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only endpoint — never mutate auth cookies here.
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name_en, name_ar")
    .eq("id", user.id)
    .single()

  const nameEn = (profile?.name_en as string | null) ?? ""
  const nameAr = (profile?.name_ar as string | null) ?? ""
  const fallback = (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? ""

  return NextResponse.json(
    {
      nameEn: nameEn || fallback,
      nameAr: nameAr || nameEn || fallback,
    },
    { headers: { "Cache-Control": "private, max-age=60" } },
  )
}
