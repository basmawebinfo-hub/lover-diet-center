"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { adminSessions } from "@/lib/admin-mock"
import { adminFetchSessions } from "@/lib/supabase/db"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

export default function AdminSessionsPage() {
  const { locale } = useLocale()
  const [rows, setRows] = useState<typeof adminSessions>([])
  useEffect(()=>{ adminFetchSessions().then((real)=>{ setRows(real.map(r=>({ id:r.id, client:r.client, type:r.type, typeAr:r.type, doctor:r.doctor, date:r.date, time:r.time, status:r.status as "scheduled"|"completed"|"cancelled" }))) }) },[])
  const upcoming = rows.filter(s=>s.status==="scheduled")
  const past = rows.filter(s=>s.status!=="scheduled")
  const cls: Record<string,string> = { scheduled:"bg-emerald-50 text-emerald-700", completed:"bg-neutral-100 text-neutral-500", cancelled:"bg-red-50 text-red-500" }
  const lbl: Record<string,{en:string;ar:string}> = { scheduled:{en:"Scheduled",ar:"مجدولة"}, completed:{en:"Completed",ar:"مكتملة"}, cancelled:{en:"Cancelled",ar:"ملغية"} }

  const Card = ({s}:{s:typeof adminSessions[number]}) => (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex size-12 flex-col items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <span className="text-xs font-medium">{s.date.slice(5)}</span>
          <span className="text-sm font-bold">{s.time}</span>
        </div>
        <div>
          <p className="font-semibold text-neutral-900">{locale==="ar"?s.typeAr:s.type}</p>
          <p className="text-xs text-neutral-400">{s.client} · {s.doctor}</p>
        </div>
      </div>
      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", cls[s.status])}>{locale==="ar"?lbl[s.status].ar:lbl[s.status].en}</span>
    </div>
  )

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium text-emerald-600">{t(locale,"Sessions","الجلسات")}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale,"Bookings & Sessions","الحجوزات والجلسات")}</h1>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-400">{t(locale,"Upcoming","القادمة")}</h2>
          <div className="space-y-3">{upcoming.map(s=><Card key={s.id} s={s} />)}</div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-400">{t(locale,"Past","السابقة")}</h2>
          <div className="space-y-3">{past.map(s=><Card key={s.id} s={s} />)}</div>
        </div>
      </div>
    </AdminShell>
  )
}
