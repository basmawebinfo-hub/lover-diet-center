"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, ChevronLeft, Download } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { adminClients } from "@/lib/admin-mock"
import { adminFetchClients } from "@/lib/supabase/db"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

export default function AdminClientsPage() {
  const { locale } = useLocale()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "active" | "trial" | "inactive">("all")
  const [rows, setRows] = useState<typeof adminClients>([])

  useEffect(() => {
    adminFetchClients().then((real) => {
      {
        // Map DB rows to the table shape (status/plan default for now)
        setRows(real.map((r) => ({
          id: r.id, nameEn: r.nameEn, nameAr: r.nameAr, email: r.email, phone: r.phone,
          gender: r.gender, age: r.age, startWeightKg: r.startWeightKg, currentWeightKg: r.currentWeightKg,
          targetWeightKg: r.targetWeightKg, goal: r.goal, plan: "—",
          status: "active" as const, joinedAt: r.joinedAt, lastActive: r.joinedAt,
        })))
      }
    })
  }, [])

  const filtered = useMemo(() => rows.filter((c) => {
    if (status !== "all" && c.status !== status) return false
    if (search) { const q = search.toLowerCase(); return c.nameEn.toLowerCase().includes(q) || c.nameAr.includes(search) || c.email.toLowerCase().includes(q) }
    return true
  }), [search, status])

  const statusCls: Record<string,string> = { active:"bg-emerald-50 text-emerald-700", trial:"bg-amber-50 text-amber-600", inactive:"bg-neutral-100 text-neutral-500" }
  const statusLbl: Record<string,{en:string;ar:string}> = { active:{en:"Active",ar:"نشط"}, trial:{en:"Trial",ar:"تجريبي"}, inactive:{en:"Inactive",ar:"غير نشط"} }
  const kg = t(locale,"kg","كجم")

  function exportAll() {
    const header = ["Name", "Email", "Phone", "Gender", "Age", "Start kg", "Current kg", "Target kg", "Goal", "Joined"]
    const lines = rows.map((c) => [c.nameEn, c.email, c.phone, c.gender, String(c.age), String(c.startWeightKg), String(c.currentWeightKg), String(c.targetWeightKg), c.goal, c.joinedAt])
    const csv = [header, ...lines].map((r) => r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "clients.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-emerald-600">{t(locale,"Clients","العملاء")}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale,"Client Management","إدارة العملاء")}</h1>
          </div>
          <button onClick={exportAll} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50">
            <Download className="size-4" /> {t(locale,"Export CSV","تصدير CSV")}
          </button>
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
                  <th className="p-4 text-start font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c)=>{
                  const lost = (c.startWeightKg - c.currentWeightKg).toFixed(1)
                  return (
                    <tr key={c.id} className="border-b border-neutral-50 transition-colors hover:bg-emerald-50/40">
                      <td className="p-4">
                        <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-3 group">
                          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{c.nameEn.charAt(0)}</span>
                          <div>
                            <p className="font-semibold text-neutral-900 group-hover:text-emerald-700">{locale==="ar"?c.nameAr:c.nameEn}</p>
                            <p className="text-xs text-neutral-400">{c.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 text-neutral-600">{c.plan}</td>
                      <td className="p-4">
                        <span className="font-semibold text-emerald-700">{lost} {kg}</span>
                        <span className="text-xs text-neutral-400"> / {(c.startWeightKg - c.targetWeightKg).toFixed(0)} {kg}</span>
                      </td>
                      <td className="p-4"><span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", statusCls[c.status])}>{locale==="ar"?statusLbl[c.status].ar:statusLbl[c.status].en}</span></td>
                      <td className="p-4 text-neutral-500">{c.lastActive}</td>
                      <td className="p-4 text-end">
                        <Link href={`/admin/clients/${c.id}`} className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-emerald-300 hover:text-emerald-700">
                          {t(locale,"View","عرض")} <ChevronLeft className="size-3.5 rtl:rotate-0 rotate-180" />
                        </Link>
                      </td>
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
