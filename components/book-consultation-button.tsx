"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Props = {
  /** session type passed to the booking form, e.g. "consultation" */
  type?: string
  /** "primary" = filled lime, "light" = white-on-color (for CTA section) */
  variant?: "primary" | "light"
  label?: string
  className?: string
}

export function BookConsultationButton({ type = "consultation", variant = "primary", label = "Book a Consultation", className = "" }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setStatus(data.user ? "authed" : "guest")
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setStatus(session?.user ? "authed" : "guest")
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleClick = () => {
    if (status === "authed") {
      // Logged in -> straight to the booking form, pre-filled
      router.push(`/dashboard/sessions?book=1&type=${type}`)
    } else {
      // Guest -> create account / sign in, then come back to booking
      const redirect = encodeURIComponent(`/dashboard/sessions?book=1&type=${type}`)
      router.push(`/sign-up?redirect=${redirect}`)
    }
  }

  const base =
    variant === "light"
      ? "bg-white text-lime-800 hover:bg-neutral-100"
      : "bg-gradient-to-b from-lime-400 to-lime-500 text-lime-950 shadow-lg shadow-lime-500/40 hover:-translate-y-0.5"

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold transition-all disabled:opacity-70 ${base} ${className}`}
    >
      {status === "loading" ? (
        <><Loader2 className="size-4 animate-spin" /> Loading…</>
      ) : status === "authed" ? (
        <>{label} <ArrowRight className="size-4" /></>
      ) : (
        <><LogIn className="size-4" /> {label}</>
      )}
    </button>
  )
}
