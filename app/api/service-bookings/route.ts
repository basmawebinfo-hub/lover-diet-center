import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { validateBooking, type ServiceBookingInput } from "@/lib/body-services"

export const runtime = "nodejs"
export async function POST(request: Request) {
  let body: Partial<ServiceBookingInput>
  try { body = await request.json() } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }
  const errors = validateBooking(body)
  if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 422 })
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: "Booking service is not configured" }, { status: 503 })
  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
  const { data, error }=await supabase.from("service_bookings").insert({service_id:body.serviceId,customer_name:body.customerName!.trim(),phone:body.phone!.trim(),email:body.email||null,booking_date:body.bookingDate,booking_time:body.bookingTime,notes:body.notes||null,locale:body.locale==="en"?"en":"ar",source:"website"}).select("reference").single()
  if(error) return NextResponse.json({error:"Unable to create booking"},{status:500})
  return NextResponse.json({ok:true,reference:data.reference},{status:201})
}
