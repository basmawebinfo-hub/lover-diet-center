"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { mockProducts } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

export default function AdminProductsPage() {
  const { locale } = useLocale()
  const [items, setItems] = useState(mockProducts.map(p=>({...p})))
  const aed = t(locale,"AED","درهم")
  const toggle = (id:string)=>setItems(prev=>prev.map(p=>p.id===id?{...p,inStock:!p.inStock}:p))

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">{t(locale,"Products","المنتجات")}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale,"Product Catalog","كتالوج المنتجات")}</h1>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><Plus className="size-4" /> {t(locale,"Add product","إضافة منتج")}</button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p)=>(
            <div key={p.id} className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
              <div className="relative h-36 bg-emerald-50">
                <Image src={p.imageUrl} alt={p.nameEn} fill sizes="33vw" className="object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-neutral-900">{locale==="ar"?p.nameAr:p.nameEn}</h3>
                  <span className="text-xs font-semibold text-neutral-400">{p.category}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{locale==="ar"?p.descriptionAr:p.descriptionEn}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-emerald-700">{p.price} {aed}</span>
                  <button onClick={()=>toggle(p.id)} className={cn("rounded-full px-3 py-1.5 text-xs font-bold transition", p.inStock?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-500")}>
                    {p.inStock?t(locale,"In stock","متوفر"):t(locale,"Out of stock","نفد")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
