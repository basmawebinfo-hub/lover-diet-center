"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, Clock, Video, MapPin, Check, X, Plus } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import type { Session } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

const TYPE_EMOJI: Record<Session["type"], string> = {
  consultation: "🩺",
  body_sculpting: "💆",
  follow_up: "📋",
  training: "🏋️",
}

function SessionsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useLocale()
  const { notify } = useToast()
  const { state, addSession, updateSession } = useApp()
  const user = state.user
  const initialType = (searchParams.get("type") as Session["type"]) || "consultation"
  const autoBook = searchParams.get("book") === "1"
  const [showForm, setShowForm] = useState(autoBook)
  const [draft, setDraft] = useState({
    type: initialType,
    date: "",
    time: "10:00",
    location: "clinic" as Session["location"],
  })

  useEffect(() => {
    if (!user) router.replace("/onboarding")
  }, [user, router])

  if (!user) return null

  const upcoming = state.sessions
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => (a.date < b.date ? -1 : 1))
  const past = state.sessions
    .filter((s) => s.status !== "scheduled")
    .sort((a, b) => (a.date > b.date ? -1 : 1))

  function book() {
    if (!draft.date) return
    const typeMap: Record<Session["type"], { en: string; ar: string }> = {
      consultation: { en: "Nutrition Consultation", ar: "استشارة تغذية" },
      body_sculpting: { en: "Body Sculpting Session", ar: "جلسة نحت الجسم" },
      follow_up: { en: "Follow-up Check", ar: "متابعة" },
      training: { en: "Training Course", ar: "دورة تدريبية" },
    }
    addSession({
      id: `s_${Date.now()}`,
      type: draft.type,
      typeEn: typeMap[draft.type].en,
      typeAr: typeMap[draft.type].ar,
      doctorName: "Dr. Wael Mostafa",
      date: draft.date,
      time: draft.time,
      durationMinutes: 45,
      status: "scheduled",
      location: draft.location,
    })
    setShowForm(false)
    setDraft({ type: "consultation", date: "", time: "10:00", location: "clinic" })
  }

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{t(locale,"My Sessions","جلساتي")}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {t(locale,"Book and manage your appointments with Dr. Wael Mostafa.","احجز وأدر مواعيدك مع الدكتور وائل مصطفى.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-lime-800"
          >
            <Plus className="size-4" />
            {t(locale,"Book new","حجز جديد")}
          </button>
        </header>

        {showForm && (
          <section className="rounded-3xl border border-lime-200 bg-lime-50/50 p-6">
            <h2 className="font-bold text-neutral-900">{t(locale,"Book a new session","حجز جلسة جديدة")}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t(locale,"Type","النوع")}>
                <select
                  value={draft.type}
                  onChange={(e) =>
                    setDraft({ ...draft, type: e.target.value as Session["type"] })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="consultation">{t(locale,"Consultation","استشارة")}</option>
                  <option value="body_sculpting">{t(locale,"Body Sculpting","نحت الجسم")}</option>
                  <option value="follow_up">{t(locale,"Follow-up","متابعة")}</option>
                  <option value="training">{t(locale,"Training","تدريب")}</option>
                </select>
              </Field>
              <Field label={t(locale,"Location","المكان")}>
                <select
                  value={draft.location}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value as Session["location"] })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="clinic">{t(locale,"In-clinic","في العيادة")}</option>
                  <option value="online">{t(locale,"Online","عبر الإنترنت")}</option>
                </select>
              </Field>
              <Field label={t(locale,"Date","التاريخ")}>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
              </Field>
              <Field label={t(locale,"Time","الوقت")}>
                <input
                  type="time"
                  value={draft.time}
                  onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
              </Field>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={book}
                disabled={!draft.date}
                className="rounded-xl bg-lime-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-lime-800 disabled:opacity-50"
              >
                {t(locale,"Confirm booking","تأكيد الحجز")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600"
              >
                {t(locale,"Cancel","إلغاء")}
              </button>
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section>
          <h2 className="text-lg font-bold text-neutral-900">
            {t(locale,"Upcoming","القادمة")} ({upcoming.length})
          </h2>
          <div className="mt-3 space-y-3">
            {upcoming.length === 0 && (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
                {t(locale,"No upcoming sessions.","لا جلسات قادمة.")}
              </p>
            )}
            {upcoming.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onCancel={(id) => {
                  if (confirm(t(locale, "Cancel this session?", "إلغاء هذه الجلسة؟"))) {
                    updateSession(id, { status: "cancelled" })
                    notify(t(locale, "Session cancelled", "تم إلغاء الجلسة"), "success")
                  }
                }}
              />
            ))}
          </div>
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-neutral-900">{t(locale,"Past","السابقة")}</h2>
            <div className="mt-3 space-y-3">
              {past.map((session) => (
                <SessionCard key={session.id} session={session} past />
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  )
}

function SessionCard({ session, past, onCancel }: { session: Session; past?: boolean; onCancel?: (id: string) => void }) {
  const { locale } = useLocale()
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border bg-white p-4",
        past ? "border-neutral-100 opacity-80" : "border-lime-100"
      )}
    >
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-lime-50 text-lime-700">
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {new Date(session.date).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { month: "short" })}
        </span>
        <span className="text-lg font-bold leading-none">
          {new Date(session.date).getDate()}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{TYPE_EMOJI[session.type]}</span>
          <p className="font-semibold text-neutral-900">{locale === "ar" ? session.typeAr : session.typeEn}</p>
          {session.status === "completed" && (
            <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-semibold text-lime-700">
              {t(locale,"Done","تمت")}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {session.time} · {session.durationMinutes}{t(locale,"m","د")}
          </span>
          <span className="inline-flex items-center gap-1">
            {session.location === "online" ? (
              <>
                <Video className="size-3.5" />
                {t(locale,"Online","عبر الإنترنت")}
              </>
            ) : (
              <>
                <MapPin className="size-3.5" />
                {t(locale,"Clinic","العيادة")}
              </>
            )}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {session.doctorName}
          </span>
        </div>
        {session.notes && (
          <p className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
            {t(locale,"Note","ملاحظة")}: {session.notes}
          </p>
        )}
      </div>
      {!past && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onCancel?.(session.id)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-red-50 hover:text-red-500"
          >
            {t(locale,"Cancel","إلغاء")}
          </button>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

export default function SessionsPage() {
  return (
    <Suspense fallback={null}>
      <SessionsInner />
    </Suspense>
  )
}
