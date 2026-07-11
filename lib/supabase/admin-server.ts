import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"

export async function requireAdmin() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!publishable||!serviceKey) return null
  const store=await cookies()
  const auth=createServerClient(url,publishable,{cookies:{getAll:()=>store.getAll(),setAll:()=>{}}})
  const {data:{user}}=await auth.auth.getUser()
  if(!user) return null
  const service=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:profile}=await service.from("profiles").select("role").eq("id",user.id).single()
  if(profile?.role!=="admin") return null
  return { user, service }
}
