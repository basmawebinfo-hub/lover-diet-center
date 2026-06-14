import { Leaf } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <Leaf className="size-7" />
        </span>
        <div className="size-6 animate-spin rounded-full border-2 border-teal-300 border-t-teal-600" />
      </div>
    </div>
  )
}