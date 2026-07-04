"use client"

// App store — simple React context + useReducer with localStorage persistence.
// Replace with Zustand or RTK Query once the backend lands.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react"
import type {
  CartItem,
  DoctorPlan,
  Locale,
  Meal,
  Order,
  Product,
  Session,
  User,
  WaterLog,
  WeightLog,
  UserNotification,
} from "./types"

// A patch that widens WeightLog to accept null for the two nullable columns
// (bodyFatPct, note), so the Weight Tracker can send "clear this value" through
// the same reducer/DB path used for regular edits.
export type WeightLogPatch = {
  date?: string
  weightKg?: number
  bodyFatPct?: number | null
  note?: string | null
}

import { createClient } from "@/lib/supabase/client"
import { fetchSessions, fetchWeightLogs, insertSession, insertWeightLog, updateWeightLog, deleteWeightLog, fetchProfile, fetchWaterLogs, fetchProducts, fetchMeals, fetchUserOrders, fetchUserPlan, fetchNotifications, markNotificationRead as dbMarkNotificationRead, markAllNotificationsRead as dbMarkAllNotificationsRead } from "@/lib/supabase/db"


type AppState = {
  hydrated: boolean
  authChecked: boolean
  user: User | null
  weightLogs: WeightLog[]
  meals: Meal[]
  products: Product[]
  sessions: Session[]
  doctorPlan: DoctorPlan | null
  cart: CartItem[]
  orders: Order[]
  waterLogs: WaterLog[]
  locale: Locale
  hasSeenIntro: boolean
  notifications: UserNotification[]
}

type Action =
  | { type: "HYDRATE"; payload: Omit<AppState, "hydrated"> }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOG_WEIGHT"; payload: WeightLog }
  | { type: "UPDATE_WEIGHT_LOG"; payload: { id: string; patch: WeightLogPatch } }
  | { type: "DELETE_WEIGHT_LOG"; payload: string }
  | { type: "ADD_TO_CART"; payload: { productId: string; quantity?: number } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QTY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LOCALE"; payload: Locale }
  | { type: "MARK_INTRO_SEEN" }
  | { type: "UPDATE_AVATAR"; payload: User["avatarConfig"] }
  | { type: "UPDATE_PLAN"; payload: DoctorPlan }
  | { type: "CLEAR_PLAN" }
  | { type: "ADD_SESSION"; payload: Session }
  | { type: "UPDATE_SESSION"; payload: { id: string; changes: Partial<Session> } }
  | { type: "PLACE_ORDER"; payload: Order }
  | { type: "LOG_WATER"; payload: WaterLog }
  | { type: "SYNC_FROM_DB"; payload: { sessions?: Session[]; weightLogs?: WeightLog[]; waterLogs?: WaterLog[]; orders?: Order[] } }
  | { type: "SET_CATALOG"; payload: { products?: Product[]; meals?: Meal[] } }
  | { type: "AUTH_CHECKED" }
  | { type: "SET_NOTIFICATIONS"; payload: UserNotification[] }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }

const STORAGE_KEY = "loversdc:state:v1"

const initialState: AppState = {
  hydrated: false,
  authChecked: false,
  user: null,
  weightLogs: [],
  meals: [],
  products: [],
  sessions: [],
  doctorPlan: null,
  cart: [],
  orders: [],
  waterLogs: [],
  locale: "en",
  hasSeenIntro: false,
  notifications: [],
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true }
    case "AUTH_CHECKED":
      return { ...state, authChecked: true }
    case "SET_USER":
      return { ...state, user: action.payload }
    case "LOG_WEIGHT": {
      // Replace same-day entry, then prepend
      const date = action.payload.date
      const filtered = state.weightLogs.filter((l) => l.date !== date)
      const next = [action.payload, ...filtered].sort((a, b) =>
        a.date < b.date ? 1 : -1
      )
      const user = state.user
        ? {
            ...state.user,
            currentWeightKg: action.payload.weightKg,
          }
        : state.user
      return { ...state, weightLogs: next, user }
    }
    case "UPDATE_WEIGHT_LOG": {
      // Merge the patch into the matching log. If the date changed, drop any
      // existing same-day log for another id so we preserve one-per-day.
      // Nulls in bodyFatPct/note mean "clear the value"; we normalise them to
      // undefined so the state shape stays inside WeightLog.
      const { id, patch } = action.payload
      const target = state.weightLogs.find((l) => l.id === id)
      if (!target) return state
      const merged: WeightLog = {
        ...target,
        ...(patch.date !== undefined ? { date: patch.date } : {}),
        ...(patch.weightKg !== undefined ? { weightKg: patch.weightKg } : {}),
        ...(patch.bodyFatPct !== undefined
          ? { bodyFatPct: patch.bodyFatPct === null ? undefined : patch.bodyFatPct }
          : {}),
        ...(patch.note !== undefined
          ? { note: patch.note === null ? undefined : patch.note }
          : {}),
      }
      const newDate = patch.date
      const dateChanged = typeof newDate === "string" && newDate !== target.date
      const collidingByDate = dateChanged
        ? state.weightLogs.filter((l) => l.date !== newDate || l.id === id)
        : state.weightLogs
      const next = collidingByDate
        .map((l) => (l.id === id ? merged : l))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
      // If the edited entry is now the newest, mirror its weight onto user.currentWeightKg.
      const newest: WeightLog | undefined = next[0]
      const user =
        state.user && newest && newest.id === merged.id
          ? { ...state.user, currentWeightKg: newest.weightKg }
          : state.user
      return { ...state, weightLogs: next, user }
    }
    case "DELETE_WEIGHT_LOG": {
      const removedId = action.payload
      const priorNewestId: string | undefined = state.weightLogs[0]?.id
      const wasNewest = priorNewestId === removedId
      const next = state.weightLogs.filter((l) => l.id !== removedId)
      // If we removed the most-recent log, snap user.currentWeightKg back to
      // whatever the new most-recent log says. If we removed the LAST log
      // entirely, leave currentWeightKg as-is (that value is the profile
      // snapshot, not tied to log existence).
      const newest: WeightLog | undefined = next[0]
      const user =
        state.user && wasNewest && newest
          ? { ...state.user, currentWeightKg: newest.weightKg }
          : state.user
      return { ...state, weightLogs: next, user }
    }
    case "ADD_TO_CART": {
      const { productId, quantity = 1 } = action.payload
      const existing = state.cart.find((c) => c.productId === productId)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.productId === productId ? { ...c, quantity: c.quantity + quantity } : c
          ),
        }
      }
      return { ...state, cart: [...state.cart, { productId, quantity }] }
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((c) => c.productId !== action.payload) }
    case "UPDATE_CART_QTY":
      return {
        ...state,
        cart: state.cart
          .map((c) =>
            c.productId === action.payload.productId
              ? { ...c, quantity: action.payload.quantity }
              : c
          )
          .filter((c) => c.quantity > 0),
      }
    case "CLEAR_CART":
      return { ...state, cart: [] }
    case "SET_LOCALE":
      return { ...state, locale: action.payload }
    case "MARK_INTRO_SEEN":
      return { ...state, hasSeenIntro: true }
    case "UPDATE_AVATAR":
      return state.user ? { ...state, user: { ...state.user, avatarConfig: action.payload } } : state
    case "UPDATE_PLAN":
      return { ...state, doctorPlan: action.payload }
    case "CLEAR_PLAN":
      return { ...state, doctorPlan: null }
    case "ADD_SESSION":
      return { ...state, sessions: [action.payload, ...state.sessions] }
    case "UPDATE_SESSION":
      return {
        ...state,
        sessions: state.sessions.map((sn) =>
          sn.id === action.payload.id ? { ...sn, ...action.payload.changes } : sn
        ),
      }
    case "PLACE_ORDER":
      return { ...state, orders: [action.payload, ...state.orders], cart: [] }
    case "LOG_WATER": {
      const filtered = state.waterLogs.filter((w) => w.date !== action.payload.date)
      return { ...state, waterLogs: [action.payload, ...filtered] }
    }
    case "SYNC_FROM_DB":
      return {
        ...state,
        sessions: action.payload.sessions ?? state.sessions,
        weightLogs: action.payload.weightLogs ?? state.weightLogs,
        waterLogs: action.payload.waterLogs ?? state.waterLogs,
        orders: action.payload.orders ?? state.orders,
      }
    case "SET_CATALOG":
      return {
        ...state,
        products: action.payload.products ?? state.products,
        meals: action.payload.meals ?? state.meals,
      }
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload }
    case "MARK_NOTIFICATION_READ": {
      const now = new Date().toISOString()
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload && !n.readAt ? { ...n, readAt: now } : n,
        ),
      }
    }
    case "MARK_ALL_NOTIFICATIONS_READ": {
      const now = new Date().toISOString()
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.readAt ? n : { ...n, readAt: now },
        ),
      }
    }
    default:
      return state
  }
}

type AppContextValue = {
  state: AppState
  setUser: (u: User | null) => void
  logWeight: (log: WeightLog) => Promise<boolean>
  editWeight: (id: string, patch: WeightLogPatch) => Promise<boolean>
  removeWeight: (id: string) => Promise<boolean>
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQty: (productId: string, quantity: number) => void
  clearCart: () => void
  setLocale: (l: Locale) => void
  markIntroSeen: () => void
  updateAvatar: (cfg: User["avatarConfig"]) => void
  updatePlan: (plan: DoctorPlan) => void
  refreshPlan: () => Promise<void>
  addSession: (s: Session) => void
  refreshSessions: () => Promise<void>
  refreshOrders: () => Promise<void>
  refreshNotifications: () => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  updateSession: (id: string, changes: Partial<Session>) => void
  placeOrderLocal: (order: Order) => void
  logWater: (date: string, liters: number) => void
  resetOnboarding: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Omit<AppState, "hydrated">
        dispatch({ type: "HYDRATE", payload: parsed })
        return
      }
    } catch {
      // ignore parse errors
    }
    // Check for legacy loverDietUser (from onboarding save)
    try {
      const legacy = window.localStorage.getItem("loverDietUser")
      if (legacy) {
        const parsed = JSON.parse(legacy) as User
        dispatch({
          type: "HYDRATE",
          payload: {
            ...initialState,
            user: parsed,
            // Real user starts with a clean slate — no fake logs/sessions.
            // meals/products are a shared catalog; doctorPlan is assigned by the clinic.
            meals: [],
            products: [],
            doctorPlan: null,
          },
        })
        return
      }
    } catch {
      // ignore
    }
    // First-time visitor — NO fake user. They go through onboarding.
    // Only the shared catalog (meals/products) is preloaded so browsing works.
    dispatch({
      type: "HYDRATE",
      payload: {
        ...initialState,
        user: null,
        meals: [],
        products: [],
        doctorPlan: null,
      },
    })
  }, [])

  // Persist on every change
  useEffect(() => {
    if (!state.hydrated || typeof window === "undefined") return
    const { hydrated: _hydrated, ...rest } = state
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
    } catch {
      // quota exceeded — ignore for now
    }
  }, [state])

  // Load the public catalog (products + meals) from Supabase for everyone
  useEffect(() => {
    if (!state.hydrated) return
    let active = true
    Promise.all([fetchProducts(), fetchMeals()]).then(([products, meals]) => {
      if (!active) return
      dispatch({ type: "SET_CATALOG", payload: { products, meals } })
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated])

  // Once hydrated, pull the signed-in user's real data from Supabase
  useEffect(() => {
    if (!state.hydrated) return
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return
      if (!data.user) { dispatch({ type: "AUTH_CHECKED" }); return }
      const uid = data.user.id
      const [profile, sessions, weightLogs, waterLogs, orders, plan] = await Promise.all([
        fetchProfile(uid),
        fetchSessions(uid),
        fetchWeightLogs(uid),
        fetchWaterLogs(uid),
        fetchUserOrders(uid),
        fetchUserPlan(uid),
      ])
      if (!active) return
      // Blocked clients are signed out and redirected
      if (profile && (profile as { blocked?: boolean }).blocked) {
        await supabase.auth.signOut()
        if (typeof window !== "undefined") window.location.href = "/blocked"
        return
      }
      // Admins belong in the admin panel, never the client dashboard.
      // Redirect them there unless they are already inside /admin.
      if (
        profile &&
        (profile as { role?: string }).role === "admin" &&
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/admin")
      ) {
        window.location.href = "/admin"
        return
      }
      // Merge the real DB profile into the user (DB is the source of truth)
      if (profile) {
        dispatch({
          type: "SET_USER",
          payload: {
            ...(state.user as User),
            ...profile,
            id: uid,
            email: profile.email || data.user.email || "",
            role: (profile as { role?: "user" | "admin" }).role,
          } as User,
        })
      }
      dispatch({
        type: "SYNC_FROM_DB",
        payload: {
          sessions: sessions.length ? sessions : undefined,
          weightLogs: weightLogs.length ? weightLogs : undefined,
          waterLogs: waterLogs.length ? waterLogs : undefined,
          orders: orders.length ? orders : undefined,
        },
      })
      if (plan) dispatch({ type: "UPDATE_PLAN", payload: plan })
      dispatch({ type: "AUTH_CHECKED" })
    }).catch(() => {
      // Network/auth error — don't trap the user on a loading screen.
      if (active) dispatch({ type: "AUTH_CHECKED" })
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated])

  // Apply a pending cart item saved before sign-up (guest -> shop -> sign-up flow)
  useEffect(() => {
    if (!state.hydrated || !state.user || typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem("pendingCart")
      if (raw) {
        const { productId, quantity } = JSON.parse(raw) as { productId: string; quantity?: number }
        if (productId) dispatch({ type: "ADD_TO_CART", payload: { productId, quantity: quantity ?? 1 } })
        window.localStorage.removeItem("pendingCart")
      }
    } catch { /* ignore */ }
  }, [state.hydrated, state.user])

  const setUser = useCallback((u: User | null) => dispatch({ type: "SET_USER", payload: u }), [])
  const logWeight = useCallback(
    async (log: WeightLog): Promise<boolean> => {
      // Persist to Supabase FIRST when signed in, then reflect in local state.
      // If the DB write fails, we still mirror locally so the UI is not stuck,
      // but we return false so the caller can surface the error.
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      let ok = true
      if (data.user) {
        try {
          await insertWeightLog(data.user.id, log)
        } catch {
          ok = false
        }
      }
      dispatch({ type: "LOG_WEIGHT", payload: log })
      return ok
    },
    []
  )
  const editWeight = useCallback(
    async (id: string, patch: WeightLogPatch): Promise<boolean> => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      let ok = true
      if (data.user) {
        try {
          const dbPatch: {
            weightKg?: number
            bodyFatPct?: number | null
            note?: string | null
            date?: string
          } = {}
          if (patch.weightKg !== undefined) dbPatch.weightKg = patch.weightKg
          if (patch.bodyFatPct !== undefined) dbPatch.bodyFatPct = patch.bodyFatPct ?? null
          if (patch.note !== undefined) dbPatch.note = patch.note ?? null
          if (patch.date !== undefined) dbPatch.date = patch.date
          ok = await updateWeightLog(data.user.id, id, dbPatch)
        } catch {
          ok = false
        }
      }
      if (ok) dispatch({ type: "UPDATE_WEIGHT_LOG", payload: { id, patch } })
      return ok
    },
    []
  )
  const removeWeight = useCallback(
    async (id: string): Promise<boolean> => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      let ok = true
      if (data.user) {
        try {
          ok = await deleteWeightLog(data.user.id, id)
        } catch {
          ok = false
        }
      }
      if (ok) dispatch({ type: "DELETE_WEIGHT_LOG", payload: id })
      return ok
    },
    []
  )
  const addToCart = useCallback(
    (productId: string, quantity = 1) =>
      dispatch({ type: "ADD_TO_CART", payload: { productId, quantity } }),
    []
  )
  const removeFromCart = useCallback(
    (productId: string) => dispatch({ type: "REMOVE_FROM_CART", payload: productId }),
    []
  )
  const updateCartQty = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: "UPDATE_CART_QTY", payload: { productId, quantity } }),
    []
  )
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), [])
  const setLocale = useCallback((l: Locale) => dispatch({ type: "SET_LOCALE", payload: l }), [])
  const markIntroSeen = useCallback(() => dispatch({ type: "MARK_INTRO_SEEN" }), [])
  const updateAvatar = useCallback(
    (cfg: User["avatarConfig"]) => dispatch({ type: "UPDATE_AVATAR", payload: cfg }),
    []
  )
  const updatePlan = useCallback(
    (plan: DoctorPlan) => dispatch({ type: "UPDATE_PLAN", payload: plan }),
    []
  )
  const refreshPlan = useCallback(async () => {
    // Pull the latest meal_plans + plan_items for the signed-in user straight
    // from the DB. This catches plan edits an admin made after the user's
    // initial hydration. If the fetch returns null we clear any stale local
    // plan so the empty-state renders.
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    const plan = await fetchUserPlan(data.user.id)
    if (plan) {
      dispatch({ type: "UPDATE_PLAN", payload: plan })
    } else {
      dispatch({ type: "CLEAR_PLAN" })
    }
  }, [])
  const addSession = useCallback(
    (s: Session) => {
      dispatch({ type: "ADD_SESSION", payload: s })
      // Sync to Supabase if signed in (non-blocking)
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) insertSession(data.user.id, s).catch(() => {})
      })
    },
    []
  )
  const refreshSessions = useCallback(async () => {
    // Pull the latest sessions for the signed-in user straight from the DB.
    // This catches sessions an admin booked after the user already loaded the app.
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    const sessions = await fetchSessions(data.user.id)
    dispatch({ type: "SYNC_FROM_DB", payload: { sessions } })
  }, [])
  const refreshOrders = useCallback(async () => {
    // Pull the latest orders for the signed-in user straight from the DB.
    // This catches new orders + status changes (e.g. admin flipped an order
    // from pending -> shipped) that happened after the user's initial
    // hydration. If there are no orders we push an empty array so the local
    // state truly reflects "nothing on file" rather than a stale non-empty
    // list from a prior session.
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    const orders = await fetchUserOrders(data.user.id)
    dispatch({ type: "SYNC_FROM_DB", payload: { orders } })
  }, [])
  const refreshNotifications = useCallback(async () => {
    // Pull the latest notifications for the signed-in user straight from the DB.
    // The bell in the shell + the /dashboard/notifications page both read
    // from state.notifications, so a single dispatch feeds all views.
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    const notifications = await fetchNotifications(data.user.id)
    dispatch({ type: "SET_NOTIFICATIONS", payload: notifications })
  }, [])
  const markNotificationRead = useCallback(async (id: string) => {
    // Optimistic: flip locally first, then persist. On DB failure we don't
    // revert (a stale-read on the next refresh will fix it), but we do log.
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: id })
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    try {
      await dbMarkNotificationRead(data.user.id, id)
    } catch {
      // Non-fatal — next refresh reconciles.
    }
  }, [])
  const markAllNotificationsRead = useCallback(async () => {
    dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) return
    try {
      await dbMarkAllNotificationsRead(data.user.id)
    } catch {
      // Non-fatal.
    }
  }, [])
  const updateSession = useCallback(
    (id: string, changes: Partial<Session>) => {
      dispatch({ type: "UPDATE_SESSION", payload: { id, changes } })
      // Persist status/changes to Supabase (best-effort)
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) return
        const row: Record<string, unknown> = {}
        if (changes.status !== undefined) row.status = changes.status
        if (changes.date !== undefined) row.date = changes.date
        if (changes.time !== undefined) row.time = changes.time
        if (changes.notes !== undefined) row.notes = changes.notes
        if (Object.keys(row).length) supabase.from("sessions").update(row).eq("id", id).then(() => {})
      })
    },
    []
  )
  const placeOrderLocal = useCallback(
    (order: Order) => dispatch({ type: "PLACE_ORDER", payload: order }),
    []
  )
  const logWater = useCallback(
    (date: string, liters: number) => {
      dispatch({ type: "LOG_WATER", payload: { date, liters } })
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) import("@/lib/supabase/db").then((m) => m.upsertWaterLog(data.user!.id, date, liters).catch(() => {}))
      })
    },
    []
  )
  const resetOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    dispatch({
      type: "HYDRATE",
      payload: {
        ...initialState,
        user: null,
        meals: [],
        products: [],
        doctorPlan: null,
      },
    })
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      setUser,
      logWeight,
      editWeight,
      removeWeight,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      setLocale,
      markIntroSeen,
      updateAvatar,
      updatePlan,
      refreshPlan,
      addSession,
      refreshSessions,
      refreshOrders,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      updateSession,
      placeOrderLocal,
      logWater,
      resetOnboarding,
    }),
    [
      state,
      setUser,
      logWeight,
      editWeight,
      removeWeight,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      setLocale,
      markIntroSeen,
      updateAvatar,
      updatePlan,
      refreshPlan,
      addSession,
      refreshSessions,
      refreshOrders,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      updateSession,
      placeOrderLocal,
      logWater,
      resetOnboarding,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>")
  return ctx
}
