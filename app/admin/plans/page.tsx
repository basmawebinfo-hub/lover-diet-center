"use client"

import Image from "next/image"
import { Plus } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { mockMeals } from "@/lib/mock-data"
import { adminClients } from "@/lib/admin-mock"
import { useLocale, t } from "@/lib/locale"

export default function AdminPlansPage() {
  const { locale } = useLocale()
  const onPlan = adminClients.filter(c=>c.status==="active")

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-medium text-emerald-600">{t(locale,"Meals & Plans","الوجبات والخطط")}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale,"Nutrition Plans","الخطط الغذائية")}</h1>
        </div>

        {/* Meals catalog */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">{t(locale,"Meals Catalog","كتالوج الوجبات")}</h2>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><Plus className="size-4" /> {t(locale,"Add meal","إضافة وجبة")}</button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockMeals.map((m)=>(
              <div key={m.id} className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
                <div className="relative h-32 bg-emerald-50"><Image src={m.imageUrl} alt={m.nameEn} fill sizes="33vw" className="object-cover" /></div>
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900">{locale==="ar"?m.nameAr:m.nameEn}</h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-600">{m.calories} kcal</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">{m.protein}g {t(locale,"protein","بروتين")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Clients on plans */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale,"Clients on a Plan","العملاء على خطة")}</h2>
          <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400">
                <th className="p-4 text-start font-medium">{t(locale,"Client","العميل")}</th>
                <th className="p-4 text-start font-medium">{t(locale,"Plan","الخطة")}</th>
                <th className="p-4 text-start font-medium">{t(locale,"Goal","الهدف")}</th>
              </tr></thead>
              <tbody>
                {onPlan.map(c=>(
                  <tr key={c.id} className="border-b border-neutral-50">
                    <td className="p-4 font-semibold text-neutral-900">{locale==="ar"?c.nameAr:c.nameEn}</td>
                    <td className="p-4 text-neutral-600">{c.plan}</td>
                    <td className="p-4 text-neutral-500">{c.goal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
