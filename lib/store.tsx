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
  Product,
  Session,
  User,
  WeightLog,
} from "./types"
import { createClient } from "@/lib/supabase/client"
import { fetchSessions, fetchWeightLogs, insertSession, insertWeightLog } from "@/lib/supabase/db"
import {
  mockDoctorPlan,
  mockMeals,
  mockProducts,
  mockSessions,
  mockUser,
  mockWeightLogs,
} from "./mock-data"

type AppState = {
  hydrated: boolean
  user: User | null
  weightLogs: WeightLog[]
  meals: Meal[]
  products: Product[]
  sessions: Session[]
  doctorPlan: DoctorPlan | null
  cart: CartItem[]
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
  | { type: "SYNC_FROM_DB"; payload: { sessions?: Session[]; weightLogs?: WeightLog[] } }

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
    case "SYNC_FROM_DB":
      return {
        ...state,
        sessions: action.payload.sessions ?? state.sessions,
        weightLogs: action.payload.weightLogs ?? state.weightLogs,
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
            weightLogs: mockWeightLogs,
            meals: mockMeals,
            products: mockProducts,
            sessions: mockSessions,
            doctorPlan: mockDoctorPlan,
          },
        })
        return
      }
    } catch {
      // ignore
    }
    // First-time load — seed with mock data so the dashboard has something to show
    dispatch({
      type: "HYDRATE",
      payload: {
        user: mockUser,
        weightLogs: mockWeightLogs,
        meals: mockMeals,
        products: mockProducts,
        sessions: mockSessions,
        doctorPlan: mockDoctorPlan,
        cart: [],
        locale: "en",
        hasSeenIntro: false,
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

  // Once hydrated, pull the signed-in user's real data from Supabase
  useEffect(() => {
    if (!state.hydrated) return
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !active) return
      const [sessions, weightLogs] = await Promise.all([
        fetchSessions(data.user.id),
        fetchWeightLogs(data.user.id),
      ])
      if (!active) return
      dispatch({
        type: "SYNC_FROM_DB",
        payload: {
          sessions: sessions.length ? sessions : undefined,
          weightLogs: weightLogs.length ? weightLogs : undefined,
        },
      })
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated])

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
  const resetOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    dispatch({
      type: "HYDRATE",
      payload: {
        user: null,
        weightLogs: [],
        meals: mockMeals,
        products: mockProducts,
        sessions: mockSessions,
        doctorPlan: mockDoctorPlan,
        cart: [],
        locale: "en",
        hasSeenIntro: false,
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
