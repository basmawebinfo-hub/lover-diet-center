"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import {
  adminFetchAuditLog,
  adminFetchAuditLogCount,
  adminFetchAuditAdmins,
  type AuditLogEntry,
  type AuditLogFilter,
} from "@/lib/supabase/db"
import { useLocale, t } from "@/lib/locale"
import {
  RefreshCw,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Filter,
} from "lucide-react"

const PAGE_SIZE = 20

const ACTION_OPTIONS = [
  { key: "", en: "All actions", ar: "كل الإجراءات" },
  { key: "create", en: "Create", ar: "إنشاء" },
  { key: "update", en: "Update", ar: "تحديث" },
  { key: "upsert", en: "Save", ar: "حفظ" },
  { key: "delete", en: "Delete", ar: "حذف" },
  { key: "assign", en: "Assign", ar: "تعيين" },
  { key: "unassign", en: "Unassign", ar: "إلغاء التعيين" },
  { key: "status_change", en: "Status change", ar: "تغيير الحالة" },
  { key: "cancel", en: "Cancel", ar: "إلغاء" },
  { key: "block", en: "Block", ar: "حظر" },
  { key: "unblock", en: "Unblock", ar: "رفع الحظر" },
  { key: "upload", en: "Upload", ar: "رفع ملف" },
] as const

const TARGET_OPTIONS = [
  { key: "", en: "All targets", ar: "كل الأنواع" },
  { key: "orders", en: "Orders", ar: "الطلبات" },
  { key: "meals", en: "Meals", ar: "الوجبات" },
  { key: "products", en: "Products", ar: "المنتجات" },
  { key: "meal_plans", en: "Meal plans", ar: "خطط الوجبات" },
  { key: "plan_items", en: "Plan items", ar: "بنود الخطة" },
  { key: "profiles", en: "Clients", ar: "العملاء" },
  { key: "sessions", en: "Sessions", ar: "الجلسات" },
  { key: "meal-images", en: "Meal images", ar: "صور الوجبات" },
  { key: "product-images", en: "Product images", ar: "صور المنتجات" },
] as const

function ago(iso: string, locale: "en" | "ar"): string {
  if (!iso) return ""
  const s = (Date.now() - Date.parse(iso)) / 1000
  if (Number.isNaN(s)) return iso
  if (s < 60) return locale === "ar" ? "الآن" : "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return locale === "ar" ? `منذ ${m} د` : `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return locale === "ar" ? `منذ ${h} س` : `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return locale === "ar" ? `منذ ${d} ي` : `${d}d ago`
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar" : "en", {
    year: "numeric", month: "short", day: "numeric",
  })
}

function actionTone(action: string): { bg: string; text: string } {
  if (action === "delete" || action === "cancel" || action === "block")
    return { bg: "bg-rose-100", text: "text-rose-700" }
  if (action === "create" || action === "upload" || action === "unblock")
    return { bg: "bg-emerald-100", text: "text-emerald-700" }
  if (action === "update" || action === "upsert")
    return { bg: "bg-sky-100", text: "text-sky-700" }
  if (action === "assign" || action === "unassign")
    return { bg: "bg-violet-100", text: "text-violet-700" }
  if (action === "status_change")
    return { bg: "bg-amber-100", text: "text-amber-700" }
  return { bg: "bg-neutral-100", text: "text-neutral-700" }
}

function targetLabel(target: string, locale: "en" | "ar"): string {
  const found = TARGET_OPTIONS.find((o) => o.key === target)
  return found ? t(locale, found.en, found.ar) : target
}

function actionLabel(action: string, locale: "en" | "ar"): string {
  const found = ACTION_OPTIONS.find((o) => o.key === action)
  return found ? t(locale, found.en, found.ar) : action
}

type Row = AuditLogEntry & { expanded?: boolean }

export default function AdminAuditPage() {
  const { locale } = useLocale()

  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [admins, setAdmins] = useState<{ id: string; name: string }[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filter state
  const [actionFilter, setActionFilter] = useState<string>("")
  const [targetFilter, setTargetFilter] = useState<string>("")
  const [adminFilter, setAdminFilter] = useState<string>("")
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [searchQ, setSearchQ] = useState<string>("")
  const [searchDebounced, setSearchDebounced] = useState<string>("")

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setSearchDebounced(searchQ.trim()), 250)
    return () => clearTimeout(id)
  }, [searchQ])

  const filter = useMemo<AuditLogFilter>(
    () => ({
      action: actionFilter || undefined,
      targetTable: targetFilter || undefined,
      adminId: adminFilter || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      search: searchDebounced || undefined,
    }),
    [actionFilter, targetFilter, adminFilter, fromDate, toDate, searchDebounced],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pageRows, count] = await Promise.all([
        adminFetchAuditLog(page, PAGE_SIZE, filter),
        adminFetchAuditLogCount(filter),
      ])
      setRows(pageRows)
      setTotal(count)
    } catch (e) {
      setError((e as Error)?.message ?? "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    void load()
  }, [load])

  // Load admins for the filter dropdown once
  useEffect(() => {
    void adminFetchAuditAdmins().then(setAdmins)
  }, [])

  // Reset to page 0 whenever filters change
  useEffect(() => {
    setPage(0)
  }, [actionFilter, targetFilter, adminFilter, fromDate, toDate, searchDebounced])

  const hasActiveFilter =
    !!(actionFilter || targetFilter || adminFilter || fromDate || toDate || searchDebounced)

  const clearFilters = () => {
    setActionFilter("")
    setTargetFilter("")
    setAdminFilter("")
    setFromDate("")
    setToDate("")
    setSearchQ("")
    setSearchDebounced("")
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const showingStart = total > 0 ? page * PAGE_SIZE + 1 : 0
  const showingEnd = Math.min(total, (page + 1) * PAGE_SIZE)

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              {t(locale, "Admin", "الإدارة")}
            </p>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
              <ClipboardList className="size-7 text-emerald-600" />
              {t(locale, "Audit log", "سجل التدقيق")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              aria-expanded={filtersOpen}
              aria-controls="audit-filters"
            >
              <Filter className="size-4" />
              {t(locale, "Filters", "المرشحات")}
              {hasActiveFilter && (
                <span className="inline-block size-2 rounded-full bg-emerald-500" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              aria-label={t(locale, "Refresh", "تحديث")}
            >
              <RefreshCw className="size-4" />
              {t(locale, "Refresh", "تحديث")}
            </button>
          </div>
        </div>

        {/* Filters */}
        {filtersOpen && (
          <div
            id="audit-filters"
            className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {t(locale, "Action", "الإجراء")}
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {ACTION_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {t(locale, o.en, o.ar)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {t(locale, "Target", "النوع")}
                </label>
                <select
                  value={targetFilter}
                  onChange={(e) => setTargetFilter(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  {TARGET_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {t(locale, o.en, o.ar)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {t(locale, "Admin", "المسؤول")}
                </label>
                <select
                  value={adminFilter}
                  onChange={(e) => setAdminFilter(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="">{t(locale, "All admins", "كل المسؤولين")}</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="audit-search"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
                >
                  {t(locale, "Search (target id)", "بحث (رقم العنصر)")}
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                    aria-hidden="true"
                  />
                  <input
                    id="audit-search"
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder={t(locale, "e.g. 3f7c...", "مثال 3f7c...")}
                    className="w-full rounded-2xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="audit-from"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
                >
                  {t(locale, "From date", "من تاريخ")}
                </label>
                <input
                  id="audit-from"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label
                  htmlFor="audit-to"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
                >
                  {t(locale, "To date", "إلى تاريخ")}
                </label>
                <input
                  id="audit-to"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
            {hasActiveFilter && (
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 rounded"
                >
                  {t(locale, "Clear filters", "مسح المرشحات")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content states */}
        {loading ? (
          <LoadingBlock />
        ) : error ? (
          <ErrorBlock locale={locale} message={error} onRetry={() => void load()} />
        ) : rows.length === 0 ? (
          <EmptyBlock locale={locale} hasFilter={hasActiveFilter} onClear={clearFilters} />
        ) : (
          <>
            <div className="rounded-3xl border border-neutral-100 bg-white shadow-sm">
              <ul className="divide-y divide-neutral-100">
                {rows.map((r) => (
                  <AuditRow
                    key={r.id}
                    row={r}
                    expanded={!!expanded[r.id]}
                    onToggle={() => setExpanded((s) => ({ ...s, [r.id]: !s[r.id] }))}
                    locale={locale}
                  />
                ))}
              </ul>
            </div>
            <PaginationBar
              locale={locale}
              page={page}
              pageCount={pageCount}
              start={showingStart}
              end={showingEnd}
              total={total}
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            />
          </>
        )}
      </div>
    </AdminShell>
  )
}

function AuditRow({
  row,
  expanded,
  onToggle,
  locale,
}: {
  row: Row
  expanded: boolean
  onToggle: () => void
  locale: "en" | "ar"
}) {
  const tone = actionTone(row.action)
  const hasDiff = row.diff && typeof row.diff === "object" && Object.keys(row.diff).length > 0
  return (
    <li className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone.bg} ${tone.text}`}
          >
            {actionLabel(row.action, locale)}
          </span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
            {targetLabel(row.targetTable, locale)}
          </span>
          <span className="font-mono text-xs text-neutral-500" title={row.targetId}>
            {row.targetId.length > 12 ? `${row.targetId.slice(0, 6)}...${row.targetId.slice(-4)}` : row.targetId}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span title={row.createdAt}>{ago(row.createdAt, locale)}</span>
          {hasDiff && (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-0.5 font-semibold text-neutral-600 hover:border-emerald-200 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              {t(locale, "Details", "تفاصيل")}
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-neutral-600">
        <span className="font-semibold text-neutral-800">
          {row.adminName || t(locale, "Unknown admin", "مسؤول غير معروف")}
        </span>
        {"  "}
        <span className="text-neutral-400" title={row.createdAt}>
          {new Date(row.createdAt).toLocaleString(locale === "ar" ? "ar" : "en")}
        </span>
      </p>
      {expanded && hasDiff && (
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-neutral-900 p-4 text-xs text-neutral-100" aria-label={t(locale, "Diff details", "تفاصيل التغيير")}>
          {JSON.stringify(row.diff, null, 2)}
        </pre>
      )}
    </li>
  )
}

function PaginationBar({
  locale,
  page,
  pageCount,
  start,
  end,
  total,
  onPrev,
  onNext,
}: {
  locale: "en" | "ar"
  page: number
  pageCount: number
  start: number
  end: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  const canPrev = page > 0
  const canNext = page < pageCount - 1
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm sm:flex-row">
      <p className="text-sm text-neutral-500">
        {t(
          locale,
          `Showing ${start}-${end} of ${total}`,
          `عرض ${start}-${end} من ${total}`,
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t(locale, "Previous page", "الصفحة السابقة")}
        >
          <ChevronLeft className="size-4" />
          {t(locale, "Prev", "السابق")}
        </button>
        <span className="text-sm font-semibold text-neutral-800">
          {page + 1} / {pageCount}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t(locale, "Next page", "الصفحة التالية")}
        >
          {t(locale, "Next", "التالي")}
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

function LoadingBlock(): ReactNode {
  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
        ))}
      </div>
    </div>
  )
}

function ErrorBlock({
  locale,
  message,
  onRetry,
}: {
  locale: "en" | "ar"
  message: string
  onRetry: () => void
}) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertTriangle className="size-6" />
      </div>
      <h2 className="text-lg font-bold text-rose-900">
        {t(locale, "Could not load audit log", "تعذر تحميل سجل التدقيق")}
      </h2>
      <p className="mt-1 text-sm text-rose-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
      >
        {t(locale, "Try again", "حاول مجددًا")}
      </button>
    </div>
  )
}

function EmptyBlock({
  locale,
  hasFilter,
  onClear,
}: {
  locale: "en" | "ar"
  hasFilter: boolean
  onClear: () => void
}) {
  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
        <ClipboardList className="size-6" />
      </div>
      <h2 className="text-lg font-bold text-neutral-900">
        {hasFilter
          ? t(locale, "No entries match your filters", "لا توجد سجلات تطابق المرشحات")
          : t(locale, "No audit entries yet", "لا توجد سجلات تدقيق بعد")}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        {hasFilter
          ? t(locale, "Try adjusting or clearing filters.", "جرّب تعديل أو مسح المرشحات.")
          : t(
              locale,
              "Admin actions are recorded here automatically.",
              "تُسجَّل الإجراءات الإدارية هنا تلقائيًا.",
            )}
      </p>
      {hasFilter && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          {t(locale, "Clear filters", "مسح المرشحات")}
        </button>
      )}
    </div>
  )
}
