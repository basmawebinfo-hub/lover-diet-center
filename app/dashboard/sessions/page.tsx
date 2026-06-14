"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Video, MapPin, Check, X, Plus } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import type { Session } from "@/lib/types"
import { cn } from "@/lib/utils"

const TYPE_EMOJI: Record<Session["type"], string> = {
  consultation: "🩺",
  body_sculpting: "💆",
  follow_up: "📋",
  training: "🏋️",
}

export default function SessionsPage() {
  const router = useRouter()
  const { state, addSession } = useApp()
  const user = state.user
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState({
    type: "consultation" as Session["type"],
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
            <h1 className="text-3xl font-bold text-neutral-900">My Sessions</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Book and manage your appointments with Dr. Wael Mostafa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-lime-800"
          >
            <Plus className="size-4" />
            Book new
          </button>
        </header>

        {showForm && (
          <section className="rounded-3xl border border-lime-200 bg-lime-50/50 p-6">
            <h2 className="font-bold text-neutral-900">Book a new session</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Type">
                <select
                  value={draft.type}
                  onChange={(e) =>
                    setDraft({ ...draft, type: e.target.value as Session["type"] })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="consultation">Consultation</option>
                  <option value="body_sculpting">Body Sculpting</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="training">Training</option>
                </select>
              </Field>
              <Field label="Location">
                <select
                  value={draft.location}
                  onChange={(e) =>
                    setDraft({ ...draft, location: e.target.value as Session["location"] })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="clinic">In-clinic</option>
                  <option value="online">Online</option>
                </select>
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Time">
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
                Confirm booking
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600"
              >
                Cancel
              </button>
            </div>
          </section>
        )}

        {/* Upcoming */}
        <section>
          <h2 className="text-lg font-bold text-neutral-900">
            Upcoming ({upcoming.length})
          </h2>
          <div className="mt-3 space-y-3">
            {upcoming.length === 0 && (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
                No upcoming sessions.
              </p>
            )}
            {upcoming.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-neutral-900">Past</h2>
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

function SessionCard({ session, past }: { session: Session; past?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-2xl border bg-white p-4",
        past ? "border-neutral-100 opacity-80" : "border-lime-100"
      )}
    >
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-lime-50 text-lime-700">
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {new Date(session.date).toLocaleDateString("en-GB", { month: "short" })}
        </span>
        <span className="text-lg font-bold leading-none">
          {new Date(session.date).getDate()}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{TYPE_EMOJI[session.type]}</span>
          <p className="font-semibold text-neutral-900">{session.typeEn}</p>
          {session.status === "completed" && (
            <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-semibold text-lime-700">
              Done
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500">{session.typeAr}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {session.time} · {session.durationMinutes}m
          </span>
          <span className="inline-flex items-center gap-1">
            {session.location === "online" ? (
              <>
                <Video className="size-3.5" />
                Online
              </>
            ) : (
              <>
                <MapPin className="size-3.5" />
                Clinic
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
            Note: {session.notes}
          </p>
        )}
      </div>
      {!past && (
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="rounded-lg bg-lime-50 px-2.5 py-1.5 text-xs font-semibold text-lime-700 hover:bg-lime-100"
          >
            Reschedule
          </button>
          <button
            type="button"
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-red-50 hover:text-red-500"
          >
            Cancel
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
