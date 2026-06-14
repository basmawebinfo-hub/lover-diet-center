'use client'

'use client'

import { useEffect } from 'react'
import { Leaf, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <Leaf className="size-8" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900">Something went wrong</h1>
      <p className="mt-3 max-w-md text-pretty text-neutral-500">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={reset}
        className="mt-8 flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg"
      >
        <RefreshCcw className="size-4" />
        Try again
      </button>
    </div>
  )
}