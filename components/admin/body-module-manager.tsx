"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import Image from "next/image"
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Images,
  Layers,
  Loader2,
  PauseCircle,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Tags,
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

const META: Record<
  Resource,
  { title: string; subtitle: string; icon: typeof Sparkles; hint: string }
> = {
  services: {
    title: "الخدمات",
    subtitle: "إدارة المحتوى والأسعار والعروض وترتيب الظهور",
    icon: Sparkles,
    hint: "زر «إيقاف» يخفي الخدمة فورًا من الموقع دون حذفها، و«تفعيل» يعيدها.",
  },
  categories: {
    title: "تصنيفات الخدمات",
    subtitle: "تنظيم الخدمات في مجموعات واضحة",
    icon: Tags,
    hint: "إيقاف تصنيف يخفي كل خدماته من فلاتر الصفحة العامة.",
  },
  bookings: {
    title: "الحجوزات",
    subtitle: "متابعة الطلبات وتأكيد المواعيد",
    icon: CalendarCheck,
    hint: "الحجوزات الجديدة تظهر «قيد الانتظار». أكّدها بعد الاتفاق مع العميل، ثم علّمها «اكتمل» بعد الجلسة.",
  },
  reviews: {
    title: "التقييمات",
    subtitle: "مراجعة واعتماد آراء العملاء",
    icon: Star,
    hint: "التقييم لا يظهر على الموقع إلا بعد الضغط على «اعتماد».",
  },
  gallery: {
    title: "معرض الخدمات",
    subtitle: "إدارة الصور وترتيبها في الصفحة العامة",
    icon: Images,
    hint: "إيقاف صورة يخفيها من المعرض العام مع الاحتفاظ بها هنا.",
  },
}

const BOOKING_STATUS: Record<string, { label: string; className: string; dot: string }> = {
  pending: { label: "قيد الانتظار", className: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  confirmed: { label: "مؤكد", className: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  completed: { label: "مكتمل", className: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  cancelled: { label: "ملغي", className: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500" },
  no_show: { label: "لم يحضر", className: "bg-neutral-100 text-neutral-500 border-neutral-200", dot: "bg-neutral-400" },
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
    <div className="flex flex-col gap-4 rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertTriangle className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-bold text-neutral-900">تعذر تحميل البيانات</p>
          <p className="text-sm leading-relaxed text-red-600">{error.message}</p>
        </div>
      </div>
      <ol className="flex list-inside list-decimal flex-col gap-1.5 rounded-2xl bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <button
        onClick={onRetry}
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-emerald-600 px-5 font-bold text-white transition-colors hover:bg-emerald-700"
      >
        <RefreshCw className="size-4" />
        إعادة المحاولة
      </button>
    </div>
  )
}

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-neutral-100 p-4">
          <div className="size-12 animate-pulse rounded-xl bg-neutral-100" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-xl bg-neutral-100" />
        </div>
      ))}
    </div>
  )
}

export function BodyModuleManager({ resource }: { resource: Resource }) {
  const { data, error, isLoading, mutate } = useSWR(`/api/admin/body-module/${resource}`, fetcher)
  const [search, setSearch] = useState("")
  const [pendingId, setPendingId] = useState<string | null>(null)

  const meta = META[resource]
  const HeaderIcon = meta.icon

  const allRows = useMemo(() => (data?.data ?? []) as Record<string, unknown>[], [data])
  const rows = useMemo(
    () => allRows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())),
    [allRows, search],
  )

  const stats = useMemo(() => {
    if (resource === "bookings") {
      const pending = allRows.filter((r) => r.status === "pending").length
      const confirmed = allRows.filter((r) => r.status === "confirmed").length
      const completed = allRows.filter((r) => r.status === "completed").length
      return [
        { label: "إجمالي الحجوزات", value: allRows.length, icon: Layers, chip: "bg-emerald-50 text-emerald-600" },
        { label: "قيد الانتظار", value: pending, icon: Clock, chip: "bg-amber-50 text-amber-600" },
        { label: "مؤكدة", value: confirmed, icon: CheckCircle2, chip: "bg-sky-50 text-sky-600" },
        { label: "مكتملة", value: completed, icon: Check, chip: "bg-teal-50 text-teal-600" },
      ]
    }
    if (resource === "reviews") {
      const approved = allRows.filter((r) => r.is_approved === true).length
      return [
        { label: "إجمالي التقييمات", value: allRows.length, icon: Layers, chip: "bg-emerald-50 text-emerald-600" },
        { label: "معتمدة وظاهرة", value: approved, icon: CheckCircle2, chip: "bg-teal-50 text-teal-600" },
        { label: "بانتظار الاعتماد", value: allRows.length - approved, icon: Clock, chip: "bg-amber-50 text-amber-600" },
      ]
    }
    const active = allRows.filter((r) => r.is_active !== false).length
    return [
      { label: "الإجمالي", value: allRows.length, icon: Layers, chip: "bg-emerald-50 text-emerald-600" },
      { label: "مفعّل وظاهر", value: active, icon: CheckCircle2, chip: "bg-teal-50 text-teal-600" },
      { label: "موقوف", value: allRows.length - active, icon: PauseCircle, chip: "bg-neutral-100 text-neutral-500" },
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
    <div dir="rtl" className="flex flex-col gap-6 text-neutral-900">
      <header className="flex flex-col gap-4 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <HeaderIcon className="size-7" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-neutral-950 text-balance sm:text-3xl">{meta.title}</h1>
            <p className="text-sm leading-relaxed text-neutral-500 sm:text-base">{meta.subtitle}</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
          <Layers className="size-4" />
          {isLoading ? "..." : `${allRows.length} عنصر`}
        </span>
      </header>

      <p className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-800">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
          <Check className="size-3" />
        </span>
        {meta.hint}
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const StatIcon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex flex-col gap-3 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm"
            >
              <span className={`flex size-10 items-center justify-center rounded-xl ${stat.chip}`}>
                <StatIcon className="size-5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-3xl font-black text-neutral-950">{isLoading ? "—" : stat.value}</span>
                <span className="text-sm text-neutral-500">{stat.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm">
        <label className="flex min-h-11 min-w-56 flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 transition-colors focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
          <Search className="size-4 shrink-0 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو أي تفاصيل..."
            className="w-full bg-transparent text-neutral-900 outline-none placeholder:text-neutral-400"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              aria-label="مسح البحث"
              className="text-neutral-400 transition-colors hover:text-neutral-600"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>
        <button
          onClick={() => mutate()}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
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
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-300">
            <HeaderIcon className="size-7" />
          </span>
          <p className="font-bold text-neutral-700">{search ? "لا توجد نتائج مطابقة للبحث." : "لا توجد بيانات بعد."}</p>
          <p className="max-w-md text-sm leading-relaxed text-neutral-500">
            {search
              ? "جرّب كلمة بحث مختلفة أو امسح البحث."
              : "إذا كنت شغّلت أكواد SQL في Supabase ولا تزال القائمة فارغة، اضغط تحديث."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-neutral-100 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/80 text-neutral-500">
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
                const imageUrl =
                  typeof row.image_url === "string" && row.image_url.startsWith("/") ? row.image_url : null
                const detail =
                  resource === "services"
                    ? `${row.price} د.إ • ${row.duration_minutes} دقيقة`
                    : resource === "bookings"
                      ? `${row.booking_date} • ${String(row.booking_time).slice(0, 5)}`
                      : resource === "reviews"
                        ? `${row.rating}/5 • ${String(row.comment_ar ?? "").slice(0, 60)}`
                        : String(row.slug ?? row.kind ?? "")
                const isPending = pendingId === id
                const bookingStatus = BOOKING_STATUS[String(row.status)]

                return (
                  <tr key={id} className="border-b border-neutral-50 transition-colors last:border-0 hover:bg-emerald-50/40">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <Image
                            src={imageUrl || "/placeholder.svg"}
                            alt={name}
                            width={48}
                            height={48}
                            className="size-12 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <HeaderIcon className="size-5" />
                          </span>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-900">{name}</span>
                          {resource === "bookings" && row.phone ? (
                            <a
                              href={`tel:${row.phone}`}
                              dir="ltr"
                              className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                            >
                              <Phone className="size-3" />
                              {String(row.phone)}
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600">{detail}</td>
                    <td className="p-4">
                      {resource === "bookings" ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                            bookingStatus?.className ?? "bg-neutral-100 text-neutral-500 border-neutral-200"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${bookingStatus?.dot ?? "bg-neutral-400"}`} />
                          {bookingStatus?.label ?? String(row.status)}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                            (row.is_active ?? row.is_approved) !== false && (row.is_active ?? row.is_approved) !== null
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-neutral-200 bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              (row.is_active ?? row.is_approved) !== false && (row.is_active ?? row.is_approved) !== null
                                ? "bg-emerald-500"
                                : "bg-neutral-400"
                            }`}
                          />
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
                          <Loader2 className="size-4 animate-spin text-emerald-600" />
                        ) : resource === "bookings" ? (
                          <>
                            {row.status === "pending" ? (
                              <button
                                onClick={() => patch(id, { status: "confirmed" })}
                                className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                              >
                                <Check className="size-3.5" />
                                تأكيد
                              </button>
                            ) : null}
                            {row.status === "confirmed" ? (
                              <button
                                onClick={() => patch(id, { status: "completed" })}
                                className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-sky-600 px-3.5 text-xs font-bold text-white transition-colors hover:bg-sky-700"
                              >
                                <Check className="size-3.5" />
                                اكتمل
                              </button>
                            ) : null}
                            {row.status !== "cancelled" && row.status !== "completed" ? (
                              <button
                                onClick={() => patch(id, { status: "cancelled" })}
                                className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-red-200 bg-white px-3.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                              >
                                <X className="size-3.5" />
                                إلغاء
                              </button>
                            ) : null}
                          </>
                        ) : resource === "reviews" ? (
                          <button
                            onClick={() => patch(id, { is_approved: !row.is_approved })}
                            className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold transition-colors ${
                              row.is_approved
                                ? "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {row.is_approved ? (
                              <ToggleLeft className="size-4" />
                            ) : (
                              <ToggleRight className="size-4" />
                            )}
                            {row.is_approved ? "إلغاء الاعتماد" : "اعتماد"}
                          </button>
                        ) : (
                          <button
                            onClick={() => patch(id, { is_active: row.is_active === false })}
                            className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-bold transition-colors ${
                              row.is_active !== false
                                ? "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {row.is_active !== false ? (
                              <ToggleLeft className="size-4" />
                            ) : (
                              <ToggleRight className="size-4" />
                            )}
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
