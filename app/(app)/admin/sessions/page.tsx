"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus, X, Loader2, Search, Calendar as CalendarIcon, MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import {
  adminFetchSessions,
  adminFetchClients,
  adminUpdateSessionStatus,
  adminCreateSession,
} from "@/lib/supabase/db"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

// Row shape returned by adminFetchSessions (matches the current DB helper output).
type Row = {
  id: string
  client: string
  type: string
  doctor: string
  date: string
  time: string
  status: string
}
type Client = { id: string; nameEn: string; nameAr: string }

const TYPES = [
  { v: "consultation", en: "Nutrition Consultation", ar: "استشارة تغذية" },
  { v: "body_sculpting", en: "Body Sculpting", ar: "نحت الجسم" },
  { v: "follow_up", en: "Follow-up", ar: "متابعة" },
  { v: "training", en: "Training", ar: "تدريب" },
]

const STATUS_CLS: Record<string, string> = {
  scheduled: "bg-emerald-50 text-emerald-700",
  completed: "bg-neutral-100 text-neutral-500",
  cancelled: "bg-red-50 text-red-500",
}

const STATUS_LABEL: Record<string, { en: string; ar: string }> = {
  scheduled: { en: "Scheduled", ar: "مجدولة" },
  completed: { en: "Completed", ar: "تمت" },
  cancelled: { en: "Cancelled", ar: "ملغاة" },
}

const emptyForm = () => ({
  userId: "",
  type: "consultation",
  doctorName: "Dr. Wael Mostafa",
  date: "",
  time: "",
  durationMinutes: 45,
  location: "clinic",
  notes: "",
})

export default function AdminSessionsPage() {
  const { locale } = useLocale()
  const { notify } = useToast()

  const [rows, setRows] = useState<Row[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal + form
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [clientSearch, setClientSearch] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  // Cancel-confirm state per row (keyed by row id).
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const [sessions, cls] = await Promise.all([adminFetchSessions(), adminFetchClients()])
      setRows(sessions as Row[])
      setClients(cls.map((c) => ({ id: c.id, nameEn: c.nameEn, nameAr: c.nameAr })))
    } catch {
      setError(t(locale, "Could not load sessions. Please try again.", "تعذّر تحميل الجلسات. يرجى المحاولة مرة أخرى."))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [locale])

  useEffect(() => {
    load(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((c) => c.nameEn.toLowerCase().includes(q) || c.nameAr.includes(clientSearch))
  }, [clients, clientSearch])

  const upcoming = useMemo(() => rows.filter((s) => s.status === "scheduled"), [rows])
  const past = useMemo(() => rows.filter((s) => s.status !== "scheduled"), [rows])

  function setStatus(id: string, v: string) {
    // If cancelling, require a confirm step first.
    if (v === "cancelled") {
      setConfirmCancelId(id)
      return
    }
    applyStatus(id, v)
  }

  async function applyStatus(id: string, v: string) {
    // Optimistic local flip; persist to DB after.
    const prev = rows.find((r) => r.id === id)?.status
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: v } : r)))
    try {
      const ok = await adminUpdateSessionStatus(id, v)
      if (!ok) throw new Error("db")
      notify(t(locale, "Status updated", "تم تحديث الحالة"), "success")
    } catch {
      // Revert on failure.
      setRows((rs) => rs.map((r) => (r.id === id && prev ? { ...r, status: prev } : r)))
      notify(t(locale, "Failed to update status", "فشل تحديث الحالة"), "error")
    } finally {
      setConfirmCancelId(null)
    }
  }

  function validate(): string | null {
    if (!form.userId) return t(locale, "Choose a client first.", "اختر عميلاً أولاً.")
    if (!form.date) return t(locale, "Choose a date.", "اختر تاريخاً.")
    if (!form.time) return t(locale, "Choose a time.", "اختر وقتاً.")
    if (!form.doctorName.trim()) return t(locale, "Enter the doctor's name.", "أدخل اسم الطبيب.")
    if (form.durationMinutes <= 0 || form.durationMinutes > 480)
      return t(locale, "Duration must be between 1 and 480 minutes.", "المدة يجب أن تكون بين 1 و 480 دقيقة.")
    return null
  }

  async function save() {
    const v = validate()
    if (v) { setFormError(v); return }
    setFormError(null)
    setSaving(true)
    const ok = await adminCreateSession(form)
    setSaving(false)
    if (ok) {
      notify(t(locale, "Session added", "تمت إضافة الجلسة"), "success")
      setOpen(false)
      setForm(emptyForm())
      setClientSearch("")
      load(false)
    } else {
      notify(t(locale, "Failed to add session", "فشل إضافة الجلسة"), "error")
    }
  }

  const inp = "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-600">{t(locale, "Sessions", "الجلسات")}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
              {t(locale, "Bookings & Sessions", "الحجوزات والجلسات")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => load(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60"
            >
              {refreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              {t(locale, "Refresh", "تحديث")}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(true); setFormError(null) }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <Plus className="size-4" />
              {t(locale, "Add session", "إضافة جلسة")}
            </button>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <SkeletonList />
        ) : error ? (
          <ErrorCard message={error} onRetry={() => load(true)} locale={locale} />
        ) : rows.length === 0 ? (
          <EmptyCard locale={locale} onAdd={() => setOpen(true)} />
        ) : (
          <>
            {upcoming.length > 0 && (
              <SectionList
                title={t(locale, "Upcoming", "القادمة")}
                rows={upcoming}
                locale={locale}
                onChangeStatus={setStatus}
                confirmCancelId={confirmCancelId}
                onCancelConfirm={(id) => applyStatus(id, "cancelled")}
                onCancelAbort={() => setConfirmCancelId(null)}
              />
            )}
            {past.length > 0 && (
              <SectionList
                title={t(locale, "Past", "السابقة")}
                rows={past}
                locale={locale}
                onChangeStatus={setStatus}
                confirmCancelId={confirmCancelId}
                onCancelConfirm={(id) => applyStatus(id, "cancelled")}
                onCancelAbort={() => setConfirmCancelId(null)}
              />
            )}
          </>
        )}
      </div>

      {/* Add session modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                {t(locale, "New Session", "جلسة جديدة")}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t(locale, "Close", "إغلاق")}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Client with search */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                  {t(locale, "Client", "العميل")}
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder={t(locale, "Search clients…", "ابحث عن العملاء…")}
                    className={cn(inp, "ps-9")}
                    aria-label={t(locale, "Search clients", "ابحث عن العملاء")}
                  />
                </div>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className={cn(inp, "mt-2")}
                  size={filteredClients.length > 4 ? 5 : filteredClients.length + 1}
                  aria-label={t(locale, "Choose client", "اختر العميل")}
                >
                  <option value="">{t(locale, "— select client —", "— اختر العميل —")}</option>
                  {filteredClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {locale === "ar" ? (c.nameAr || c.nameEn) : c.nameEn}
                    </option>
                  ))}
                </select>
                {filteredClients.length === 0 && clientSearch && (
                  <p className="mt-1 text-xs text-neutral-400">
                    {t(locale, "No matching clients.", "لا يوجد عملاء مطابقون.")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                    {t(locale, "Type", "النوع")}
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={inp}
                  >
                    {TYPES.map((ty) => (
                      <option key={ty.v} value={ty.v}>
                        {locale === "ar" ? ty.ar : ty.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                    {t(locale, "Location", "المكان")}
                  </label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className={inp}
                  >
                    <option value="clinic">{t(locale, "Clinic", "العيادة")}</option>
                    <option value="online">{t(locale, "Online", "أونلاين")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                    {t(locale, "Date", "التاريخ")}
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    min={new Date().toISOString().slice(0, 10)}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                    {t(locale, "Time", "الوقت")}
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                    {t(locale, "Duration", "المدة")}
                  </label>
                  <div className="flex items-center rounded-xl border border-neutral-200 bg-white focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                    <input
                      type="number"
                      min={1}
                      max={480}
                      step={5}
                      value={form.durationMinutes}
                      onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) || 0 })}
                      className="w-full bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none"
                    />
                    <span className="pe-3 text-xs font-medium text-neutral-400">
                      {t(locale, "min", "د")}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                    {t(locale, "Doctor", "الطبيب")}
                  </label>
                  <input
                    value={form.doctorName}
                    onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                    className={inp}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                  {t(locale, "Notes", "ملاحظات")}
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={inp}
                  placeholder={t(locale, "Optional preparation notes for the client…", "ملاحظات تحضير اختيارية للعميل…")}
                />
              </div>

              {formError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {formError}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                {t(locale, "Cancel", "إلغاء")}
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                {t(locale, "Add Session", "إضافة الجلسة")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function SectionList({
  title, rows, locale, onChangeStatus, confirmCancelId, onCancelConfirm, onCancelAbort,
}: {
  title: string
  rows: Row[]
  locale: "en" | "ar"
  onChangeStatus: (id: string, v: string) => void
  confirmCancelId: string | null
  onCancelConfirm: (id: string) => void
  onCancelAbort: () => void
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-400">{title}</h2>
      <div className="space-y-3">
        {rows.map((s) => (
          <SessionCard
            key={s.id}
            s={s}
            locale={locale}
            onChangeStatus={onChangeStatus}
            confirming={confirmCancelId === s.id}
            onCancelConfirm={onCancelConfirm}
            onCancelAbort={onCancelAbort}
          />
        ))}
      </div>
    </div>
  )
}

function SessionCard({
  s, locale, onChangeStatus, confirming, onCancelConfirm, onCancelAbort,
}: {
  s: Row
  locale: "en" | "ar"
  onChangeStatus: (id: string, v: string) => void
  confirming: boolean
  onCancelConfirm: (id: string) => void
  onCancelAbort: () => void
}) {
  const typeMeta = TYPES.find((t) => t.v === s.type)
  const typeLabel = typeMeta ? (locale === "ar" ? typeMeta.ar : typeMeta.en) : (s.type || "—")

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex size-14 flex-col items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <CalendarIcon className="size-4" aria-hidden />
          <span className="text-[10px] font-semibold">{(s.date || "").slice(5) || "—"}</span>
          <span className="text-xs font-bold">{s.time || "--"}</span>
        </div>
        <div>
          <p className="font-semibold text-neutral-900">{typeLabel}</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {s.client || t(locale, "Unknown client", "عميل غير معروف")} · {s.doctor || "—"}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400">
            <MapPin className="size-3" aria-hidden />
            {t(locale, "Clinic or online (see notes)", "عيادة أو أونلاين (راجع الملاحظات)")}
          </p>
        </div>
      </div>

      {confirming ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs">
          <AlertCircle className="size-3.5 text-red-600" aria-hidden />
          <span className="font-semibold text-red-700">{t(locale, "Cancel this session?", "إلغاء هذه الجلسة؟")}</span>
          <button
            type="button"
            onClick={() => onCancelConfirm(s.id)}
            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700"
          >
            {t(locale, "Yes, cancel", "نعم، إلغاء")}
          </button>
          <button
            type="button"
            onClick={onCancelAbort}
            className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            {t(locale, "Keep", "احتفظ")}
          </button>
        </div>
      ) : (
        <select
          value={s.status}
          onChange={(e) => onChangeStatus(s.id, e.target.value)}
          aria-label={t(locale, "Change status", "تغيير الحالة")}
          className={cn(
            "rounded-full border-0 px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200",
            STATUS_CLS[s.status] || "bg-neutral-100 text-neutral-500",
          )}
        >
          {(["scheduled", "completed", "cancelled"] as const).map((st) => (
            <option key={st} value={st}>
              {locale === "ar" ? STATUS_LABEL[st].ar : STATUS_LABEL[st].en}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

function EmptyCard({ locale, onAdd }: { locale: "en" | "ar"; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center shadow-sm">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CalendarIcon className="size-7" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-neutral-900">
        {t(locale, "No sessions yet", "لا توجد جلسات بعد")}
      </h2>
      <p className="mt-1 max-w-md text-sm text-neutral-500">
        {t(
          locale,
          "Book the first session for a client. Choose the type, date, doctor, and location.",
          "احجز أول جلسة لعميل. اختر النوع، التاريخ، الطبيب، والمكان.",
        )}
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      >
        <Plus className="size-4" />
        {t(locale, "Add session", "إضافة جلسة")}
      </button>
    </div>
  )
}

function ErrorCard({ message, onRetry, locale }: { message: string; onRetry: () => void; locale: "en" | "ar" }) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle className="size-6" aria-hidden />
      </div>
      <h2 className="text-lg font-bold text-red-700">{t(locale, "Could not load sessions", "تعذّر تحميل الجلسات")}</h2>
      <p className="mt-2 text-sm text-neutral-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      >
        <RefreshCw className="size-4" />
        {t(locale, "Try again", "إعادة المحاولة")}
      </button>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
      ))}
    </div>
  )
}
