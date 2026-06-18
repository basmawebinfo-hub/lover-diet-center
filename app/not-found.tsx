import Link from 'next/link'
import { Leaf, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-lime-50 text-lime-600">
        <Leaf className="size-8" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900">الصفحة غير موجودة</h1>
      <p className="mt-1 text-lg text-neutral-400">Page not found</p>
      <p className="mt-3 max-w-md text-pretty text-neutral-500">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link
        href="/"
        className="mt-8 flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg"
      >
        <ArrowLeft className="size-4" />
        العودة للرئيسية
      </Link>
    </div>
  )
}
