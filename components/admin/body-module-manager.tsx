"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react"

type Resource = "services" | "categories" | "bookings" | "reviews" | "gallery"

class ApiError extends Error {
  code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.code = code
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(json.error || `HTTP ${res.status}`, json.code)
  return json
}

const LABELS: Record<Resource, { title: string; subtitle: string }> = {
  services: { title: "الخدمات", subtitle: "إدارة المحتوى والأسعار والعروض وترتيب الظهور" },
  categories: { title: "تصنيفات الخدمات", subtitle: "تنظيم الخدمات في مجموعات واضحة" },
  bookings: { title: "الحجوزات", subtitle: "متابعة الطلبات وتأكيد المواعيد" },
  reviews: { title: "التقييمات", subtitle: "مراجعة واعتماد آراء العملاء" },
  gallery: { title: "معرض الخدمات", subtitle: "إدارة الصور وترتيبها في الصفحة العامة" },
}

const BOOKING_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "قيد الانتظار", className: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "مؤكد", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completed: { label: "مكتمل", className: "bg-sky-50 text-sky-700 border-sky-200" },
  cancelled: { label: "ملغي", className: "bg-red-50 text-red-600 border-red-200" },
  no_show: { label: "لم يحضر", className: "bg-neutral-100 text-neutral-500 border-neutral-200" },
}

function ErrorPanel({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const steps: string[] =
    error.code === "missing_env"
      ? [
          "افتح إعدادات مشروعك على Vercel ثم Environment Variables.",
          "أضف SUPABASE_SERVICE_ROLE_KEY (من Supabase → Settings → API Keys).",
          "أعد نشر المشروع (Redeploy) ثم حدّث هذه الصفحة.",
        ]
      : error.code === "not_admin"
        ? [
            "افتح Supabase → SQL Editor.",
            "شغّل: update public.profiles set role = 'admin' where id = auth.uid(); أو حدد الحساب بالبريد.",
            "سجّل الخروج ثم الدخول مرة أخرى.",
          ]
        : error.code === "not_authenticated"
          ? ["سجّل الدخول بحساب الأدمن ثم عد إلى هذه الصفحة."]
          : ["تأكد من تشغيل ملفي SQL (إنشاء الجداول ثم البيانات) في Supabase SQL Editor.", "حدّث الصفحة بعد التشغيل."]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-bold text-red-700">تعذر تحميل البيانات</p>
          <p className="text-sm leading-relaxed text-red-600">{error.message}</p>
        </div>
      </div>
      <ol className="flex list-inside list-decimal flex-col gap-1 rounded-xl bg-white/70 p-4 text-sm leading-relaxed text-neutral-700">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <button
        onClick={onRetry}
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-red-200 bg-white px-4 font-bold text-red-700 transition-colors hover:bg-red-100"
      >
        <RefreshCw className="size-4" />
        إعادة المحاولة
      </button>
    </div>
  )
}

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-neutral-100 p-4">
          <div className="size-10 animate-pulse rounded-full bg-neutral-100" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      ))}
    </div>
  )
}

export function BodyModuleManager({ resource }: { resource: Resource }) {
  const { data, error, isLoading, mutate } = useSWR(`/api/admin/body-module/${resource}`, fetcher)
  const [search, setSearch] = useState("")
  const [pendingId, setPendingId] = useState<string | null>(null)

  const allRows = useMemo(() => (data?.data ?? []) as Record<string, unknown>[], [data])
  const rows = useMemo(
    () => allRows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())),
    [allRows, search],
  )

  const stats = useMemo(() => {
    if (resource === "bookings") {
      const pending = allRows.filter((r) => r.status === "pending").length
      const confirmed = allRows.filter((r) => r.status === "confirmed").length
      return [
        { label: "إجمالي الحجوزات", value: allRows.length },
        { label: "قيد الانتظار", value: pending },
        { label: "مؤكدة", value: confirmed },
      ]
    }
    if (resource === "reviews") {
      const approved = allRows.filter((r) => r.is_approved === true).length
      return [
        { label: "إجمالي التقييمات", value: allRows.length },
        { label: "معتمدة", value: approved },
        { label: "بانتظار الاعتماد", value: allRows.length - approved },
      ]
    }
    const active = allRows.filter((r) => r.is_active !== false).length
    return [
      { label: "الإجمالي", value: allRows.length },
      { label: "مفعّل", value: active },
      { label: "موقوف", value: allRows.length - active },
    ]
  }, [allRows, resource])

  async function patch(id: string, changes: Record<string, unknown>) {
    setPendingId(id)
    try {
      await fetch(`/api/admin/body-module/${resource}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      })
      await mutate()
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div dir="rtl" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-neutral-950 text-balance">{LABELS[resource].title}</h1>
        <p className="text-neutral-500 leading-relaxed">{LABELS[resource].subtitle}</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-2xl border bg-white p-4">
            <span className="text-sm text-neutral-500">{stat.label}</span>
            <span className="text-2xl font-black text-neutral-950">{isLoading ? "—" : stat.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4">
        <label className="flex min-h-11 min-w-56 flex-1 items-center gap-2 rounded-xl border px-3 focus-within:border-emerald-600">
          <Search className="size-4 shrink-0 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو أي تفاصيل..."
            className="w-full bg-transparent outline-none"
          />
          {search ? (
            <button onClick={() => setSearch("")} aria-label="مسح البحث" className="text-neutral-400 hover:text-neutral-600">
              <X className="size-4" />
            </button>
          ) : null}
        </label>
        <button
          onClick={() => mutate()}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 font-bold transition-colors hover:bg-neutral-50"
        >
          <RefreshCw className="size-4" />
          تحديث
        </button>
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : error ? (
        <ErrorPanel error={error as ApiError} onRetry={() => mutate()} />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-white p-12 text-center">
          <p className="font-bold text-neutral-700">{search ? "لا توجد نتائج مطابقة للبحث." : "لا توجد بيانات بعد."}</p>
          <p className="text-sm text-neutral-500 leading-relaxed">
            {search
              ? "جرّب كلمة بحث مختلفة أو امسح البحث."
              : "إذا كنت شغّلت أكواد SQL في Supabase ولا تزال القائمة فارغة، اضغط تحديث."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="p-4 font-bold">العنصر</th>
                <th className="p-4 font-bold">تفاصيل</th>
                <th className="p-4 font-bold">الحالة</th>
                <th className="p-4 font-bold">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = String(row.id)
                const name = String(row.name_ar ?? row.customer_name ?? row.title_ar ?? row.reference ?? id)
                const detail =
                  resource === "services"
                    ? `${row.price} د.إ • ${row.duration_minutes} دقيقة`
                    : resource === "bookings"
                      ? `${row.booking_date} • ${String(row.booking_time).slice(0, 5)} • ${row.phone}`
                      : resource === "reviews"
                        ? `${row.rating}/5 • ${String(row.comment_ar ?? "").slice(0, 60)}`
                        : String(row.slug ?? row.kind ?? "")
                const isPending = pendingId === id

                return (
                  <tr key={id} className="border-t transition-colors hover:bg-neutral-50/60">
                    <td className="p-4 font-bold text-neutral-900">{name}</td>
                    <td className="p-4 text-neutral-600">{detail}</td>
                    <td className="p-4">
                      {resource === "bookings" ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                            BOOKING_STATUS[String(row.status)]?.className ?? "bg-neutral-100 text-neutral-500 border-neutral-200"
                          }`}
                        >
                          {BOOKING_STATUS[String(row.status)]?.label ?? String(row.status)}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                            (row.is_active ?? row.is_approved) !== false && (row.is_active ?? row.is_approved) !== null
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-neutral-200 bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {resource === "reviews"
                            ? row.is_approved
                              ? "معتمد"
                              : "غير معتمد"
                            : row.is_active !== false
                              ? "مفعّل"
                              : "موقوف"}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {isPending ? (
                          <Loader2 className="size-4 animate-spin text-emerald-700" />
                        ) : resource === "bookings" ? (
                          <>
                            {row.status === "pending" ? (
                              <button
                                onClick={() => patch(id, { status: "confirmed" })}
                                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                              >
                                <Check className="size-3.5" />
                                تأكيد
                              </button>
                            ) : null}
                            {row.status !== "cancelled" && row.status !== "completed" ? (
                              <button
                                onClick={() => patch(id, { status: "cancelled" })}
                                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                              >
                                <X className="size-3.5" />
                                إلغاء
                              </button>
                            ) : null}
                            {row.status === "confirmed" ? (
                              <button
                                onClick={() => patch(id, { status: "completed" })}
                                className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-700 transition-colors hover:bg-sky-100"
                              >
                                <Check className="size-3.5" />
                                اكتمل
                              </button>
                            ) : null}
                          </>
                        ) : resource === "reviews" ? (
                          <button
                            onClick={() => patch(id, { is_approved: !row.is_approved })}
                            className="inline-flex min-h-9 items-center gap-1 rounded-lg border px-3 text-xs font-bold transition-colors hover:bg-neutral-50"
                          >
                            {row.is_approved ? <ToggleRight className="size-4 text-emerald-600" /> : <ToggleLeft className="size-4 text-neutral-400" />}
                            {row.is_approved ? "إلغاء الاعتماد" : "اعتماد"}
                          </button>
                        ) : (
                          <button
                            onClick={() => patch(id, { is_active: row.is_active === false })}
                            className="inline-flex min-h-9 items-center gap-1 rounded-lg border px-3 text-xs font-bold transition-colors hover:bg-neutral-50"
                          >
                            {row.is_active !== false ? <ToggleRight className="size-4 text-emerald-600" /> : <ToggleLeft className="size-4 text-neutral-400" />}
                            {row.is_active !== false ? "إيقاف" : "تفعيل"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
