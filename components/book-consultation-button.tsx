"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { waLink } from "@/lib/site"
import { useLocale, t } from "@/lib/locale"

type Props = {
  /** session type passed to the booking form, e.g. "consultation" */
  type?: string
  /** "primary" = filled lime, "light" = white-on-color (for CTA section) */
  variant?: "primary" | "light"
  label?: string
  className?: string
}

/**
 * Books a session. Never asks a visitor to register first.
 *
 * Signed in  -> straight to the booking form, pre-filled.
 * Guest      -> WhatsApp, with the session type already in the message.
 *
 * This used to push guests to /sign-up?redirect=… — a registration wall in
 * front of the primary conversion action on the site. Sessions are stored per
 * user (the RLS policy keys on auth.uid()), so a guest genuinely cannot create
 * one from the browser; WhatsApp is how the business already takes those
 * bookings, and it costs the visitor nothing.
 */
export function BookConsultationButton({
  type = "consultation",
  variant = "primary",
  label = "Book a Consultation",
  className = "",
}: Props) {
  const router = useRouter()
  const { locale } = useLocale()
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

  const guestHref = waLink(
    t(
      locale,
      `Hello, I'd like to book a ${type.replace(/_/g, " ")} at Lover Diet Center.`,
      `مرحباً، أرغب في حجز ${type === "body_sculpting" ? "جلسة نحت قوام" : "استشارة"} في Lover Diet Center.`,
    ),
  )

  const base =
    variant === "light"
      ? "bg-white text-lime-800 hover:bg-neutral-100"
      : "bg-gradient-to-b from-lime-400 to-lime-500 text-lime-950 shadow-lg shadow-lime-500/40 hover:-translate-y-0.5"

  const classes = `inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold transition-all disabled:opacity-70 ${base} ${className}`

  // Render the guest path as a real anchor so it behaves like a link:
  // middle-click, long-press and "open in new tab" all work.
  if (status === "guest") {
    return (
      <a href={guestHref} target="_blank" rel="noopener noreferrer" className={classes}>
        <MessageCircle className="size-4" />
        {label}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => router.push(`/dashboard/sessions?book=1&type=${type}`)}
      disabled={status === "loading"}
      className={classes}
    >
      {status === "loading" ? (
        <><Loader2 className="size-4 animate-spin" /> {t(locale, "Loading…", "جارٍ التحميل…")}</>
      ) : (
        <>{label} <ArrowRight className="size-4 rtl:rotate-180" /></>
      )}
    </button>
  )
}
