"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Scale, TrendingDown, TrendingUp, Save, Loader2, Plus, Pencil, Trash2, X, Target, Activity, CalendarDays, Sparkles,
} from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import { calculateBMI } from "@/lib/analysis"
import type { WeightLog } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"
import { WeightChart } from "@/components/dashboard/weight-chart"

// Business rules from PROJECT_MEMORY.md CHECK constraints:
//   weight_logs.weight_kg: 25 <= x <= 400
const MIN_WEIGHT = 25
const MAX_WEIGHT = 400

type FormState = {
  weight: string
  date: string // YYYY-MM-DD
  editingId: string | null
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm(): FormState {
  return { weight: "", date: todayISO(), editingId: null }
}

function bmiLabel(bmi: number, locale: "en" | "ar"): string {
  if (bmi <= 0) return "-"
  if (bmi < 18.5) return t(locale, "Underweight", "نقص وزن")
  if (bmi < 25) return t(locale, "Normal", "طبيعي")
  if (bmi < 30) return t(locale, "Overweight", "زيادة وزن")
  return t(locale, "Obese", "سمنة")
}

export default function WeightPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { notify } = useToast()
  const { state, logWeight, editWeight, removeWeight } = useApp()
  const user = state.user

  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (state.authChecked && !user) router.replace("/onboarding")
  }, [state.authChecked, user, router])

  // Prefill the form with today's log if one exists. Otherwise leave blank.
  useEffect(() => {
    if (!user) return
    const today = todayISO()
    const todayLog = state.weightLogs.find((l) => l.date === today)
    setForm({
      weight: todayLog ? String(todayLog.weightKg) : "",
      date: today,
      editingId: null, // "today" is edited via upsert-per-day, not editingId
    })
  }, [user, state.weightLogs])

  const logs = state.weightLogs
  const sorted = useMemo(() => [...logs].sort((a, b) => (a.date < b.date ? 1 : -1)), [logs])

  // === KPIs ==============================================================
  const kpis = useMemo(() => {
    if (!user) return null
    const latest = sorted[0]
    const currentWeight = latest?.weightKg ?? user.currentWeightKg
    const totalChange = currentWeight - user.startWeightKg
    const remaining = currentWeight - user.targetWeightKg
    // Weekly trend: (weight_now - weight_7d_ago) / 7d span, expressed as kg/week.
    // Falls back to (newest - oldest) over the actual span if there is no
    // 7-day-old entry; returns null if we have <2 entries.
    let weeklyTrend: number | null = null
    if (sorted.length >= 2) {
      const newest = sorted[0]
      const cutoffTs = new Date(newest.date).getTime() - 7 * 24 * 3600 * 1000
      const older =
        sorted.find((l) => new Date(l.date).getTime() <= cutoffTs) ??
        sorted[sorted.length - 1]
      const daysSpan = Math.max(
        1,
        (new Date(newest.date).getTime() - new Date(older.date).getTime()) /
          (24 * 3600 * 1000),
      )
      weeklyTrend = ((newest.weightKg - older.weightKg) / daysSpan) * 7
    }
    const bmi = user.heightCm > 0 ? calculateBMI(currentWeight, user.heightCm) : 0
    return { currentWeight, totalChange, remaining, weeklyTrend, bmi }
  }, [sorted, user])

  if (!state.authChecked && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="size-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    )
  }
  if (!user || !kpis) return null

  // === Validation ========================================================
  function validate(): string | null {
    const w = Number(form.weight)
    if (!form.weight.trim() || Number.isNaN(w)) {
      return t(locale, "Enter a weight.", "أدخل الوزن.")
    }
    if (w < MIN_WEIGHT || w > MAX_WEIGHT) {
      return t(
        locale,
        `Weight must be between ${MIN_WEIGHT} and ${MAX_WEIGHT} kg.`,
        `الوزن يجب أن يكون بين ${MIN_WEIGHT} و ${MAX_WEIGHT} كجم.`,
      )
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      return t(locale, "Invalid date.", "تاريخ غير صالح.")
    }
    return null
  }

  // === Save ==============================================================
  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const v = validate()
    if (v) { setErr(v); return }
    if (!user) return
    setSaving(true)
    const weightKg = Number(form.weight)
    let ok = false
    if (form.editingId) {
      // Editing an existing (non-today) row.
      ok = await editWeight(form.editingId, {
        weightKg,
        date: form.date,
      })
    } else {
      // Today's upsert (or a new row for a chosen date). logWeight uses
      // insertWeightLog which delete-then-inserts to preserve one-per-day.
      const log: WeightLog = {
        id: `w_${Date.now()}`,
        date: form.date,
        weightKg,
      }
      ok = await logWeight(log)
    }
    setSaving(false)
    if (!ok) {
      setErr(t(locale, "Save failed — please try again.", "فشل الحفظ — يرجى المحاولة مرة أخرى."))
      return
    }
    notify(t(locale, "Weight saved", "تم حفظ الوزن"), "success")
    setForm(emptyForm())
  }

  function beginEdit(log: WeightLog) {
    setForm({
      weight: String(log.weightKg),
      date: log.date,
      editingId: log.id,
    })
    setErr(null)
    // Scroll to the form on mobile.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function cancelEdit() {
    setErr(null)
    setForm(emptyForm())
  }

  async function confirmDelete(id: string) {
    setDeletingId(id)
    const ok = await removeWeight(id)
    setDeletingId(null)
    setConfirmingId(null)
    if (ok) {
      notify(t(locale, "Entry deleted", "تم حذف السجل"), "success")
      if (form.editingId === id) setForm(emptyForm())
    } else {
      notify(t(locale, "Delete failed — please try again.", "فشل الحذف — يرجى المحاولة مرة أخرى."), "error")
    }
  }

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-5xl space-y-6 pb-28 lg:pb-0">

        <header>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "Weight Tracker", "متابعة الوزن")}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t(locale, "Log your weight, follow your trend, close the gap to your goal.", "سجّل وزنك، تابع تطوّرك، واقترب من هدفك.")}</p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi
            icon={<Sparkles className="size-4" />}
            tone={kpis.totalChange <= 0 ? "emerald" : "orange"}
            label={t(locale, "Total change", "التغيّر الإجمالي")}
            value={`${kpis.totalChange >= 0 ? "+" : ""}${kpis.totalChange.toFixed(1)} ${t(locale, "kg", "كجم")}`}
            hint={t(locale, "since start", "منذ البداية")}
          />
          <Kpi
            icon={<Target className="size-4" />}
            tone="lime"
            label={t(locale, "Remaining", "المتبقي")}
            value={`${Math.abs(kpis.remaining).toFixed(1)} ${t(locale, "kg", "كجم")}`}
            hint={
              kpis.remaining > 0
                ? t(locale, "to goal", "للهدف")
                : kpis.remaining < 0
                  ? t(locale, "past goal", "تجاوزت الهدف")
                  : t(locale, "at goal", "عند الهدف")
            }
          />
          <Kpi
            icon={kpis.weeklyTrend != null && kpis.weeklyTrend < 0 ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}
            tone={kpis.weeklyTrend != null && kpis.weeklyTrend < 0 ? "emerald" : "sky"}
            label={t(locale, "Weekly trend", "الاتجاه الأسبوعي")}
            value={kpis.weeklyTrend != null ? `${kpis.weeklyTrend >= 0 ? "+" : ""}${kpis.weeklyTrend.toFixed(2)} ${t(locale, "kg/wk", "كجم/أسبوع")}` : "-"}
            hint={t(locale, "recent pace", "معدل حديث")}
          />
          <Kpi
            icon={<Activity className="size-4" />}
            tone="violet"
            label={t(locale, "Current BMI", "مؤشر كتلة الجسم")}
            value={kpis.bmi > 0 ? kpis.bmi.toFixed(1) : "-"}
            hint={kpis.bmi > 0 ? bmiLabel(kpis.bmi, locale) : t(locale, "add height", "أضف الطول")}
          />
        </section>

        {/* Chart */}
        <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Scale className="size-4 text-lime-700" />
            <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Trend", "الاتجاه")}</h2>
          </div>
          {logs.length === 0 ? (
            <EmptyChart locale={locale} />
          ) : (
            <WeightChart logs={logs} goalKg={Math.round(user.targetWeightKg * 10) / 10} />
          )}
        </section>

        {/* Add / Edit form */}
        <section className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {form.editingId ? <Pencil className="size-4 text-lime-700" /> : <Plus className="size-4 text-lime-700" />}
              <h2 className="text-lg font-bold text-neutral-900">
                {form.editingId ? t(locale, "Edit entry", "تعديل سجل") : t(locale, "Log weight", "سجّل الوزن")}
              </h2>
            </div>
            {form.editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-50"
              >
                <X className="size-3.5" />
                {t(locale, "Cancel", "إلغاء")}
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {form.editingId
              ? t(locale, "Update the values below then save.", "حدّث القيم بالأسفل ثم احفظ.")
              : t(locale, "Enter your weight and pick the date.", "أدخل وزنك واختر التاريخ.")}
          </p>
          <form onSubmit={onSave} className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField
              label={t(locale, "Weight", "الوزن")}
              suffix={t(locale, "kg", "كجم")}
              value={form.weight}
              onChange={(v) => setForm((p) => ({ ...p, weight: v }))}
              min={MIN_WEIGHT}
              max={MAX_WEIGHT}
              step="0.1"
              required
              autoFocus
            />
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Date", "التاريخ")}</label>
              <div className="flex items-center rounded-xl border border-neutral-200 bg-white focus-within:border-lime-400 focus-within:ring-2 focus-within:ring-lime-100">
                <CalendarDays className="ms-3 size-4 text-neutral-400" />
                <input
                  type="date"
                  value={form.date}
                  max={todayISO()}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none"
                />
              </div>
            </div>
            {err && (
              <div role="alert" className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {err}
              </div>
            )}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition",
                  saving ? "cursor-not-allowed bg-neutral-100 text-neutral-400" : "bg-lime-700 text-white shadow-sm hover:bg-lime-800",
                )}
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving
                  ? t(locale, "Saving...", "جارٍ الحفظ...")
                  : form.editingId
                    ? t(locale, "Update entry", "تحديث السجل")
                    : t(locale, "Save entry", "حفظ السجل")}
              </button>
            </div>
          </form>
        </section>

        {/* History */}
        <section className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-lime-700" />
            <h2 className="text-lg font-bold text-neutral-900">{t(locale, "History", "السجل")}</h2>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500">
              {sorted.length}
            </span>
          </div>
          {sorted.length === 0 ? (
            <EmptyHistory locale={locale} />
          ) : (
            <div className="mt-4 divide-y divide-neutral-100">
              {sorted.map((log, i) => {
                const prev = sorted[i + 1]
                const change = prev ? log.weightKg - prev.weightKg : 0
                const isConfirm = confirmingId === log.id
                const isDeleting = deletingId === log.id
                return (
                  <div key={log.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-neutral-800">
                        {new Date(log.date).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-lg font-bold text-neutral-900">{log.weightKg.toFixed(1)} {t(locale, "kg", "كجم")}</span>
                        {prev && change !== 0 && (
                          <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold", change < 0 ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600")}>
                            {change < 0 ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                            {change > 0 ? "+" : ""}{change.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isConfirm ? (
                        <>
                          <span className="text-xs font-semibold text-red-700">{t(locale, "Are you sure?", "هل أنت متأكد؟")}</span>
                          <button
                            type="button"
                            onClick={() => confirmDelete(log.id)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            {isDeleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                            {t(locale, "Delete", "حذف")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            disabled={isDeleting}
                            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                          >
                            {t(locale, "Cancel", "إلغاء")}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => beginEdit(log)}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:border-lime-300 hover:text-lime-700"
                            aria-label={t(locale, "Edit", "تعديل")}
                          >
                            <Pencil className="size-3.5" />
                            {t(locale, "Edit", "تعديل")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(log.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            aria-label={t(locale, "Delete", "حذف")}
                          >
                            <Trash2 className="size-3.5" />
                            {t(locale, "Delete", "حذف")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  )
}

// ============================================================================
// Local presentational bits
// ============================================================================

function Kpi({
  icon, tone, label, value, hint,
}: {
  icon: React.ReactNode
  tone: "emerald" | "orange" | "lime" | "sky" | "violet"
  label: string
  value: string
  hint: string
}) {
  const toneCls: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    lime: "bg-lime-50 text-lime-700",
    sky: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
  }
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className={cn("inline-flex size-6 items-center justify-center rounded-full", toneCls[tone])}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
      </div>
      <p className="mt-2 text-lg font-black text-neutral-900 sm:text-xl">{value}</p>
      <p className="text-[11px] font-medium text-neutral-400">{hint}</p>
    </div>
  )
}

function NumberField({
  label, value, onChange, suffix, min, max, step = "0.1", required, autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  suffix?: string
  min?: number
  max?: number
  step?: string
  required?: boolean
  autoFocus?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>
      <div className="flex items-center rounded-xl border border-neutral-200 bg-white focus-within:border-lime-400 focus-within:ring-2 focus-within:ring-lime-100">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          required={required}
          autoFocus={autoFocus}
          className="w-full bg-transparent px-4 py-2.5 text-sm text-neutral-900 outline-none"
        />
        {suffix && <span className="pe-3 text-xs font-medium text-neutral-400">{suffix}</span>}
      </div>
    </div>
  )
}

function EmptyChart({ locale }: { locale: "en" | "ar" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 py-10 text-center">
      <Scale className="size-8 text-neutral-300" />
      <p className="text-sm font-semibold text-neutral-500">{t(locale, "No data yet", "لا توجد بيانات بعد")}</p>
      <p className="text-xs text-neutral-400">{t(locale, "Log your first weight below to start the trend.", "سجّل وزنك الأول بالأسفل لبدء الرسم البياني.")}</p>
    </div>
  )
}

function EmptyHistory({ locale }: { locale: "en" | "ar" }) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 py-8 text-center">
      <CalendarDays className="size-8 text-neutral-300" />
      <p className="text-sm font-semibold text-neutral-500">{t(locale, "No entries yet", "لا توجد سجلات بعد")}</p>
      <p className="text-xs text-neutral-400">{t(locale, "Your first weight entry will appear here.", "سيظهر سجل وزنك الأول هنا.")}</p>
    </div>
  )
}
