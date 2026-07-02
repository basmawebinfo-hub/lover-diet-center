"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, X, Upload, Loader2, ChefHat } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import {
  adminFetchMeals,
  adminUpsertMeal,
  adminDeleteMeal,
  uploadMealImage,
  adminFetchClients,
} from "@/lib/supabase/db"
import type { Meal } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"

const MEAL_TYPES: Meal["mealType"][] = ["breakfast", "lunch", "dinner", "snack"]
const MEAL_TYPE_LABELS: Record<Meal["mealType"], { en: string; ar: string }> = {
  breakfast: { en: "Breakfast", ar: "إفطار" },
  lunch:     { en: "Lunch",     ar: "غداء"  },
  dinner:    { en: "Dinner",    ar: "عشاء"  },
  snack:     { en: "Snack",     ar: "وجبة خفيفة" },
}

const emptyMeal = (): Meal => ({
  // stable id — kept for existing meals, generated fresh for new ones
  id: `m_${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  imageUrl: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  mealType: "breakfast",
  tags: [],
})

type Client = { id: string; nameEn: string; nameAr: string; goal: string }

export default function AdminMealsAndPlansPage() {
  const { locale } = useLocale()
  const { notify } = useToast()

  const [meals, setMeals] = useState<Meal[] | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [filter, setFilter] = useState<Meal["mealType"] | "all">("all")

  const [editing, setEditing] = useState<Meal | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tagInput, setTagInput] = useState("")

  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => adminFetchMeals().then(setMeals)

  useEffect(() => {
    load()
    adminFetchClients().then((c) =>
      setClients(c.map((x) => ({ id: x.id, nameEn: x.nameEn, nameAr: x.nameAr, goal: x.goal }))),
    )
  }, [])

  const filteredMeals = (meals ?? []).filter((m) => filter === "all" ? true : m.mealType === filter)

  function validate(m: Meal): string | null {
    if (!m.nameEn.trim()) return t(locale, "English name is required.", "الاسم بالإنجليزية مطلوب.")
    if (m.calories < 0 || m.protein < 0 || m.carbs < 0 || m.fat < 0)
      return t(locale, "Macros cannot be negative.", "قيم الماكرو لا يمكن أن تكون سالبة.")
    if (m.calories > 5000) return t(locale, "Calories look too high (>5000).", "السعرات مرتفعة جداً (>5000).")
    if (!MEAL_TYPES.includes(m.mealType))
      return t(locale, "Please pick a meal type.", "يرجى اختيار نوع الوجبة.")
    return null
  }

  async function save() {
    if (!editing) return
    const err = validate(editing)
    if (err) { notify(err, "error"); return }

    setSaving(true)
    const ok = await adminUpsertMeal(editing)
    setSaving(false)

    if (ok) {
      notify(t(locale, "Meal saved.", "تم حفظ الوجبة."), "success")
      setEditing(null)
      load()
    } else {
      notify(
        t(locale,
          "Save failed. Make sure you are signed in as an admin.",
          "فشل الحفظ. تأكد من تسجيل الدخول كأدمن."),
        "error",
      )
    }
  }

  async function remove(m: Meal) {
    const label = locale === "ar" ? (m.nameAr || m.nameEn) : m.nameEn
    if (!confirm(t(locale, `Delete "${label}"?`, `حذف "${label}"؟`))) return
    const ok = await adminDeleteMeal(m.id)
    if (ok) {
      notify(t(locale, "Meal deleted.", "تم حذف الوجبة."), "success")
      load()
    } else {
      notify(t(locale, "Delete failed.", "فشل الحذف."), "error")
    }
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    // Client-side guard so admins get an instant error instead of a Storage 400.
    if (!file.type.startsWith("image/")) {
      notify(t(locale, "Please pick an image file.", "يرجى اختيار ملف صورة."), "error")
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      notify(t(locale, "Image is larger than 10 MB.", "الصورة أكبر من 10 ميجابايت."), "error")
      if (fileRef.current) fileRef.current.value = ""
      return
    }

    setUploading(true)
    const url = await uploadMealImage(file)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""

    if (url) {
      setEditing({ ...editing, imageUrl: url })
      notify(t(locale, "Image uploaded.", "تم رفع الصورة."), "success")
    } else {
      notify(
        t(locale,
          "Upload failed. Verify the meal-images bucket exists and you are signed in as admin.",
          "فشل الرفع. تحقّق من وجود bucket 'meal-images' وأنك مسجّل كأدمن."),
        "error",
      )
    }
  }

  function addTag() {
    if (!editing) return
    const v = tagInput.trim()
    if (!v) return
    if (editing.tags.includes(v)) { setTagInput(""); return }
    setEditing({ ...editing, tags: [...editing.tags, v] })
    setTagInput("")
  }

  function removeTag(tag: string) {
    if (!editing) return
    setEditing({ ...editing, tags: editing.tags.filter((x) => x !== tag) })
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-600">{t(locale, "Meals & Plans", "الوجبات والخطط")}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
              {t(locale, "Meals Catalog", "كتالوج الوجبات")}
            </h1>
          </div>
          <button
            onClick={() => setEditing(emptyMeal())}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="size-4" /> {t(locale, "Add meal", "إضافة وجبة")}
          </button>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {(["all", ...MEAL_TYPES] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k as typeof filter)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold",
                filter === k
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200",
              )}
            >
              {k === "all"
                ? t(locale, "All", "الكل")
                : t(locale, MEAL_TYPE_LABELS[k as Meal["mealType"]].en, MEAL_TYPE_LABELS[k as Meal["mealType"]].ar)}
            </button>
          ))}
        </div>

        {/* Meals grid — states */}
        {meals === null ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-emerald-500" />
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-white py-16 text-center">
            <ChefHat className="mx-auto size-10 text-neutral-300" />
            <p className="mt-3 text-sm font-semibold text-neutral-500">
              {meals.length === 0
                ? t(locale, "No meals yet.", "لا توجد وجبات بعد.")
                : t(locale, "No meals in this category.", "لا توجد وجبات في هذا التصنيف.")}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {t(locale, "Click 'Add meal' to create the first one.", "اضغط 'إضافة وجبة' لإنشاء أول وجبة.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMeals.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
                <div className="relative h-36 bg-emerald-50">
                  {m.imageUrl ? (
                    <Image src={m.imageUrl} alt={m.nameEn} fill sizes="33vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-300">
                      {t(locale, "No image", "بلا صورة")}
                    </div>
                  )}
                  <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 shadow">
                    {t(locale, MEAL_TYPE_LABELS[m.mealType].en, MEAL_TYPE_LABELS[m.mealType].ar)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 font-bold text-neutral-900">
                    {locale === "ar" ? (m.nameAr || m.nameEn) : m.nameEn}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
                    {locale === "ar" ? m.descriptionAr : m.descriptionEn}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-600">
                      {m.calories} kcal
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                      {m.protein}g {t(locale, "protein", "بروتين")}
                    </span>
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 font-semibold text-orange-600">
                      {m.carbs}g {t(locale, "carbs", "كارب")}
                    </span>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-600">
                      {m.fat}g {t(locale, "fat", "دهون")}
                    </span>
                  </div>
                  {m.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setEditing({ ...m })}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      <Pencil className="size-3.5" /> {t(locale, "Edit", "تعديل")}
                    </button>
                    <button
                      onClick={() => remove(m)}
                      aria-label={t(locale, "Delete", "حذف")}
                      className="flex items-center justify-center rounded-xl border border-red-100 px-3 py-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clients section — unchanged */}
        <section className="pt-4">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale, "Clients", "العملاء")}</h2>
          {clients.length === 0 ? (
            <p className="rounded-2xl border border-neutral-100 bg-white py-10 text-center text-sm text-neutral-400">
              {t(locale, "No clients yet.", "لا يوجد عملاء بعد.")}
            </p>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400">
                    <th className="p-4 text-start font-medium">{t(locale, "Client", "العميل")}</th>
                    <th className="p-4 text-start font-medium">{t(locale, "Goal", "الهدف")}</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-50">
                      <td className="p-4 font-semibold text-neutral-900">
                        {locale === "ar" ? (c.nameAr || c.nameEn) : c.nameEn}
                      </td>
                      <td className="p-4 text-neutral-500">{c.goal || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && !uploading && setEditing(null)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                {meals?.some((x) => x.id === editing.id)
                  ? t(locale, "Edit meal", "تعديل وجبة")
                  : t(locale, "New meal", "وجبة جديدة")}
              </h2>
              <button
                onClick={() => setEditing(null)}
                aria-label={t(locale, "Close", "إغلاق")}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-50"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Image */}
            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                {t(locale, "Image", "الصورة")}
              </label>
              <div className="flex items-center gap-3">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-emerald-50">
                  {editing.imageUrl ? (
                    <Image src={editing.imageUrl} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-neutral-300">
                      {t(locale, "None", "لا شيء")}
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={onPickImage}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  {t(locale, "Upload image", "رفع صورة")}
                </button>
                {editing.imageUrl && (
                  <button
                    onClick={() => setEditing({ ...editing, imageUrl: "" })}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    {t(locale, "Remove", "إزالة")}
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-400">
                {t(locale,
                  "JPG, PNG, WebP, AVIF, or GIF. Max 10 MB.",
                  "JPG أو PNG أو WebP أو AVIF أو GIF. الحد الأقصى 10 ميجابايت.")}
              </p>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <Field label={t(locale, "Name (EN) *", "الاسم (إنجليزي) *")}>
                <input
                  value={editing.nameEn}
                  onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Grilled chicken bowl"
                  maxLength={120}
                />
              </Field>
              <Field label={t(locale, "Name (AR)", "الاسم (عربي)")}>
                <input
                  dir="rtl"
                  value={editing.nameAr}
                  onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })}
                  className={inputCls}
                  placeholder="مثال: طبق دجاج مشوي"
                  maxLength={120}
                />
              </Field>
            </div>

            {/* Descriptions */}
            <div className="mt-3 grid grid-cols-1 gap-3">
              <Field label={t(locale, "Description (EN)", "الوصف (إنجليزي)")}>
                <textarea
                  rows={2}
                  value={editing.descriptionEn}
                  onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })}
                  className={inputCls}
                  maxLength={500}
                />
              </Field>
              <Field label={t(locale, "Description (AR)", "الوصف (عربي)")}>
                <textarea
                  dir="rtl"
                  rows={2}
                  value={editing.descriptionAr}
                  onChange={(e) => setEditing({ ...editing, descriptionAr: e.target.value })}
                  className={inputCls}
                  maxLength={500}
                />
              </Field>
            </div>

            {/* Macros */}
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label={t(locale, "Calories", "سعرات")}>
                <input
                  type="number" min={0} max={5000} step={1}
                  value={editing.calories}
                  onChange={(e) => setEditing({ ...editing, calories: Math.max(0, parseInt(e.target.value) || 0) })}
                  className={inputCls}
                />
              </Field>
              <Field label={t(locale, "Protein (g)", "بروتين (جم)")}>
                <input
                  type="number" min={0} max={500} step={1}
                  value={editing.protein}
                  onChange={(e) => setEditing({ ...editing, protein: Math.max(0, parseInt(e.target.value) || 0) })}
                  className={inputCls}
                />
              </Field>
              <Field label={t(locale, "Carbs (g)", "كارب (جم)")}>
                <input
                  type="number" min={0} max={500} step={1}
                  value={editing.carbs}
                  onChange={(e) => setEditing({ ...editing, carbs: Math.max(0, parseInt(e.target.value) || 0) })}
                  className={inputCls}
                />
              </Field>
              <Field label={t(locale, "Fat (g)", "دهون (جم)")}>
                <input
                  type="number" min={0} max={500} step={1}
                  value={editing.fat}
                  onChange={(e) => setEditing({ ...editing, fat: Math.max(0, parseInt(e.target.value) || 0) })}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Type */}
            <div className="mt-3">
              <Field label={t(locale, "Meal type", "نوع الوجبة")}>
                <select
                  value={editing.mealType}
                  onChange={(e) => setEditing({ ...editing, mealType: e.target.value as Meal["mealType"] })}
                  className={inputCls}
                >
                  {MEAL_TYPES.map((mt) => (
                    <option key={mt} value={mt}>
                      {t(locale, MEAL_TYPE_LABELS[mt].en, MEAL_TYPE_LABELS[mt].ar)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Tags */}
            <div className="mt-3">
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                {t(locale, "Tags", "الوسوم")}
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {editing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      aria-label={t(locale, "Remove tag", "حذف الوسم")}
                      className="text-emerald-500 hover:text-emerald-700"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  onBlur={() => tagInput && addTag()}
                  placeholder={t(locale, "Add tag + Enter", "أضف وسم + Enter")}
                  className="min-w-[140px] flex-1 rounded-full border border-neutral-200 px-3 py-1 text-xs focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-neutral-400">
                {t(locale,
                  "e.g. high-protein, keto, vegetarian, gluten-free",
                  "مثال: بروتين عالي، كيتو، نباتي، خالٍ من الجلوتين")}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditing(null)}
                disabled={saving || uploading}
                className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
              >
                {t(locale, "Cancel", "إلغاء")}
              </button>
              <button
                onClick={save}
                disabled={saving || uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                {t(locale, "Save meal", "حفظ الوجبة")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

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
