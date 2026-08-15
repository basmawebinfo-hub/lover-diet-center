"use client"

// Full-page Meal Plan editor.
// Route: /admin/plans/<planId>     -> edit existing plan
//        /admin/plans/new?client=<userId>  -> create new plan for a client
//
// The layout is a 7-day x 4-slot grid (rows = Sunday..Saturday, columns =
// Breakfast/Lunch/Dinner/Snack). Each cell is a searchable meal picker
// scoped to that meal_type. The plan is saved in two API calls:
//   1) adminCreatePlan  or  adminUpdatePlanMeta  (metadata)
//   2) adminSetPlanItems                          (the whole grid replaced)

import { useEffect, useMemo, useState, useRef } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AdminShell } from "@/components/admin/admin-shell"
import {
  adminFetchMeals,
  adminFetchPlan,
  adminCreatePlan,
  adminUpdatePlanMeta,
  adminSetPlanItems,
  adminDeletePlan,
  adminFetchClients,
} from "@/lib/supabase/db"
import type { Meal } from "@/lib/types"
import type { PlanMeta } from "@/lib/supabase/db"
import { useLocale, t } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"
import {
  ArrowLeft, Loader2, Trash2, Save, Coffee, Sun, Moon, Cookie, X, Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Days-of-week — 0 = Sunday to match the DB convention used elsewhere in db.ts.
const DAYS: { i: number; en: string; ar: string }[] = [
  { i: 0, en: "Sunday",    ar: "الأحد"   },
  { i: 1, en: "Monday",    ar: "الإثنين" },
  { i: 2, en: "Tuesday",   ar: "الثلاثاء"},
  { i: 3, en: "Wednesday", ar: "الأربعاء"},
  { i: 4, en: "Thursday",  ar: "الخميس"  },
  { i: 5, en: "Friday",    ar: "الجمعة"  },
  { i: 6, en: "Saturday",  ar: "السبت"    },
]

const SLOTS: {
  key: Meal["mealType"]
  en: string
  ar: string
  icon: typeof Coffee
  tone: string
}[] = [
  { key: "breakfast", en: "Breakfast", ar: "إفطار",  icon: Coffee,  tone: "text-amber-600 bg-amber-50" },
  { key: "lunch",     en: "Lunch",     ar: "غداء",   icon: Sun,     tone: "text-orange-600 bg-orange-50" },
  { key: "dinner",    en: "Dinner",    ar: "عشاء",   icon: Moon,    tone: "text-indigo-600 bg-indigo-50" },
  { key: "snack",     en: "Snack",     ar: "خفيفة",  icon: Cookie,  tone: "text-emerald-700 bg-emerald-50" },
]

const GOALS = ["lose_weight", "gain_muscle", "maintain", "tone"] as const

// grid[dayOfWeek][mealType] -> mealId | null
type Grid = Record<number, Partial<Record<Meal["mealType"], string>>>

const emptyMeta = (): PlanMeta => ({
  doctorName: "Dr. Wael Mostafa",
  startDate: "",
  endDate: "",
  goal: "lose_weight",
  dailyCalories: 1800,
  waterLiters: 2.5,
  notesEn: "",
  notesAr: "",
})

const emptyGrid = (): Grid => Object.fromEntries(DAYS.map((d) => [d.i, {}])) as Grid

export default function PlanEditorPage() {
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const router = useRouter()
  const { locale } = useLocale()
  const { notify } = useToast()

  const isNew = params.id === "new"
  const initialClientId = search.get("client") || ""

  // --- state ---
  const [meals, setMeals] = useState<Meal[] | null>(null)
  const [clients, setClients] = useState<{ id: string; nameEn: string; nameAr: string }[]>([])
  const [clientId, setClientId] = useState(initialClientId)
  const [meta, setMeta] = useState<PlanMeta>(emptyMeta())
  const [grid, setGrid] = useState<Grid>(emptyGrid())
  const [planId, setPlanId] = useState<string | null>(isNew ? null : params.id)

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Meal picker modal
  const [pickerOpen, setPickerOpen] = useState<{ day: number; slot: Meal["mealType"] } | null>(null)
  const [pickerQuery, setPickerQuery] = useState("")
  const pickerInputRef = useRef<HTMLInputElement>(null)

  // --- load meals + clients + (optionally) existing plan ---
  useEffect(() => {
    adminFetchMeals().then(setMeals)
    adminFetchClients().then((c) =>
      setClients(c.map((x) => ({ id: x.id, nameEn: x.nameEn, nameAr: x.nameAr }))),
    )
  }, [])

  useEffect(() => {
    if (isNew) return
    let mounted = true
    setLoading(true)
    adminFetchPlan(params.id).then((res) => {
      if (!mounted) return
      if (!res) {
        notify(t(locale, "Plan not found.", "الخطة غير موجودة."), "error")
        setLoading(false)
        return
      }
      setClientId(res.meta.userId)
      const { userId: _u, clientNameEn: _en, clientNameAr: _ar, id: _id, ...m } = res.meta
      setMeta(m)
      const g = emptyGrid()
      for (const it of res.items) {
        g[it.dayOfWeek] = { ...g[it.dayOfWeek], [it.meal.mealType]: it.meal.id }
      }
      setGrid(g)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [params.id, isNew, locale, notify])

  // --- helpers ---
  const mealsById = useMemo(() => {
    const m = new Map<string, Meal>()
    for (const x of meals ?? []) m.set(x.id, x)
    return m
  }, [meals])

  const gridStats = useMemo(() => {
    let filled = 0, kcal = 0, protein = 0
    for (const d of DAYS) {
      const row = grid[d.i] ?? {}
      for (const s of SLOTS) {
        const id = row[s.key]
        if (!id) continue
        const m = mealsById.get(id)
        if (!m) continue
        filled++
        kcal += m.calories || 0
        protein += m.protein || 0
      }
    }
    return { filled, totalSlots: DAYS.length * SLOTS.length, kcal, protein }
  }, [grid, mealsById])

  const selectedClient = clients.find((c) => c.id === clientId)

  function slotMeal(day: number, slot: Meal["mealType"]): Meal | undefined {
    const id = grid[day]?.[slot]
    return id ? mealsById.get(id) : undefined
  }

  function clearSlot(day: number, slot: Meal["mealType"]) {
    setGrid((prev) => {
      const row = { ...(prev[day] ?? {}) }
      delete row[slot]
      return { ...prev, [day]: row }
    })
  }

  function openPicker(day: number, slot: Meal["mealType"]) {
    setPickerOpen({ day, slot })
    setPickerQuery("")
    setTimeout(() => pickerInputRef.current?.focus(), 50)
  }

  function pickMeal(m: Meal) {
    if (!pickerOpen) return
    setGrid((prev) => ({
      ...prev,
      [pickerOpen.day]: { ...(prev[pickerOpen.day] ?? {}), [pickerOpen.slot]: m.id },
    }))
    setPickerOpen(null)
  }

  const pickerMeals = useMemo(() => {
    if (!pickerOpen || !meals) return []
    const q = pickerQuery.trim().toLowerCase()
    return meals
      .filter((m) => m.mealType === pickerOpen.slot)
      .filter((m) =>
        q === ""
        || m.nameEn.toLowerCase().includes(q)
        || (m.nameAr && m.nameAr.toLowerCase().includes(q))
        || m.tags.some((t) => t.toLowerCase().includes(q))
      )
  }, [pickerOpen, meals, pickerQuery])

  // --- actions ---
  async function save() {
    // Validation
    if (!clientId) {
      notify(t(locale, "Pick a client for this plan.", "اختر عميلاً لهذه الخطة."), "error")
      return
    }
    if (meta.dailyCalories < 0 || meta.waterLiters < 0) {
      notify(t(locale, "Calories and water cannot be negative.", "السعرات والماء لا يمكن أن تكون سالبة."), "error")
      return
    }
    if (meta.startDate && meta.endDate && meta.startDate > meta.endDate) {
      notify(t(locale, "End date must be after start date.", "تاريخ النهاية يجب أن يكون بعد البداية."), "error")
      return
    }

    setSaving(true)
    try {
      let currentPlanId = planId
      if (!currentPlanId) {
        currentPlanId = await adminCreatePlan(clientId, meta)
        if (!currentPlanId) throw new Error("create failed")
      } else {
        const ok = await adminUpdatePlanMeta(currentPlanId, meta)
        if (!ok) throw new Error("update failed")
      }

      // Flatten grid to items
      const items: { dayOfWeek: number; mealId: string }[] = []
      for (const d of DAYS) {
        const row = grid[d.i] ?? {}
        for (const s of SLOTS) {
          const id = row[s.key]
          if (id) items.push({ dayOfWeek: d.i, mealId: id })
        }
      }
      const okItems = await adminSetPlanItems(currentPlanId, items)
      if (!okItems) throw new Error("items failed")

      notify(t(locale, "Plan saved.", "تم حفظ الخطة."), "success")

      if (isNew) {
        setPlanId(currentPlanId)
        // Navigate to the edit URL so subsequent saves are UPDATE not CREATE.
        router.replace(`/admin/plans/${currentPlanId}`)
      }
    } catch {
      notify(
        t(locale,
          "Save failed. Check your admin session and try again.",
          "فشل الحفظ. تحقق من جلسة الأدمن وأعد المحاولة."),
        "error",
      )
    } finally {
      setSaving(false)
    }
  }

  async function del() {
    if (!planId) return
    if (!confirm(t(locale, "Delete this plan? This cannot be undone.", "حذف هذه الخطة؟ لا يمكن التراجع."))) return
    setDeleting(true)
    const ok = await adminDeletePlan(planId)
    setDeleting(false)
    if (ok) {
      notify(t(locale, "Plan deleted.", "تم حذف الخطة."), "success")
      router.replace("/admin/plans")
    } else {
      notify(t(locale, "Delete failed.", "فشل الحذف."), "error")
    }
  }

  // --- render ---
  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-neutral-400">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/plans"
              className="flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
              aria-label={t(locale, "Back", "رجوع")}
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <p className="text-sm font-medium text-emerald-600">{t(locale, "Meal Plan", "خطة غذائية")}</p>
              <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
                {isNew ? t(locale, "New Plan", "خطة جديدة") : t(locale, "Edit Plan", "تعديل الخطة")}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                onClick={del}
                disabled={deleting || saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t(locale, "Delete", "حذف")}
              </button>
            )}
            <button
              onClick={save}
              disabled={saving || deleting || !clientId}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {t(locale, "Save plan", "حفظ الخطة")}
            </button>
          </div>
        </div>

        {/* Metadata card */}
        <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-neutral-500">
            {t(locale, "Plan details", "تفاصيل الخطة")}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label={t(locale, "Client *", "العميل *")}>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={!isNew}
                className={inputCls}
              >
                <option value="">{t(locale, "— pick a client —", "— اختر عميلاً —")}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === "ar" ? (c.nameAr || c.nameEn || c.id.slice(0, 6)) : (c.nameEn || c.nameAr || c.id.slice(0, 6))}
                  </option>
                ))}
              </select>
              {!isNew && selectedClient && (
                <p className="mt-1 text-[11px] text-neutral-400">
                  {t(locale, "Client cannot be changed on an existing plan.", "لا يمكن تغيير العميل على خطة موجودة.")}
                </p>
              )}
            </Field>
            <Field label={t(locale, "Doctor", "الطبيب")}>
              <input
                value={meta.doctorName}
                onChange={(e) => setMeta({ ...meta, doctorName: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label={t(locale, "Goal", "الهدف")}>
              <select
                value={meta.goal}
                onChange={(e) => setMeta({ ...meta, goal: e.target.value })}
                className={inputCls}
              >
                {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label={t(locale, "Start date", "تاريخ البداية")}>
              <input
                type="date"
                value={meta.startDate}
                onChange={(e) => setMeta({ ...meta, startDate: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label={t(locale, "End date", "تاريخ النهاية")}>
              <input
                type="date"
                value={meta.endDate}
                onChange={(e) => setMeta({ ...meta, endDate: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label={t(locale, "Daily calories", "السعرات اليومية")}>
              <input
                type="number" min={0} max={10000}
                value={meta.dailyCalories}
                onChange={(e) => setMeta({ ...meta, dailyCalories: Math.max(0, parseInt(e.target.value) || 0) })}
                className={inputCls}
              />
            </Field>
            <Field label={t(locale, "Water (L)", "الماء (لتر)")}>
              <input
                type="number" step={0.1} min={0} max={20}
                value={meta.waterLiters}
                onChange={(e) => setMeta({ ...meta, waterLiters: Math.max(0, parseFloat(e.target.value) || 0) })}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={t(locale, "Notes (EN)", "ملاحظات (إنجليزي)")}>
              <textarea rows={2} value={meta.notesEn} onChange={(e) => setMeta({ ...meta, notesEn: e.target.value })} className={inputCls} />
            </Field>
            <Field label={t(locale, "Notes (AR)", "ملاحظات (عربي)")}>
              <textarea dir="rtl" rows={2} value={meta.notesAr} onChange={(e) => setMeta({ ...meta, notesAr: e.target.value })} className={inputCls} />
            </Field>
          </div>
        </section>

        {/* Stats strip */}
        <div className="flex flex-wrap gap-3">
          <StatPill label={t(locale, "Filled slots", "خانات ممتلئة")} value={`${gridStats.filled} / ${gridStats.totalSlots}`} tone="emerald" />
          <StatPill label={t(locale, "Weekly calories", "سعرات أسبوعية")} value={`${gridStats.kcal.toLocaleString()} kcal`} tone="amber" />
          <StatPill label={t(locale, "Weekly protein", "بروتين أسبوعي")} value={`${gridStats.protein} g`} tone="sky" />
        </div>

        {/* Grid */}
        <section className="overflow-x-auto rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm">
          <div className="grid min-w-[900px] gap-2" style={{ gridTemplateColumns: "120px repeat(4, minmax(0, 1fr))" }}>
            <div />
            {SLOTS.map((s) => (
              <div key={s.key} className="flex items-center gap-2 px-2 pb-1 text-xs font-bold text-neutral-500">
                <span className={cn("flex size-6 items-center justify-center rounded-lg", s.tone)}>
                  <s.icon className="size-3.5" />
                </span>
                {t(locale, s.en, s.ar)}
              </div>
            ))}
            {DAYS.map((d) => (
              <FragmentRow key={d.i}>
                <div className="flex items-center pe-3 text-sm font-bold text-neutral-700">
                  {locale === "ar" ? d.ar : d.en}
                </div>
                {SLOTS.map((s) => {
                  const m = slotMeal(d.i, s.key)
                  return (
                    <div
                      key={s.key}
                      className={cn(
                        "group relative min-h-[92px] rounded-2xl border border-dashed p-2 transition",
                        m ? "border-transparent bg-emerald-50/30" : "border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/40",
                      )}
                    >
                      {m ? (
                        <div className="flex h-full items-stretch gap-2">
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white">
                            {m.imageUrl ? (
                              <Image src={m.imageUrl} alt={m.nameEn} fill sizes="56px" className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[9px] text-neutral-300">no img</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-xs font-semibold text-neutral-900">
                              {locale === "ar" ? (m.nameAr || m.nameEn) : m.nameEn}
                            </p>
                            <p className="mt-0.5 text-[10px] font-semibold text-neutral-500">
                              {m.calories} kcal · {m.protein}g p
                            </p>
                          </div>
                          <div className="flex flex-col justify-between">
                            <button
                              onClick={() => clearSlot(d.i, s.key)}
                              aria-label={t(locale, "Remove", "إزالة")}
                              className="rounded-md p-1 text-neutral-400 hover:bg-white hover:text-red-500"
                            >
                              <X className="size-3.5" />
                            </button>
                            <button
                              onClick={() => openPicker(d.i, s.key)}
                              className="rounded-md p-1 text-[10px] font-semibold text-emerald-600 hover:bg-white"
                            >
                              {t(locale, "Change", "تغيير")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openPicker(d.i, s.key)}
                          className="flex size-full flex-col items-center justify-center gap-1 text-xs font-semibold text-neutral-400 hover:text-emerald-600"
                        >
                          <span className="rounded-full border border-current px-2.5 py-0.5 text-[10px]">+</span>
                          <span>{t(locale, "Add meal", "إضافة وجبة")}</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </FragmentRow>
            ))}
          </div>
        </section>
      </div>

      {/* Meal picker modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPickerOpen(null)} />
          <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-neutral-400">
                  {t(locale, "Pick a meal for", "اختر وجبة لـ")} {locale === "ar" ? DAYS[pickerOpen.day].ar : DAYS[pickerOpen.day].en}
                </p>
                <p className="text-sm font-bold text-neutral-900">
                  {t(locale, SLOTS.find((x) => x.key === pickerOpen.slot)!.en, SLOTS.find((x) => x.key === pickerOpen.slot)!.ar)}
                </p>
              </div>
              <button onClick={() => setPickerOpen(null)} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-50">
                <X className="size-5" />
              </button>
            </div>
            <div className="border-b border-neutral-100 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-neutral-400" />
                <input
                  ref={pickerInputRef}
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  placeholder={t(locale, "Search meals in this category…", "ابحث في وجبات هذا التصنيف…")}
                  className="w-full rounded-xl border border-neutral-200 py-2.5 ps-9 pe-3 text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {meals === null ? (
                <div className="flex items-center justify-center py-10 text-neutral-400">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : pickerMeals.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-400">
                  {t(locale,
                    "No meals in this category yet. Create one from the Meals Catalog.",
                    "لا توجد وجبات في هذا التصنيف بعد. أنشئ وجبة من كتالوج الوجبات.")}
                </div>
              ) : (
                <div className="space-y-1">
                  {pickerMeals.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => pickMeal(m)}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-start transition hover:bg-emerald-50"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                        {m.imageUrl && <Image src={m.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-neutral-900">
                          {locale === "ar" ? (m.nameAr || m.nameEn) : m.nameEn}
                        </p>
                        <p className="text-[11px] font-medium text-neutral-500">
                          {m.calories} kcal · {m.protein}g p · {m.carbs}g c · {m.fat}g f
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

// --- small local helpers ---

const inputCls =
  "w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>
      {children}
    </div>
  )
}

function StatPill({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" | "sky" }) {
  const toneCls = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
  }[tone]
  return (
    <div className={cn("rounded-2xl px-4 py-2.5 text-sm", toneCls)}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-base font-extrabold">{value}</p>
    </div>
  )
}

// Grid rows are flat cells — React needs a Fragment wrapper for each row's cells
// so we can keep the outer grid layout in a single element.
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
