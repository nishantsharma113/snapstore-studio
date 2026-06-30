"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { Loader2 } from "lucide-react"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, loading, initializeAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize Auth state listener
  React.useEffect(() => {
    const unsubscribe = initializeAuth()
    return () => unsubscribe()
  }, [initializeAuth])

  // Route protection logic
  React.useEffect(() => {
    if (loading) return

    const isAuthRoute = pathname === "/auth"
    const isLandingRoute = pathname === "/"
    const isProtectedRoute = !isAuthRoute && !isLandingRoute

    if (isProtectedRoute && !user) {
      router.replace("/auth")
    } else if (isAuthRoute && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, pathname, router])

  // Show premium dark loader when authenticating or loading routes
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white selection:bg-purple-500/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
            <span className="bg-gradient-to-tr from-purple-500 to-indigo-500 bg-clip-text text-2xl font-black tracking-tighter text-transparent">
              SS
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            <span>Loading SnapStore Studio...</span>
          </div>
        </div>
      </div>
    )
  }

  // Prevent flash of protected content for unauthenticated users before redirect
  const isAuthRoute = pathname === "/auth"
  const isLandingRoute = pathname === "/"
  const isProtectedRoute = !isAuthRoute && !isLandingRoute

  if (isProtectedRoute && !user) {
    return null
  }

  if (isAuthRoute && user) {
    return null
  }

  return <>{children}</>
}
