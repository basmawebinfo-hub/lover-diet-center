"use client"

import { useEffect, useState } from "react"
import { Plus, X, Calendar, Loader2 } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { adminFetchSessions, adminFetchClients, adminUpdateSessionStatus, adminCreateSession } from "@/lib/supabase/db"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

type Row = { id: string; client: string; type: string; doctor: string; date: string; time: string; status: string }
type Client = { id: string; nameEn: string; nameAr: string }

const TYPES = [
  { v: "consultation", en: "Nutrition Consultation", ar: "استشارة تغذية" },
  { v: "body_sculpting", en: "Body Sculpting", ar: "نحت الجسم" },
  { v: "follow_up", en: "Follow-up", ar: "متابعة" },
  { v: "training", en: "Training", ar: "تدريب" },
]

const cls: Record<string, string> = { scheduled: "bg-emerald-50 text-emerald-700", completed: "bg-neutral-100 text-neutral-500", cancelled: "bg-red-50 text-red-500" }

export default function AdminSessionsPage() {
  const { locale } = useLocale()
  const { notify } = useToast()
  const [rows, setRows] = useState<Row[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    userId: "", type: "consultation", doctorName: "Dr. Wael Mostafa",
    date: "", time: "", durationMinutes: 45, location: "clinic", notes: "",
  })

  const load = () => adminFetchSessions().then((s) => { setRows(s as Row[]); setLoaded(true) })
  useEffect(() => { load() }, [])
  useEffect(() => { adminFetchClients().then((c) => setClients(c.map((x) => ({ id: x.id, nameEn: x.nameEn, nameAr: x.nameAr })))) }, [])

  function setStatus(id: string, v: string) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: v } : r))
    adminUpdateSessionStatus(id, v).catch(() => {})
  }

  async function save() {
    if (!form.userId) { notify(t(locale, "Choose a client first.", "اختر عميلاً أولاً."), "error"); return }
    setSaving(true)
    const ok = await adminCreateSession(form)
    setSaving(false)
    if (ok) { notify(t(locale, "Session added", "تمت إضافة الجلسة"), "success"); setOpen(false); setForm({ ...form, userId: "", date: "", time: "", notes: "" }); load() }
    else notify(t(locale, "Failed to add session", "فشل إضافة الجلسة"), "error")
  }

  const upcoming = rows.filter((s) => s.status === "scheduled")
  const past = rows.filter((s) => s.status !== "scheduled")
  const inp = "w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none"

  const Card = ({ s }: { s: Row }) => (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex size-12 flex-col items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <span className="text-xs font-medium">{(s.date || "").slice(5)}</span>
          <span className="text-sm font-bold">{s.time || "--"}</span>
        </div>
        <div>
          <p className="font-semibold text-neutral-900">{s.type || "—"}</p>
          <p className="text-xs text-neutral-400">{s.client} · {s.doctor}</p>
        </div>
      </div>
      <select value={s.status} onChange={(e) => setStatus(s.id, e.target.value)} className={cn("rounded-full border-0 px-2.5 py-1 text-xs font-bold focus:outline-none", cls[s.status] || "bg-neutral-100 text-neutral-500")}>
        {["scheduled", "completed", "cancelled"].map((st) => <option key={st} value={st}>{st}</option>)}
      </select>
    </div>
  )

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">{t(locale, "Sessions", "الجلسات")}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale, "Bookings & Sessions", "الحجوزات والجلسات")}</h1>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><Plus className="size-4" /> {t(locale, "Add session", "إضافة جلسة")}</button>
        </div>

        {loaded && rows.length === 0 && (
          <div className="rounded-3xl border border-neutral-100 bg-white py-12 text-center text-sm text-neutral-400 shadow-sm">{t(locale, "No sessions yet. Add the first booking.", "لا توجد جلسات بعد. أضف أول حجز.")}</div>
        )}

        {upcoming.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-400">{t(locale, "Upcoming", "القادمة")}</h2>
            <div className="space-y-3">{upcoming.map((s) => <Card key={s.id} s={s} />)}</div>
          </div>
        )}
        {past.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-400">{t(locale, "Past", "السابقة")}</h2>
            <div className="space-y-3">{past.map((s) => <Card key={s.id} s={s} />)}</div>
          </div>
        )}
      </div>

      {/* Add session modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "New Session", "جلسة جديدة")}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-50"><X className="size-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Client", "العميل")}</label>
                <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className={inp}>
                  <option value="">{t(locale, "— select client —", "— اختر العميل —")}</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{locale === "ar" ? (c.nameAr || c.nameEn) : c.nameEn}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Type", "النوع")}</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inp}>
                    {TYPES.map((ty) => <option key={ty.v} value={ty.v}>{locale === "ar" ? ty.ar : ty.en}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Location", "المكان")}</label>
                  <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inp}>
                    <option value="clinic">{t(locale, "Clinic", "العيادة")}</option>
                    <option value="online">{t(locale, "Online", "أونلاين")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Date", "التاريخ")}</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Time", "الوقت")}</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inp} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Doctor", "الطبيب")}</label>
                <input value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Notes", "ملاحظات")}</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inp} />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50">{t(locale, "Cancel", "إلغاء")}</button>
              <button onClick={save} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">{saving && <Loader2 className="size-4 animate-spin" />} {t(locale, "Add Session", "إضافة الجلسة")}</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
