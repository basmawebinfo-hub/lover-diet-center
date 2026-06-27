"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Scale, Target, Flame, Droplets, ShoppingBag, Calendar,
  Mail, Phone, User as UserIcon, Cake, Ruler, Activity, Loader2, MessageCircle, Download,
} from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { StatChip } from "@/components/dashboard/stat-widgets"
import { WeightChart } from "@/components/dashboard/weight-chart"
import { adminFetchClientDetail, type ClientDetail } from "@/lib/supabase/db"
import { useCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

export default function AdminClientDetailPage() {
  const params = useParams()
  const id = String(params?.id ?? "")
  const { locale } = useLocale()
  const { format } = useCurrency()
  const [data, setData] = useState<ClientDetail | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    adminFetchClientDetail(id).then((d) => { setData(d); setLoaded(true) })
  }, [id])

  const p = data?.profile
  const get = (k: string) => (p?.[k] as string | number | null | undefined)

  const weightLogs = useMemo(() =>
    (data?.weightLogs ?? []).map((w) => ({ id: w.date, date: w.date, weightKg: w.weightKg })), [data])

  if (loaded && !p) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-3xl py-20 text-center">
          <p className="text-lg font-bold text-neutral-900">{t(locale, "Client not found", "العميل غير موجود")}</p>
          <Link href="/admin/clients" className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">{t(locale, "Back to clients", "العودة للعملاء")}</Link>
        </div>
      </AdminShell>
    )
  }

  if (!data) {
    return <AdminShell><div className="flex items-center justify-center py-32 text-neutral-400"><Loader2 className="size-6 animate-spin" /></div></AdminShell>
  }

  const nameEn = (get("name_en") as string) || "—"
  const nameAr = (get("name_ar") as string) || nameEn
  const name = locale === "ar" ? nameAr : nameEn
  const start = Number(get("start_weight_kg")) || 0
  const current = Number(get("current_weight")) || 0
  const target = Number(get("target_weight")) || 0
  const lost = Math.max(0, start - current)
  const toGoal = Math.max(0, current - target)
  const latestWater = data.waterLogs.length ? data.waterLogs[data.waterLogs.length - 1].liters : 0

  const phone = (get("phone") as string) || ""
  const waLink = phone
    ? `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${nameEn}, this is Lover Diet Center.`)}`
    : ""

  function exportCsv() {
    const rows: string[][] = [
      ["Field", "Value"],
      ["Name", nameEn],
      ["Email", (get("email") as string) || ""],
      ["Phone", phone],
      ["Age", String(get("age") ?? "")],
      ["Gender", (get("gender") as string) || ""],
      ["Height (cm)", String(get("height_cm") ?? "")],
      ["Start weight (kg)", String(start)],
      ["Current weight (kg)", String(current)],
      ["Target weight (kg)", String(target)],
      ["Goal", (get("goal") as string) || ""],
      ["Activity", (get("activity_level") as string) || ""],
      ["Orders", String(data.orders.length)],
      ["Sessions", String(data.sessions.length)],
      [],
      ["Weight log date", "Weight (kg)"],
      ...data.weightLogs.map((w) => [w.date, String(w.weightKg)]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${nameEn.replace(/\s+/g, "_")}_profile.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sessionCls: Record<string, string> = { scheduled: "bg-emerald-50 text-emerald-700", completed: "bg-neutral-100 text-neutral-500", cancelled: "bg-red-50 text-red-500" }
  const orderCls: Record<string, string> = { pending: "bg-amber-50 text-amber-600", processing: "bg-blue-50 text-blue-600", shipped: "bg-indigo-50 text-indigo-600", confirmed: "bg-blue-50 text-blue-600", delivered: "bg-emerald-50 text-emerald-700", cancelled: "bg-red-50 text-red-500" }

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="truncate text-sm font-semibold text-neutral-900">{value || "—"}</p>
      </div>
    </div>
  )

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-emerald-700">
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t(locale, "Back to clients", "العودة للعملاء")}
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">{nameEn.charAt(0)}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-neutral-900">{name}</h1>
            <p className="text-sm text-neutral-400">{(get("email") as string) || "—"}</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{(get("goal") as string) || "—"}</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-600">{(get("gender") as string) === "female" ? t(locale, "Female", "أنثى") : t(locale, "Male", "ذكر")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
              <MessageCircle className="size-4" /> {t(locale, "Message on WhatsApp", "مراسلة عبر واتساب")}
            </a>
          )}
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50">
            <Download className="size-4" /> {t(locale, "Export CSV", "تصدير CSV")}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatChip tone="emerald" icon={<Scale className="size-5" />} label={t(locale, "Current Weight", "الوزن الحالي")} value={`${current.toFixed(1)} ${t(locale,"kg","كجم")}`} delta={`${lost.toFixed(1)} ${t(locale,"kg lost","كجم مفقودة")}`} />
          <StatChip tone="violet" icon={<Target className="size-5" />} label={t(locale, "Target", "الهدف")} value={`${target.toFixed(1)} ${t(locale,"kg","كجم")}`} delta={`${toGoal.toFixed(1)} ${t(locale,"kg to go","كجم متبقية")}`} />
          <StatChip tone="sky" icon={<Droplets className="size-5" />} label={t(locale, "Latest Water", "آخر تسجيل ماء")} value={`${latestWater} ${t(locale,"L","ل")}`} />
          <StatChip tone="amber" icon={<ShoppingBag className="size-5" />} label={t(locale, "Orders", "الطلبات")} value={`${data.orders.length}`} delta={`${data.sessions.length} ${t(locale,"sessions","جلسات")}`} />
        </div>

        {/* Weight chart */}
        {weightLogs.length > 0 ? (
          <WeightChart logs={weightLogs} goalKg={target} />
        ) : (
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 text-center text-sm text-neutral-400 shadow-sm">{t(locale, "No weight logs yet.", "لا توجد سجلات وزن بعد.")}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal info */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-neutral-900">{t(locale, "Personal Info", "المعلومات الشخصية")}</h2>
            <div className="divide-y divide-neutral-50">
              <InfoRow icon={<UserIcon className="size-4" />} label={t(locale, "Full name", "الاسم الكامل")} value={nameEn} />
              <InfoRow icon={<Mail className="size-4" />} label={t(locale, "Email", "البريد")} value={(get("email") as string) || ""} />
              <InfoRow icon={<Phone className="size-4" />} label={t(locale, "Phone", "الهاتف")} value={(get("phone") as string) || ""} />
              <InfoRow icon={<Cake className="size-4" />} label={t(locale, "Age", "العمر")} value={get("age") ? `${get("age")} ${t(locale,"yrs","سنة")}` : ""} />
              <InfoRow icon={<Ruler className="size-4" />} label={t(locale, "Height", "الطول")} value={get("height_cm") ? `${get("height_cm")} ${t(locale,"cm","سم")}` : ""} />
              <InfoRow icon={<Activity className="size-4" />} label={t(locale, "Activity", "النشاط")} value={(get("activity_level") as string) || ""} />
              <InfoRow icon={<Flame className="size-4" />} label={t(locale, "Joined", "تاريخ الانضمام")} value={((get("created_at") as string) || "").slice(0, 10)} />
            </div>
          </div>

          {/* Sessions */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale, "Sessions", "الجلسات")}</h2>
            {data.sessions.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">{t(locale, "No sessions.", "لا توجد جلسات.")}</p>
            ) : (
              <div className="space-y-3">
                {data.sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-2xl border border-neutral-100 p-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 flex-col items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Calendar className="size-4" /></span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{s.type || "—"}</p>
                        <p className="text-xs text-neutral-400">{s.date} {s.time && `· ${s.time}`}</p>
                      </div>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", sessionCls[s.status] || "bg-neutral-100 text-neutral-500")}>{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale, "Order History", "سجل الطلبات")}</h2>
          {data.orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-400">{t(locale, "No orders.", "لا توجد طلبات.")}</p>
          ) : (
            <div className="space-y-4">
              {data.orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-neutral-100 p-4">
                  <div className="flex items-center justify-between border-b border-neutral-50 pb-3">
                    <div>
                      <p className="font-bold text-neutral-900">#{o.id.slice(-4)}</p>
                      <p className="text-xs text-neutral-400">{o.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-700">{format(o.total)}</span>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", orderCls[o.status] || "bg-neutral-100 text-neutral-500")}>{o.status}</span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    {o.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-sm text-neutral-600">
                        <span>{it.name} × {it.quantity}</span>
                        <span>{format(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
