import { create } from "zustand"
import { supabase, isSimulatedMode } from "@/lib/supabase"

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: string
  isSimulated: boolean
  emailVerified: boolean
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  initializeAuth: () => () => void
}

const SIMULATED_USERS_KEY = "snapstore_simulated_users"
const SIMULATED_SESSION_KEY = "snapstore_simulated_user_session"

interface SimulatedUser {
  uid: string
  email: string
  displayName: string
  createdAt: string
  emailVerified: boolean
  password?: string
}

// Helper to get simulated users from localStorage
const getSimulatedUsers = (): Array<SimulatedUser> => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(SIMULATED_USERS_KEY)
  return data ? JSON.parse(data) : []
}

// Helper to save a simulated user
const saveSimulatedUser = (user: SimulatedUser) => {
  if (typeof window === "undefined") return
  const users = getSimulatedUsers()
  users.push(user)
  localStorage.setItem(SIMULATED_USERS_KEY, JSON.stringify(users))
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      if (isSimulatedMode) {
        // Simulated Authentication
        const users = getSimulatedUsers()
        const matchedUser = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        )

        if (!matchedUser) {
          throw new Error("Invalid email or password.")
        }

        const profile: UserProfile = {
          uid: matchedUser.uid,
          email: matchedUser.email,
          displayName: matchedUser.displayName,
          createdAt: matchedUser.createdAt,
          isSimulated: true,
          emailVerified: matchedUser.emailVerified,
        }

        localStorage.setItem(SIMULATED_SESSION_KEY, JSON.stringify(profile))
        set({ user: profile, loading: false })
      } else {
        // Real Supabase Auth
        if (!supabase) throw new Error("Supabase client is not initialized.")
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Session change listener handles Zustand state update
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to log in"
      set({ error: errMsg, loading: false })
      throw err
    }
  },

  register: async (email, password, displayName) => {
    set({ loading: true, error: null })
    try {
      if (isSimulatedMode) {
        // Simulated Registration
        const users = getSimulatedUsers()
        const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase())

        if (userExists) {
          throw new Error("An account with this email already exists.")
        }

        const newSimulatedUser = {
          uid: "sim_" + Math.random().toString(36).substr(2, 9),
          email: email.toLowerCase(),
          password: password,
          displayName: displayName || email.split("@")[0],
          createdAt: new Date().toISOString(),
          emailVerified: false,
        }

        saveSimulatedUser(newSimulatedUser)

        const profile: UserProfile = {
          uid: newSimulatedUser.uid,
          email: newSimulatedUser.email,
          displayName: newSimulatedUser.displayName,
          createdAt: newSimulatedUser.createdAt,
          isSimulated: true,
          emailVerified: newSimulatedUser.emailVerified,
        }

        localStorage.setItem(SIMULATED_SESSION_KEY, JSON.stringify(profile))
        set({ user: profile, loading: false })
      } else {
        // Real Supabase Auth Registration
        if (!supabase) throw new Error("Supabase client is not initialized.")
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        })
        if (error) throw error
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to register account"
      set({ error: errMsg, loading: false })
      throw err
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null })
    try {
      if (isSimulatedMode) {
        // Simulated Google Login
        const profile: UserProfile = {
          uid: "sim_google_" + Math.random().toString(36).substr(2, 9),
          email: "google.user@example.com",
          displayName: "Google Demo User",
          photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=GoogleUser",
          createdAt: new Date().toISOString(),
          isSimulated: true,
          emailVerified: true,
        }

        localStorage.setItem(SIMULATED_SESSION_KEY, JSON.stringify(profile))
        set({ user: profile, loading: false })
      } else {
        // Real Supabase Google Login
        if (!supabase) throw new Error("Supabase client is not initialized.")
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              typeof window !== "undefined" ? window.location.origin + "/dashboard" : undefined,
          },
        })
        if (error) throw error
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed Google login"
      set({ error: errMsg, loading: false })
      throw err
    }
  },

  logout: async () => {
    set({ loading: true })
    try {
      if (isSimulatedMode) {
        localStorage.removeItem(SIMULATED_SESSION_KEY)
        set({ user: null, loading: false })
      } else {
        if (!supabase) throw new Error("Supabase client is not initialized.")
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to log out"
      set({ error: errMsg, loading: false })
      throw err
    }
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null })
    try {
      if (isSimulatedMode) {
        // Simulate password reset email send
        await new Promise((resolve) => setTimeout(resolve, 800))
        set({ loading: false })
      } else {
        if (!supabase) throw new Error("Supabase client is not initialized.")
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== "undefined" ? window.location.origin + "/auth" : undefined,
        })
        if (error) throw error
        set({ loading: false })
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to send reset email"
      set({ error: errMsg, loading: false })
      throw err
    }
  },

  initializeAuth: () => {
    if (isSimulatedMode) {
      // Initialize simulated session
      const sessionData = localStorage.getItem(SIMULATED_SESSION_KEY)
      if (sessionData) {
        try {
          const profile = JSON.parse(sessionData)
          set({ user: profile, loading: false })
        } catch {
          localStorage.removeItem(SIMULATED_SESSION_KEY)
          set({ user: null, loading: false })
        }
      } else {
        set({ user: null, loading: false })
      }
      // Return dummy unsubscribe function
      return () => {}
    } else {
      if (!supabase) {
        set({ user: null, loading: false })
        return () => {}
      }

      // Check current session first
      supabase.auth.getSession().then(({ data: { session } }) => {
        const user = session?.user
        if (user) {
          const profile: UserProfile = {
            uid: user.id,
            email: user.email || "",
            displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
            photoURL: user.user_metadata?.avatar_url || undefined,
            createdAt: user.created_at,
            isSimulated: false,
            emailVerified: !!user.email_confirmed_at,
          }
          set({ user: profile, loading: false })
        } else {
          set({ loading: false })
        }
      })

      // Listen to real Supabase session state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user
        if (user) {
          const profile: UserProfile = {
            uid: user.id,
            email: user.email || "",
            displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
            photoURL: user.user_metadata?.avatar_url || undefined,
            createdAt: user.created_at,
            isSimulated: false,
            emailVerified: !!user.email_confirmed_at,
          }
          set({ user: profile, loading: false })
        } else {
          set({ user: null, loading: false })
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  },
}))
