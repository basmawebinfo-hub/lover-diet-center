"use client"

import { AdminShell } from "@/components/admin/admin-shell"
import { StatChip } from "@/components/dashboard/stat-widgets"
import { adminRevenue, adminClients } from "@/lib/admin-mock"
import { TrendingUp, Users, DollarSign, Repeat } from "lucide-react"
import { useLocale, t } from "@/lib/locale"

export default function AdminAnalyticsPage() {
  const { locale } = useLocale()
  const aed = t(locale,"AED","درهم")
  const total = adminRevenue.reduce((s,r)=>s+r.value,0)
  const avg = Math.round(total/adminRevenue.length)
  const maxRev = Math.max(...adminRevenue.map(r=>r.value))
  // simple line points
  const W=700,H=240,PAD=30
  const xs=(i:number)=>PAD+i/(adminRevenue.length-1)*(W-2*PAD)
  const ys=(v:number)=>PAD+(1-v/maxRev)*(H-2*PAD)
  const line=adminRevenue.map((r,i)=>`${i===0?"M":"L"} ${xs(i).toFixed(1)} ${ys(r.value).toFixed(1)}`).join(" ")
  const area=`${line} L ${xs(adminRevenue.length-1)} ${H-PAD} L ${xs(0)} ${H-PAD} Z`

  const genders = { female: adminClients.filter(c=>c.gender==="female").length, male: adminClients.filter(c=>c.gender==="male").length }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-medium text-emerald-600">{t(locale,"Analytics","التحليلات")}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale,"Performance & Growth","الأداء والنمو")}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatChip tone="emerald" icon={<DollarSign className="size-5" />} label={t(locale,"Total Revenue","إجمالي الإيرادات")} value={`${(total/1000).toFixed(1)}k`} delta={`${aed}`} />
          <StatChip tone="violet" icon={<TrendingUp className="size-5" />} label={t(locale,"Avg / month","متوسط شهري")} value={`${(avg/1000).toFixed(1)}k`} delta={`${aed}`} />
          <StatChip tone="sky" icon={<Users className="size-5" />} label={t(locale,"Total Clients","إجمالي العملاء")} value={`${adminClients.length}`} />
          <StatChip tone="amber" icon={<Repeat className="size-5" />} label={t(locale,"Retention","معدل الاستمرار")} value="88%" delta={`+4%`} />
        </div>

        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale,"Revenue Trend","اتجاه الإيرادات")}</h2>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs>
            <path d={area} fill="url(#rev)" />
            <path d={line} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" />
            {adminRevenue.map((r,i)=><circle key={r.month} cx={xs(i)} cy={ys(r.value)} r="3.5" fill="#fff" stroke="#059669" strokeWidth="2" />)}
          </svg>
          <div className="mt-2 flex justify-between text-xs text-neutral-400">
            {adminRevenue.map(r=><span key={r.month}>{r.month}</span>)}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale,"Clients by gender","العملاء حسب الجنس")}</h2>
            <div className="space-y-3">
              {[["female","👩",genders.female,"#e07a9c"],["male","👨",genders.male,"#4f86c6"]].map(([k,emoji,n,col]:any)=>(
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm"><span>{emoji} {k==="female"?t(locale,"Female","إناث"):t(locale,"Male","ذكور")}</span><span className="font-bold">{n}</span></div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-100"><div className="h-full rounded-full" style={{width:`${(n/adminClients.length)*100}%`,background:col}} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale,"Clients by status","العملاء حسب الحالة")}</h2>
            <div className="space-y-3">
              {(["active","trial","inactive"] as const).map((s)=>{
                const n=adminClients.filter(c=>c.status===s).length
                const col=s==="active"?"#10b981":s==="trial"?"#f59e0b":"#9ca3af"
                const lbl={active:t(locale,"Active","نشط"),trial:t(locale,"Trial","تجريبي"),inactive:t(locale,"Inactive","غير نشط")}[s]
                return (
                  <div key={s}>
                    <div className="mb-1 flex justify-between text-sm"><span>{lbl}</span><span className="font-bold">{n}</span></div>
                    <div className="h-2.5 w-full rounded-full bg-neutral-100"><div className="h-full rounded-full" style={{width:`${(n/adminClients.length)*100}%`,background:col}} /></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
