"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AdminShell } from "@/components/admin/admin-shell"
import { fetchMeals, adminFetchClients } from "@/lib/supabase/db"
import { useLocale, t } from "@/lib/locale"

type Meal = { id: string; nameEn: string; nameAr: string; imageUrl: string; calories: number; protein: number }
type Client = { id: string; nameEn: string; nameAr: string; goal: string }

export default function AdminPlansPage() {
  const { locale } = useLocale()
  const [meals, setMeals] = useState<Meal[] | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    fetchMeals().then(setMeals)
    adminFetchClients().then((c) => setClients(c.map((x) => ({ id: x.id, nameEn: x.nameEn, nameAr: x.nameAr, goal: x.goal }))))
  }, [])

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-medium text-emerald-600">{t(locale, "Meals & Plans", "الوجبات والخطط")}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale, "Nutrition Plans", "الخطط الغذائية")}</h1>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale, "Meals Catalog", "كتالوج الوجبات")}</h2>
          {meals === null ? (
            <p className="py-10 text-center text-sm text-neutral-400">{t(locale, "Loading…", "جارٍ التحميل…")}</p>
          ) : meals.length === 0 ? (
            <p className="rounded-2xl border border-neutral-100 bg-white py-10 text-center text-sm text-neutral-400">{t(locale, "No meals yet.", "لا توجد وجبات بعد.")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {meals.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
                  <div className="relative h-32 bg-emerald-50">{m.imageUrl && <Image src={m.imageUrl} alt={m.nameEn} fill sizes="33vw" className="object-cover" />}</div>
                  <div className="p-4">
                    <h3 className="font-bold text-neutral-900">{locale === "ar" ? (m.nameAr || m.nameEn) : m.nameEn}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-600">{m.calories} kcal</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">{m.protein}g {t(locale, "protein", "بروتين")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale, "Clients", "العملاء")}</h2>
          {clients.length === 0 ? (
            <p className="rounded-2xl border border-neutral-100 bg-white py-10 text-center text-sm text-neutral-400">{t(locale, "No clients yet.", "لا يوجد عملاء بعد.")}</p>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400">
                  <th className="p-4 text-start font-medium">{t(locale, "Client", "العميل")}</th>
                  <th className="p-4 text-start font-medium">{t(locale, "Goal", "الهدف")}</th>
                </tr></thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-50">
                      <td className="p-4 font-semibold text-neutral-900">{locale === "ar" ? (c.nameAr || c.nameEn) : c.nameEn}</td>
                      <td className="p-4 text-neutral-500">{c.goal || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}
