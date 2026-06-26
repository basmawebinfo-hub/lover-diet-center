"use client"

import { useMemo, useState } from "react"
import { Search, Users } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { adminClients } from "@/lib/admin-mock"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

export default function AdminClientsPage() {
  const { locale } = useLocale()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "active" | "trial" | "inactive">("all")

  const filtered = useMemo(() => adminClients.filter((c) => {
    if (status !== "all" && c.status !== status) return false
    if (search) { const q = search.toLowerCase(); return c.nameEn.toLowerCase().includes(q) || c.nameAr.includes(search) || c.email.toLowerCase().includes(q) }
    return true
  }), [search, status])

  const statusCls: Record<string,string> = { active:"bg-emerald-50 text-emerald-700", trial:"bg-amber-50 text-amber-600", inactive:"bg-neutral-100 text-neutral-500" }
  const statusLbl: Record<string,{en:string;ar:string}> = { active:{en:"Active",ar:"نشط"}, trial:{en:"Trial",ar:"تجريبي"}, inactive:{en:"Inactive",ar:"غير نشط"} }
  const kg = t(locale,"kg","كجم")

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-emerald-600">{t(locale,"Clients","العملاء")}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale,"Client Management","إدارة العملاء")}</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 sm:w-72">
            <Search className="size-4 text-neutral-400" />
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder={t(locale,"Search clients…","ابحث عن عميل…")} className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all","active","trial","inactive"] as const).map((s)=>(
              <button key={s} onClick={()=>setStatus(s)} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", status===s?"bg-emerald-600 text-white":"bg-white text-neutral-600 hover:bg-emerald-50")}>
                {s==="all"?t(locale,"All","الكل"):(locale==="ar"?statusLbl[s].ar:statusLbl[s].en)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400">
                  <th className="p-4 text-start font-medium">{t(locale,"Client","العميل")}</th>
                  <th className="p-4 text-start font-medium">{t(locale,"Plan","الباقة")}</th>
                  <th className="p-4 text-start font-medium">{t(locale,"Progress","التقدّم")}</th>
                  <th className="p-4 text-start font-medium">{t(locale,"Status","الحالة")}</th>
                  <th className="p-4 text-start font-medium">{t(locale,"Last active","آخر نشاط")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c)=>{
                  const lost = (c.startWeightKg - c.currentWeightKg).toFixed(1)
                  return (
                    <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{c.nameEn.charAt(0)}</span>
                          <div>
                            <p className="font-semibold text-neutral-900">{locale==="ar"?c.nameAr:c.nameEn}</p>
                            <p className="text-xs text-neutral-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-neutral-600">{c.plan}</td>
                      <td className="p-4">
                        <span className="font-semibold text-emerald-700">{lost} {kg}</span>
                        <span className="text-xs text-neutral-400"> / {(c.startWeightKg - c.targetWeightKg).toFixed(0)} {kg}</span>
                      </td>
                      <td className="p-4"><span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", statusCls[c.status])}>{locale==="ar"?statusLbl[c.status].ar:statusLbl[c.status].en}</span></td>
                      <td className="p-4 text-neutral-500">{c.lastActive}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length===0 && <p className="py-12 text-center text-neutral-400">{t(locale,"No clients found.","لا يوجد عملاء.")}</p>}
        </div>
      </div>
    </AdminShell>
  )
}
