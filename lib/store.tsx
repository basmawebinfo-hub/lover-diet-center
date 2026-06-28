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
} from "./types"
import { createClient } from "@/lib/supabase/client"
import { fetchSessions, fetchWeightLogs, insertSession, insertWeightLog, fetchProfile, fetchWaterLogs, fetchProducts, fetchMeals, fetchUserOrders } from "@/lib/supabase/db"


type AppState = {
  hydrated: boolean
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
}

type Action =
  | { type: "HYDRATE"; payload: Omit<AppState, "hydrated"> }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOG_WEIGHT"; payload: WeightLog }
  | { type: "ADD_TO_CART"; payload: { productId: string; quantity?: number } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QTY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LOCALE"; payload: Locale }
  | { type: "MARK_INTRO_SEEN" }
  | { type: "UPDATE_AVATAR"; payload: User["avatarConfig"] }
  | { type: "UPDATE_PLAN"; payload: DoctorPlan }
  | { type: "ADD_SESSION"; payload: Session }
  | { type: "UPDATE_SESSION"; payload: { id: string; changes: Partial<Session> } }
  | { type: "PLACE_ORDER"; payload: Order }
  | { type: "LOG_WATER"; payload: WaterLog }
  | { type: "SYNC_FROM_DB"; payload: { sessions?: Session[]; weightLogs?: WeightLog[]; waterLogs?: WaterLog[]; orders?: Order[] } }
  | { type: "SET_CATALOG"; payload: { products?: Product[]; meals?: Meal[] } }

const STORAGE_KEY = "loversdc:state:v1"

const initialState: AppState = {
  hydrated: false,
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
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true }
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
    default:
      return state
  }
}

type AppContextValue = {
  state: AppState
  setUser: (u: User | null) => void
  logWeight: (log: WeightLog) => void
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQty: (productId: string, quantity: number) => void
  clearCart: () => void
  setLocale: (l: Locale) => void
  markIntroSeen: () => void
  updateAvatar: (cfg: User["avatarConfig"]) => void
  updatePlan: (plan: DoctorPlan) => void
  addSession: (s: Session) => void
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
      if (!data.user || !active) return
      const uid = data.user.id
      const [profile, sessions, weightLogs, waterLogs, orders] = await Promise.all([
        fetchProfile(uid),
        fetchSessions(uid),
        fetchWeightLogs(uid),
        fetchWaterLogs(uid),
        fetchUserOrders(uid),
      ])
      if (!active) return
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
    (log: WeightLog) => {
      dispatch({ type: "LOG_WEIGHT", payload: log })
      // Sync to Supabase if signed in (non-blocking)
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) insertWeightLog(data.user.id, log).catch(() => {})
      })
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
  const updateSession = useCallback(
    (id: string, changes: Partial<Session>) =>
      dispatch({ type: "UPDATE_SESSION", payload: { id, changes } }),
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
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      setLocale,
      markIntroSeen,
      updateAvatar,
      updatePlan,
      addSession,
      updateSession,
      placeOrderLocal,
      logWater,
      resetOnboarding,
    }),
    [
      state,
      setUser,
      logWeight,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      setLocale,
      markIntroSeen,
      updateAvatar,
      updatePlan,
      addSession,
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
