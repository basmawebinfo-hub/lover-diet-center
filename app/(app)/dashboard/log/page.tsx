"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Camera, Loader2, Check, AlertCircle, RotateCcw, Flame, Beef } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, PageHeader, EmptyState } from "@/components/ui/kit"
import { useApp } from "@/lib/store"
import { useLocale, t } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import {
  fetchFoodLogs,
  signedPhotoUrl,
  dayTotals,
  localDay,
  isReviewed,
  hasNumbers,
  type FoodLog,
  type MealType,
} from "@/lib/food-log"

const MEAL_TYPES: { id: MealType; en: string; ar: string }[] = [
  { id: "breakfast", en: "Breakfast", ar: "فطار" },
  { id: "lunch", en: "Lunch", ar: "غداء" },
  { id: "dinner", en: "Dinner", ar: "عشاء" },
  { id: "snack", en: "Snack", ar: "سناك" },
]

type Stage = "idle" | "uploading" | "analyzing" | "done" | "error"

export default function LogMealPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { notify } = useToast()
  const { state } = useApp()
  const user = state.user

  const fileRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>("idle")
  const [mealType, setMealType] = useState<MealType>("lunch")
  const [logs, setLogs] = useState<FoodLog[] | null>(null)
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const [errorMsg, setErrorMsg] = useState("")

  const today = localDay()

  const load = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const rows = await fetchFoodLogs(supabase, user.id, today)
    setLogs(rows)

    // Signed URLs are short-lived by design, so they are fetched per view
    // rather than stored anywhere.
    const urls: Record<string, string> = {}
    await Promise.all(
      rows.map(async (r) => {
        const u = await signedPhotoUrl(supabase, r.photoPath)
        if (u) urls[r.id] = u
      }),
    )
    setPhotoUrls(urls)
  }, [user, today])

  useEffect(() => {
    void load()
  }, [load])

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // let the same photo be picked again after a failure
    if (!file || !user) return

    if (!file.type.startsWith("image/")) {
      notify(t(locale, "Please choose a photo.", "اختار صورة من فضلك."), "error")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      notify(t(locale, "Photo must be under 8 MB.", "الصورة لازم تكون أقل من 8 ميجا."), "error")
      return
    }

    setStage("uploading")
    setErrorMsg("")
    const supabase = createClient()

    // Path must start with the user id — the storage policy keys on that
    // first segment to decide who may read and write the file.
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from("food-photos")
      .upload(path, file, { cacheControl: "3600", upsert: false })

    if (upErr) {
      setStage("error")
      setErrorMsg(t(locale, "Could not upload the photo.", "تعذّر رفع الصورة."))
      return
    }

    const { data: inserted, error: insErr } = await supabase
      .from("food_logs")
      .insert({ user_id: user.id, photo_path: path, logged_on: today, meal_type: mealType })
      .select("id")
      .single()

    if (insErr || !inserted) {
      setStage("error")
      setErrorMsg(t(locale, "Could not save the meal.", "تعذّر حفظ الوجبة."))
      return
    }

    // The row exists with the photo now, so the meal is logged even if the
    // estimate fails. That ordering is deliberate: never lose the photo
    // because a model call went wrong.
    setStage("analyzing")
    await load()

    try {
      const res = await fetch("/api/food/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId: (inserted as { id: string }).id }),
        cache: "no-store",
      })

      if (res.status === 429) {
        const b = await res.json().catch(() => ({}))
        setStage("error")
        setErrorMsg(
          t(
            locale,
            `Daily limit reached (${b.limit ?? ""} photos). The meal is saved without an estimate.`,
            `وصلت الحد اليومي (${b.limit ?? ""} صور). الوجبة اتسجّلت من غير تقدير.`,
          ),
        )
        await load()
        return
      }
      if (!res.ok) throw new Error(String(res.status))

      setStage("done")
      notify(t(locale, "Meal logged", "الوجبة اتسجّلت"), "success")
    } catch {
      setStage("error")
      setErrorMsg(
        t(
          locale,
          "Saved, but we could not estimate it. The clinic will review the photo.",
          "اتحفظت، بس تعذّر تقديرها. العيادة هتراجع الصورة.",
        ),
      )
    } finally {
      await load()
    }
  }

  if (!user) return null

  const totals = logs ? dayTotals(logs) : null
  const target = state.doctorPlan?.dailyCalories ?? 0
  const busy = stage === "uploading" || stage === "analyzing"

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-5">
        <PageHeader
          title={t(locale, "Log a meal", "سجّل وجبة")}
          subtitle={t(
            locale,
            "Take a photo — we estimate it, and the clinic checks it.",
            "صوّر وجبتك — بنقدّرها، والعيادة بتراجعها.",
          )}
        />

        {/* Capture */}
        <Card className="text-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPick}
            className="hidden"
          />

          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {MEAL_TYPES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMealType(m.id)}
                aria-pressed={mealType === m.id}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-colors ${
                  mealType === m.id
                    ? "bg-[#4d7c0f] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {locale === "ar" ? m.ar : m.en}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="mx-auto flex size-24 items-center justify-center rounded-full bg-[#4d7c0f] text-white shadow-lg shadow-[#4d7c0f]/30 transition-transform active:scale-95 disabled:opacity-70"
          >
            {busy ? <Loader2 className="size-9 animate-spin" /> : <Camera className="size-9" />}
          </button>

          <p className="mt-4 text-sm font-semibold text-neutral-700">
            {stage === "uploading" && t(locale, "Uploading…", "بيترفع…")}
            {stage === "analyzing" && t(locale, "Estimating…", "بنقدّر الوجبة…")}
            {stage === "idle" && t(locale, "Tap to take a photo", "دوس عشان تصوّر")}
            {stage === "done" && t(locale, "Done — logged below", "تمام — اتسجّلت تحت")}
            {stage === "error" && t(locale, "Something went wrong", "حصلت مشكلة")}
          </p>

          {errorMsg && (
            <p className="mx-auto mt-2 flex max-w-sm items-start justify-center gap-1.5 text-sm text-amber-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {errorMsg}
            </p>
          )}
        </Card>

        {/* Day totals */}
        {totals && totals.counted > 0 && (
          <Card>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-bold text-neutral-900">
                {t(locale, "Today so far", "اليوم لحد دلوقتي")}
              </p>
              <p className="text-sm text-neutral-400">
                {totals.counted} {t(locale, "meals", "وجبات")}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                { v: totals.calories, l: t(locale, "kcal", "سعرة") },
                { v: `${totals.protein}g`, l: t(locale, "protein", "بروتين") },
                { v: `${totals.carbs}g`, l: t(locale, "carbs", "كارب") },
                { v: `${totals.fat}g`, l: t(locale, "fat", "دهون") },
              ].map((x, i) => (
                <div key={i} className="rounded-2xl bg-neutral-50 py-3">
                  <p className="text-lg font-extrabold tabular-nums text-neutral-900">{x.v}</p>
                  <p className="text-xs text-neutral-400">{x.l}</p>
                </div>
              ))}
            </div>
            {target > 0 && (
              <p className="mt-3 text-center text-xs text-neutral-400">
                {t(locale, "of", "من")} {target} {t(locale, "kcal target", "سعرة مستهدفة")}
              </p>
            )}
          </Card>
        )}

        {/* Today's meals */}
        <div className="space-y-3">
          {logs === null ? (
            <Card className="py-10 text-center text-sm text-neutral-400">
              {t(locale, "Loading…", "جارٍ التحميل…")}
            </Card>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={<Camera className="size-5" />}
              title={t(locale, "No meals logged today", "مفيش وجبات اتسجّلت النهاردة")}
              description={t(
                locale,
                "Photograph what you eat and your dietitian sees it with your plan.",
                "صوّر اللي بتاكله وأخصائيك يشوفه مع خطتك.",
              )}
            />
          ) : (
            logs.map((l) => (
              <Card key={l.id} padded={false} className="flex gap-3 p-3">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                  {photoUrls[l.id] ? (
                    <Image
                      src={photoUrls[l.id]}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-neutral-900">
                      {locale === "ar"
                        ? MEAL_TYPES.find((m) => m.id === l.mealType)?.ar
                        : MEAL_TYPES.find((m) => m.id === l.mealType)?.en}
                    </p>
                    {/* The estimate/reviewed distinction is the whole point —
                        a licensed clinic cannot let a model's guess read as a
                        clinician's number. */}
                    {isReviewed(l) ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <Check className="size-3" />
                        {t(locale, "Reviewed", "مراجعة")}
                      </span>
                    ) : l.status === "failed" ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        {t(locale, "Not estimated", "من غير تقدير")}
                      </span>
                    ) : l.status === "analyzing" ? (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500">
                        {t(locale, "Estimating…", "بنقدّر…")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500">
                        {t(locale, "Estimate", "تقدير")}
                      </span>
                    )}
                  </div>

                  {l.detectedItems && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{l.detectedItems}</p>
                  )}

                  {hasNumbers(l) && (
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="inline-flex items-center gap-1 font-bold text-[#4d7c0f]">
                        <Flame className="size-3.5" /> {l.calories} {t(locale, "kcal", "سعرة")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-neutral-500">
                        <Beef className="size-3.5" /> {l.proteinG}g
                      </span>
                      {l.confidence !== null && l.confidence < 0.5 && !isReviewed(l) && (
                        <span className="text-amber-600">
                          {t(locale, "low confidence", "تقدير غير مؤكد")}
                        </span>
                      )}
                    </div>
                  )}

                  {l.reviewerNote && (
                    <p className="mt-1.5 text-xs text-emerald-700">{l.reviewerNote}</p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => router.refresh()}
          className="mx-auto flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-neutral-500 hover:bg-neutral-100"
        >
          <RotateCcw className="size-4" />
          {t(locale, "Refresh", "تحديث")}
        </button>
      </div>
    </DashboardShell>
  )
}
