import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Ensure this segment is always evaluated fresh — never statically cached.
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getServerSupabase(url: string, key: string) {
  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // Server Components cannot set cookies. Middleware handles refresh.
      },
    },
  })
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // Preview/dev without Supabase env: don't crash the layout by constructing a
  // client with undefined credentials. Render children so the inner admin
  // managers surface their own helpful "missing env" guidance instead.
  if (!url || !key) {
    return <>{children}</>
  }

  const supabase = await getServerSupabase(url, key)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/sign-in?redirect=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, blocked')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.blocked === true) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
