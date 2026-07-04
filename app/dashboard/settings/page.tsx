"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Save, User as UserIcon, Target, ShieldCheck, Camera, Loader2, KeyRound, Sliders, Eye, EyeOff } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { TransformationSlider } from "@/components/dashboard/transformation-slider"
import { useApp } from "@/lib/store"
import { analyzeUser, buildAvatarConfig, idealWeightKg } from "@/lib/analysis"
import type { ActivityLevel, Gender, GoalType, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"
import { useCurrency, CURRENCIES } from "@/lib/currency"
import { createClient } from "@/lib/supabase/client"
import { upsertProfile, uploadUserAvatar } from "@/lib/supabase/db"

const goalCopy: Record<GoalType, { en: string; ar: string; icon: string }> = {
  lose_weight: { en: "Lose Weight", ar: "إنقاص الوزن", icon: "🔥" },
  tone: { en: "Tone & Sculpt", ar: "شد ونحت", icon: "💎" },
  gain_muscle: { en: "Build Muscle", ar: "بناء العضلات", icon: "💪" },
  maintain: { en: "Stay Healthy", ar: "الحفاظ على الصحة", icon: "⚖️" },
}

const activityCopy: Record<ActivityLevel, { en: string; ar: string }> = {
  sedentary: { en: "Sedentary", ar: "خامل" },
  light: { en: "Light", ar: "خفيف" },
  moderate: { en: "Moderate", ar: "متوسط" },
  active: { en: "Active", ar: "نشط" },
  very_active: { en: "Very Active", ar: "نشط جداً" },
}

type Tab = "profile" | "goal" | "account"

export default function SettingsPage() {
  const router = useRouter()
  const { locale, setLocale } = useLocale()
  const { notify } = useToast()
  const { currency, setCurrency } = useCurrency()
  const { state, setUser, resetOnboarding } = useApp()
  const user = state.user

  const [tab, setTab] = useState<Tab>("profile")
  const [draft, setDraft] = useState<User | null>(user)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (state.authChecked && !user) router.replace("/onboarding")
  }, [state.authChecked, user, router])

  useEffect(() => { setDraft(user) }, [user])

  if (!user || !draft) return null

  const set = <K extends keyof User>(k: K, v: User[K]) => {
    setDraft((p) => (p ? { ...p, [k]: v } : p))
    setDirty(true)
  }

  const analysis = analyzeUser({
    age: draft.age, gender: draft.gender, heightCm: draft.heightCm,
    startWeightKg: draft.startWeightKg, currentWeightKg: draft.currentWeightKg,
    goal: draft.goal, activityLevel: draft.activityLevel,
  }, locale)

  const targetWeight = idealWeightKg(draft.heightCm, draft.gender)

  async function save() {
    if (!draft) return
    setSaving(true)
    const nextAvatar = buildAvatarConfig({
      gender: draft.gender, heightCm: draft.heightCm,
      currentWeightKg: draft.currentWeightKg, startWeightKg: draft.startWeightKg, goal: draft.goal,
    }, state.weightLogs)
    const updated = { ...draft, avatarConfig: nextAvatar }
    // Persist to Supabase first; only mirror to local store on success.
    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    let ok = true
    if (authData.user) {
      ok = await upsertProfile(authData.user.id, updated)
    }
    setSaving(false)
    if (!ok) {
      notify(t(locale, "Save failed — please try again.", "فشل الحفظ — يرجى المحاولة مرة أخرى."), "error")
      return
    }
    setUser(updated)
    setDirty(false)
    notify(t(locale, "Changes saved", "تم حفظ التغييرات"), "success")
  }

  const initials = (draft.nameEn || "U").trim().charAt(0).toUpperCase()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Client-side guard mirroring the storage bucket policy (10 MB, image MIME).
    if (!file.type.startsWith("image/")) {
      notify(t(locale, "Only image files are allowed.", "يُسمح بملفات الصور فقط."), "error")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      notify(t(locale, "Image must be under 10 MB.", "الصورة يجب أن تكون أقل من 10 ميغابايت."), "error")
      return
    }
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) { notify(t(locale, "Please sign in again.", "يرجى تسجيل الدخول مجدداً."), "error"); return }
    setUploadingPhoto(true)
    const url = await uploadUserAvatar(data.user.id, file)
    setUploadingPhoto(false)
    if (url) {
      setDraft((p) => (p ? { ...p, avatarUrl: url } : p))
      if (state.user) setUser({ ...state.user, avatarUrl: url })
      notify(t(locale, "Photo updated", "تم تحديث الصورة"), "success")
    } else {
      notify(t(locale, "Upload failed. Try a smaller image.", "فشل الرفع. جرّب صورة أصغر."), "error")
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof UserIcon }[] = [
    { id: "profile", label: t(locale, "Profile", "الملف"), icon: UserIcon },
    { id: "goal", label: t(locale, "Goal & Body", "الهدف والجسم"), icon: Target },
    { id: "account", label: t(locale, "Account", "الحساب"), icon: ShieldCheck },
  ]

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-5xl space-y-6 pb-28 lg:pb-0">

        {/* Profile header (no banner) */}
        <section className="flex flex-col gap-4 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="relative size-20 overflow-hidden rounded-3xl bg-gradient-to-br from-lime-100 to-lime-50 shadow-sm ring-1 ring-lime-100">
                {draft.avatarUrl ? (
                  <Image src={draft.avatarUrl} alt={draft.nameEn || ""} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-3xl font-black text-lime-700">{initials}</div>
                )}
                {uploadingPhoto && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Loader2 className="size-5 animate-spin text-white" /></div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-lime-600 text-white shadow ring-2 ring-white transition hover:bg-lime-700 disabled:opacity-60 rtl:left-0 rtl:right-auto"
                aria-label={t(locale, "Change photo", "تغيير الصورة")}
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">{draft.nameEn}</h1>
              <p className="text-sm text-neutral-500">{draft.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold transition",
              dirty && !saving
                ? "bg-lime-700 text-white shadow-sm hover:bg-lime-800"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400"
            )}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? t(locale, "Saving...", "جارٍ الحفظ...") : dirty ? t(locale, "Save changes", "حفظ التغييرات") : t(locale, "Saved", "محفوظ")}
          </button>
        </section>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1.5">
          {tabs.map((tb) => {
            const Icon = tb.icon
            const active = tab === tb.id
            return (
              <button
                key={tb.id}
                type="button"
                onClick={() => setTab(tb.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                  active ? "bg-lime-50 text-lime-700" : "text-neutral-500 hover:bg-neutral-50"
                )}
              >
                <Icon className="size-4" />
                {tb.label}
              </button>
            )
          })}
        </div>

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <section className="space-y-4">
            <div className="rounded-3xl border border-neutral-100 bg-white p-6">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Personal info", "المعلومات الشخصية")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FieldText label={t(locale, "Full name", "الاسم الكامل")} value={draft.nameEn} onChange={(v) => set("nameEn", v)} />
                <FieldText label={t(locale, "Email", "البريد الإلكتروني")} value={draft.email} onChange={(v) => set("email", v)} type="email" />
                <FieldText label={t(locale, "Phone", "رقم الهاتف")} value={draft.phone ?? ""} onChange={(v) => set("phone", v)} type="tel" />
                <FieldNumber label={t(locale, "Age", "العمر")} value={draft.age} onChange={(v) => set("age", v)} suffix={t(locale, "years", "سنة")} />
                <FieldNumber label={t(locale, "Height", "الطول")} value={draft.heightCm} onChange={(v) => set("heightCm", v)} suffix={t(locale, "cm", "سم")} />
                <FieldNumber label={t(locale, "Current weight", "الوزن الحالي")} value={draft.currentWeightKg} onChange={(v) => set("currentWeightKg", v)} suffix={t(locale, "kg", "كجم")} />
              </div>

              {/* Gender selector */}
              <p className="mt-6 mb-2 text-sm font-semibold text-neutral-700">{t(locale, "Gender", "الجنس")}</p>
              <div className="grid max-w-sm grid-cols-2 gap-3">
                {([
                  { v: "male" as Gender, en: "Male", ar: "رجل", icon: "👨" },
                  { v: "female" as Gender, en: "Female", ar: "امرأة", icon: "👩" },
                ]).map((g) => {
                  const active = draft.gender === g.v
                  return (
                    <button
                      key={g.v}
                      type="button"
                      onClick={() => set("gender", g.v)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-2xl border-2 p-3.5 text-sm font-semibold transition",
                        active ? "border-lime-500 bg-lime-50 text-lime-700" : "border-neutral-200 text-neutral-600 hover:border-lime-300"
                      )}
                    >
                      <span className="text-xl">{g.icon}</span>
                      {locale === "ar" ? g.ar : g.en}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* GOAL & BODY TAB */}
        {tab === "goal" && (
          <section className="space-y-4">
            {/* Avatar transformation */}
            <div className="rounded-3xl border border-neutral-100 bg-white p-6">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Your transformation", "تحوّلك")}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t(locale, "This is you at the start, now, and at your goal weight.", "هذا أنت في البداية، والآن، وعند وزنك المستهدف.")}</p>
              <div className="mt-6">
                <TransformationSlider
                  gender={draft.gender}
                  heightCm={draft.heightCm}
                  startWeightKg={draft.startWeightKg}
                  currentWeightKg={draft.currentWeightKg}
                  goalWeightKg={targetWeight}
                />
              </div>
            </div>

            {/* Goal selector */}
            <div className="rounded-3xl border border-neutral-100 bg-white p-6">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Primary goal", "الهدف الأساسي")}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(Object.keys(goalCopy) as GoalType[]).map((g) => {
                  const active = draft.goal === g
                  return (
                    <button key={g} type="button" onClick={() => set("goal", g)}
                      className={cn("flex items-center gap-3 rounded-2xl border-2 p-4 text-start transition", active ? "border-lime-500 bg-lime-50" : "border-neutral-200 hover:border-lime-300")}>
                      <span className="text-2xl">{goalCopy[g].icon}</span>
                      <span className="font-semibold text-neutral-900">{locale === "ar" ? goalCopy[g].ar : goalCopy[g].en}</span>
                    </button>
                  )
                })}
              </div>

              <p className="mt-6 mb-2 text-sm font-semibold text-neutral-700">{t(locale, "Activity level", "مستوى النشاط")}</p>
              <select value={draft.activityLevel} onChange={(e) => set("activityLevel", e.target.value as ActivityLevel)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-900 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-100">
                {(Object.keys(activityCopy) as ActivityLevel[]).map((a) => (
                  <option key={a} value={a}>{locale === "ar" ? activityCopy[a].ar : activityCopy[a].en}</option>
                ))}
              </select>

              <div className="mt-4">
                <FieldNumber label={t(locale, "Target weight", "الوزن المستهدف")} value={draft.targetWeightKg} onChange={(v) => set("targetWeightKg", v)} suffix={t(locale, "kg", "كجم")} />
              </div>
            </div>

            {/* AI summary */}
            <div className="rounded-3xl border border-neutral-100 bg-gradient-to-br from-lime-50 to-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-lime-700">{t(locale, "AI Summary", "ملخص الذكاء الاصطناعي")}</p>
              <h2 className="mt-2 text-xl font-bold text-neutral-900">{locale === "ar" ? analysis.summaryAr : analysis.summaryEn}</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Mini label={t(locale, "Daily kcal", "سعرات يومية")} value={`${analysis.recommendedDailyCalories}`} />
                <Mini label={t(locale, "Protein", "بروتين")} value={`${analysis.recommendedProteinG}${t(locale, "g", "غ")}`} />
                <Mini label={t(locale, "Carbs", "كربوهيدرات")} value={`${analysis.recommendedCarbsG}${t(locale, "g", "غ")}`} />
                <Mini label={t(locale, "Fat", "دهون")} value={`${analysis.recommendedFatG}${t(locale, "g", "غ")}`} />
              </div>
            </div>
          </section>
        )}

        {/* ACCOUNT TAB */}
        {tab === "account" && (
          <section className="space-y-4">
            {/* Preferences */}
            <div className="rounded-3xl border border-neutral-100 bg-white p-6">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-lime-700" />
                <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Preferences", "التفضيلات")}</h2>
              </div>
              <p className="mt-1 text-sm text-neutral-500">{t(locale, "Language and display currency. Saved on this device.", "اللغة وعملة العرض. محفوظة على هذا الجهاز.")}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Language", "اللغة")}</label>
                  <select value={locale} onChange={(e) => setLocale(e.target.value as "en" | "ar")}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-900 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-100">
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Display currency", "عملة العرض")}</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-900 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-100">
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{locale === "ar" ? c.ar : c.en} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password change */}
            <ChangePasswordCard locale={locale} email={draft.email} />

            {/* Danger zone */}
            <div className="rounded-3xl border border-red-100 bg-red-50/40 p-6">
              <h2 className="text-lg font-bold text-red-700">{t(locale, "Danger zone", "منطقة الخطر")}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t(locale, "This resets your local profile and progress on this device.", "هذا يعيد ضبط ملفك وتقدّمك على هذا الجهاز.")}</p>
              <button
                type="button"
                onClick={() => {
                  if (confirm(t(locale, "Reset your profile and start over?", "إعادة ضبط ملفك والبدء من جديد؟"))) {
                    resetOnboarding()
                    router.replace("/onboarding")
                  }
                }}
                className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                {t(locale, "Reset profile", "إعادة ضبط الملف")}
              </button>
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  )
}

// ============================================================================
// Change Password card — extracted so the state for the mini-form is local.
// ----------------------------------------------------------------------------
// Flow:
//   1. User enters current password + new password + confirm.
//   2. Client-side validates: min 8 chars, new != current, confirm == new.
//   3. Verify current password by calling signInWithPassword({ email, current }).
//      Supabase has no dedicated "verify password" endpoint; a fresh sign-in
//      returns the same session (or an error). The session cookie is refreshed
//      but the auth state is unchanged from the user's perspective.
//   4. If verified, call updateUser({ password: new }). Session stays.
//   5. Toast success. Clear the form.
// Error surface: any Supabase message is surfaced in a compact inline error.
// ============================================================================
function ChangePasswordCard({ locale, email }: { locale: "en" | "ar"; email: string }) {
  const { notify } = useToast()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirmVal, setConfirmVal] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const minLen = 8
  const nextValid = next.length >= minLen
  const differs = next.length > 0 && next !== current
  const matches = confirmVal.length > 0 && confirmVal === next
  const canSubmit = !busy && current.length > 0 && nextValid && differs && matches

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setErr(null)
    setBusy(true)
    const supabase = createClient()
    // Step 1: verify current password by attempting a fresh sign-in.
    // This does not disturb the existing session — signInWithPassword returns
    // a session and Supabase silently updates the cookie to the same user.
    const { error: verifyErr } = await supabase.auth.signInWithPassword({ email, password: current })
    if (verifyErr) {
      setBusy(false)
      const msg = verifyErr.message?.toLowerCase() ?? ""
      if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        setErr(t(locale, "Current password is incorrect.", "كلمة المرور الحالية غير صحيحة."))
      } else {
        setErr(verifyErr.message || t(locale, "Could not verify current password.", "تعذر التحقق من كلمة المرور الحالية."))
      }
      return
    }
    // Step 2: update the password. Session stays intact per Supabase docs.
    const { error: updateErr } = await supabase.auth.updateUser({ password: next })
    setBusy(false)
    if (updateErr) {
      setErr(updateErr.message || t(locale, "Could not update password. Please try again.", "تعذر تحديث كلمة المرور. يرجى المحاولة مرة أخرى."))
      return
    }
    setCurrent("")
    setNext("")
    setConfirmVal("")
    setShowCurrent(false)
    setShowNext(false)
    notify(t(locale, "Password updated", "تم تحديث كلمة المرور"), "success")
  }

  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-lime-700" />
        <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Change password", "تغيير كلمة المرور")}</h2>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {t(locale, "Enter your current password, then choose a new one (minimum 8 characters).", "أدخل كلمة المرور الحالية، ثم اختر كلمة مرور جديدة (٨ أحرف على الأقل).")}
      </p>
      <form onSubmit={submit} className="mt-5 space-y-3" autoComplete="off">
        <FieldPassword
          label={t(locale, "Current password", "كلمة المرور الحالية")}
          value={current}
          onChange={setCurrent}
          show={showCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
          autoComplete="current-password"
          testId="current-password"
        />
        <FieldPassword
          label={t(locale, "New password", "كلمة المرور الجديدة")}
          value={next}
          onChange={setNext}
          show={showNext}
          onToggle={() => setShowNext((v) => !v)}
          autoComplete="new-password"
          testId="new-password"
          hint={next.length > 0 && next.length < minLen ? t(locale, `At least ${minLen} characters.`, `على الأقل ${minLen} أحرف.`) : next.length > 0 && !differs ? t(locale, "New password must be different from current.", "كلمة المرور الجديدة يجب أن تختلف عن الحالية.") : undefined}
        />
        <FieldPassword
          label={t(locale, "Confirm new password", "تأكيد كلمة المرور الجديدة")}
          value={confirmVal}
          onChange={setConfirmVal}
          show={showNext}
          onToggle={() => setShowNext((v) => !v)}
          autoComplete="new-password"
          testId="confirm-password"
          hint={confirmVal.length > 0 && !matches ? t(locale, "Passwords do not match.", "كلمتا المرور غير متطابقتين.") : undefined}
        />
        {err && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {err}
          </div>
        )}
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition",
            canSubmit ? "bg-lime-700 text-white shadow-sm hover:bg-lime-800" : "cursor-not-allowed bg-neutral-100 text-neutral-400"
          )}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
          {busy ? t(locale, "Updating...", "جارٍ التحديث...") : t(locale, "Update password", "تحديث كلمة المرور")}
        </button>
      </form>
    </div>
  )
}

function FieldPassword({
  label, value, onChange, show, onToggle, autoComplete, hint, testId,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  autoComplete: string
  hint?: string
  testId?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>
      <div className="relative flex items-center rounded-xl border border-neutral-200 bg-white focus-within:border-lime-400 focus-within:ring-2 focus-within:ring-lime-100">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          data-testid={testId}
          className="w-full bg-transparent px-4 py-2.5 text-sm text-neutral-900 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="px-3 text-neutral-400 hover:text-neutral-600"
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs font-medium text-amber-600">{hint}</p>}
    </div>
  )
}

function FieldText({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100" />
    </div>
  )
}

function FieldNumber({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>
      <div className="flex items-center rounded-xl border border-neutral-200 bg-white focus-within:border-lime-400 focus-within:ring-2 focus-within:ring-lime-100">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent px-4 py-2.5 text-sm text-neutral-900 outline-none" />
        {suffix && <span className="px-3 text-xs font-medium text-neutral-400">{suffix}</span>}
      </div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white bg-white/60 p-3 text-center">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-neutral-900">{value}</p>
    </div>
  )
}
