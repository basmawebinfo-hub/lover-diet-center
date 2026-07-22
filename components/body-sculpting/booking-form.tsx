"use client"

import { useState } from "react"
import { CalendarDays, CheckCircle2, Loader2, Phone } from "lucide-react"
import type { BodyService } from "@/lib/body-services"
import type { Locale } from "@/lib/locale-shared"

export function BookingForm({ service, locale }: { service: BodyService; locale: Locale }) {
  const ar = locale === "ar"
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string; reference?: string } | null>(null)

  async function submit(formData: FormData) {
    setPending(true)
    setResult(null)
    try {
      const response = await fetch("/api/service-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          customerName: String(formData.get("name") ?? "").trim(),
          phone: String(formData.get("phone") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim() || undefined,
          bookingDate: String(formData.get("date") ?? ""),
          bookingTime: String(formData.get("time") ?? ""),
          notes: String(formData.get("notes") ?? "").trim() || undefined,
          locale,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Booking failed")
      setResult({ ok: true, message: ar ? "تم استلام طلب حجزك. سنتواصل معك للتأكيد." : "Your booking request was received. We will contact you to confirm.", reference: data.reference })
    } catch {
      setResult({ ok: false, message: ar ? "تعذر إرسال الحجز الآن. تواصل معنا هاتفيًا." : "We could not send your booking. Please contact us by phone." })
    } finally {
      setPending(false)
    }
  }

  if (result?.ok) return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
      <CheckCircle2 className="size-12 text-emerald-700" aria-hidden="true" />
      <h3 className="text-xl font-bold text-neutral-950">{ar ? "طلبك وصل بنجاح" : "Request received"}</h3>
      <p className="max-w-md leading-7 text-neutral-600">{result.message}</p>
      {result.reference && <p className="rounded-full bg-white px-4 py-2 font-mono text-sm font-bold text-emerald-800">{result.reference}</p>}
      <a href="tel:+971529033110" className="inline-flex items-center gap-2 font-bold text-emerald-800"><Phone className="size-4" />052 903 3110</a>
    </div>
  )

  return (
    <form action={submit} className="flex flex-col gap-5">
      <input type="hidden" name="serviceId" value={service.id} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={ar ? "الاسم الكامل" : "Full name"} name="name" required maxLength={80} />
        <Field label={ar ? "رقم الهاتف" : "Phone number"} name="phone" type="tel" required inputMode="tel" />
        <Field label={ar ? "البريد الإلكتروني (اختياري)" : "Email (optional)"} name="email" type="email" />
        <Field label={ar ? "التاريخ المطلوب" : "Preferred date"} name="date" type="date" required min={new Date().toISOString().slice(0, 10)} />
        <Field label={ar ? "الوقت المطلوب" : "Preferred time"} name="time" type="time" required min="09:00" max="21:00" />
      </div>
      <label className="flex flex-col gap-2 text-sm font-bold text-neutral-800">
        {ar ? "ملاحظات (اختياري)" : "Notes (optional)"}
        <textarea name="notes" maxLength={500} rows={4} className="resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
      </label>
      {result && !result.ok && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">{result.message}</p>}
      <button type="submit" disabled={pending} className="btn-shine inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-6 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <CalendarDays className="size-5" aria-hidden="true" />}
        {pending ? (ar ? "جارٍ الإرسال..." : "Sending...") : (ar ? "اطلب حجز الجلسة" : "Request appointment")}
      </button>
      <p className="text-center text-xs leading-5 text-neutral-500">{ar ? "الحجز غير نهائي حتى يتواصل معك فريقنا لتأكيد الموعد." : "Your appointment is not final until our team contacts you to confirm."}</p>
    </form>
  )
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <label className="flex flex-col gap-2 text-sm font-bold text-neutral-800">{label}<input name={name} {...props} className="min-h-12 rounded-2xl border border-neutral-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></label>
}
