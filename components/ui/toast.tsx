"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { Check, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Toast = { id: number; message: string; tone: "success" | "error" }
type ToastCtx = { notify: (message: string, tone?: "success" | "error") => void }

const Ctx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-2",
              t.tone === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-500 text-white"
            )}
          >
            {t.tone === "success" ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  // Safe no-op fallback if provider is missing, so pages never crash.
  if (!ctx) return { notify: () => {} }
  return ctx
}
