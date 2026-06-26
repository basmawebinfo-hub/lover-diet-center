"use client"

import { useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { adminOrders, type AdminOrder } from "@/lib/admin-mock"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

const FLOW: AdminOrder["status"][] = ["pending","processing","shipped","delivered","cancelled"]

export default function AdminOrdersPage() {
  const { locale } = useLocale()
  const [orders, setOrders] = useState(adminOrders)
  const [filter, setFilter] = useState<"all" | AdminOrder["status"]>("all")
  const aed = t(locale,"AED","درهم")

  const statusCls: Record<string,string> = { pending:"bg-amber-50 text-amber-600", processing:"bg-blue-50 text-blue-600", shipped:"bg-indigo-50 text-indigo-600", delivered:"bg-emerald-50 text-emerald-700", cancelled:"bg-red-50 text-red-500" }
  const statusLbl: Record<string,{en:string;ar:string}> = { pending:{en:"Pending",ar:"قيد الانتظار"}, processing:{en:"Processing",ar:"قيد التجهيز"}, shipped:{en:"Shipped",ar:"تم الشحن"}, delivered:{en:"Delivered",ar:"تم التوصيل"}, cancelled:{en:"Cancelled",ar:"ملغي"} }

  const shown = filter==="all" ? orders : orders.filter(o=>o.status===filter)
  const setStatus = (id:string, s:AdminOrder["status"]) => setOrders(prev=>prev.map(o=>o.id===id?{...o,status:s}:o))

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-medium text-emerald-600">{t(locale,"Orders","الطلبات")}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale,"Order Management","إدارة الطلبات")}</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all",...FLOW] as const).map((s)=>(
            <button key={s} onClick={()=>setFilter(s)} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", filter===s?"bg-emerald-600 text-white":"bg-white text-neutral-600 hover:bg-emerald-50")}>
              {s==="all"?t(locale,"All","الكل"):(locale==="ar"?statusLbl[s].ar:statusLbl[s].en)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {shown.map((o)=>(
            <div key={o.id} className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-bold text-neutral-900">#{o.id.slice(-4)}</p>
                  <p className="text-xs text-neutral-400">{o.date}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-700">{o.client}</p>
                  <p className="text-xs text-neutral-400">{o.items} {t(locale,"items","عناصر")} · {o.total} {aed}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", statusCls[o.status])}>{locale==="ar"?statusLbl[o.status].ar:statusLbl[o.status].en}</span>
                <select value={o.status} onChange={(e)=>setStatus(o.id, e.target.value as AdminOrder["status"])} className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 focus:border-emerald-400 focus:outline-none">
                  {FLOW.map(s=><option key={s} value={s}>{locale==="ar"?statusLbl[s].ar:statusLbl[s].en}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
