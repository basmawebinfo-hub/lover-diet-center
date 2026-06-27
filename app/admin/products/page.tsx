"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, X, Upload, Loader2 } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { adminFetchProducts, adminUpsertProduct, adminDeleteProduct, uploadProductImage } from "@/lib/supabase/db"
import type { Product } from "@/lib/types"
import { useCurrency, CURRENCIES } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"

const CATEGORIES: Product["category"][] = ["snack", "drink", "supplement", "meal"]
const emptyProduct = (): Product => ({
  id: `p_${Date.now()}`, nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "",
  imageUrl: "", price: 0, category: "snack", inStock: true,
})

export default function AdminProductsPage() {
  const { locale } = useLocale()
  const { format, currency, setCurrency } = useCurrency()
  const { notify } = useToast()
  const [items, setItems] = useState<Product[]>([])
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => adminFetchProducts().then((real) => setItems(real))
  useEffect(() => { load() }, [])

  async function save() {
    if (!editing) return
    if (!editing.nameEn.trim() || editing.price <= 0) {
      notify(t(locale, "Name and a price > 0 are required.", "الاسم وسعر أكبر من صفر مطلوبان."), "error")
      return
    }
    setSaving(true)
    const ok = await adminUpsertProduct(editing)
    setSaving(false)
    if (ok) {
      notify(t(locale, "Product saved", "تم حفظ المنتج"), "success")
      setEditing(null)
      load()
    } else {
      notify(t(locale, "Save failed (are you signed in as admin?)", "فشل الحفظ (هل أنت مسجّل كأدمن؟)"), "error")
    }
  }

  async function remove(id: string) {
    if (!confirm(t(locale, "Delete this product?", "حذف هذا المنتج؟"))) return
    const ok = await adminDeleteProduct(id)
    if (ok) { notify(t(locale, "Deleted", "تم الحذف"), "success"); load() }
    else notify(t(locale, "Delete failed", "فشل الحذف"), "error")
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    setUploading(true)
    const url = await uploadProductImage(file)
    setUploading(false)
    if (url) setEditing({ ...editing, imageUrl: url })
    else notify(t(locale, "Upload failed (check the 'product-images' bucket).", "فشل الرفع (تحقق من bucket 'product-images')."), "error")
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">{t(locale, "Products", "المنتجات")}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale, "Product Catalog", "كتالوج المنتجات")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-700 focus:border-emerald-400 focus:outline-none">
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <button onClick={() => setEditing(emptyProduct())} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><Plus className="size-4" /> {t(locale, "Add product", "إضافة منتج")}</button>
          </div>
        </div>

        <p className="text-xs text-neutral-400">{t(locale, "Prices are stored in USD. Customers pay in their chosen currency.", "الأسعار مخزّنة بالدولار. العميل يدفع بعملته المختارة.")}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
              <div className="relative h-36 bg-emerald-50">
                {p.imageUrl ? <Image src={p.imageUrl} alt={p.nameEn} fill sizes="33vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-neutral-300">{t(locale, "No image", "بلا صورة")}</div>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-neutral-900">{locale === "ar" ? (p.nameAr || p.nameEn) : p.nameEn}</h3>
                  <span className="shrink-0 text-xs font-semibold text-neutral-400">{p.category}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{locale === "ar" ? p.descriptionAr : p.descriptionEn}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-emerald-700">{format(p.price)}</span>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", p.inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500")}>{p.inStock ? t(locale, "In stock", "متوفر") : t(locale, "Out", "نفد")}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEditing({ ...p })} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"><Pencil className="size-3.5" /> {t(locale, "Edit", "تعديل")}</button>
                  <button onClick={() => remove(p.id)} className="flex items-center justify-center rounded-xl border border-red-100 px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Add modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">{editing.nameEn ? t(locale, "Edit product", "تعديل منتج") : t(locale, "New product", "منتج جديد")}</h2>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-50"><X className="size-5" /></button>
            </div>

            {/* Image */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{t(locale, "Image", "الصورة")}</label>
              <div className="flex items-center gap-3">
                <div className="relative size-20 overflow-hidden rounded-xl bg-emerald-50">
                  {editing.imageUrl ? <Image src={editing.imageUrl} alt="" fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-neutral-300">{t(locale, "None", "لا شيء")}</div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} {t(locale, "Upload image", "رفع صورة")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t(locale, "Name (EN)", "الاسم (إنجليزي)")}><input value={editing.nameEn} onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })} className={inputCls} /></Field>
              <Field label={t(locale, "Name (AR)", "الاسم (عربي)")}><input dir="rtl" value={editing.nameAr} onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })} className={inputCls} /></Field>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3">
              <Field label={t(locale, "Description (EN)", "الوصف (إنجليزي)")}><textarea rows={2} value={editing.descriptionEn} onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })} className={inputCls} /></Field>
              <Field label={t(locale, "Description (AR)", "الوصف (عربي)")}><textarea dir="rtl" rows={2} value={editing.descriptionAr} onChange={(e) => setEditing({ ...editing, descriptionAr: e.target.value })} className={inputCls} /></Field>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label={t(locale, "Price (USD)", "السعر (دولار)")}><input type="number" min={0} step={0.5} value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className={inputCls} /></Field>
              <Field label={t(locale, "Category", "التصنيف")}>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as Product["category"] })} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm font-medium text-neutral-700">
              <input type="checkbox" checked={editing.inStock} onChange={(e) => setEditing({ ...editing, inStock: e.target.checked })} className="size-4 rounded accent-emerald-600" />
              {t(locale, "In stock", "متوفر")}
            </label>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50">{t(locale, "Cancel", "إلغاء")}</button>
              <button onClick={save} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                {saving && <Loader2 className="size-4 animate-spin" />} {t(locale, "Save", "حفظ")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

const inputCls = "w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none"
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>
      {children}
    </div>
  )
}
