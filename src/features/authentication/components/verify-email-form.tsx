"use client"

import * as React from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, Mail, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface VerifyEmailFormProps {
  onSwitchView: (view: "login") => void
}

export function VerifyEmailForm({ onSwitchView }: VerifyEmailFormProps) {
  const { user, logout } = useAuthStore()
  const [resending, setResending] = React.useState(false)
  const [verifying, setVerifying] = React.useState(false)

  const handleResend = async () => {
    setResending(true)
    try {
      if (user?.isSimulated) {
        await new Promise((resolve) => setTimeout(resolve, 800))
      } else {
        if (!supabase) throw new Error("Supabase client is not initialized.")
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: user?.email || "",
        })
        if (error) throw error
      }
      alert("Verification email resent successfully!")
    } catch (err) {
      alert("Error resending email: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setResending(false)
    }
  }

  const handleCheckStatus = async () => {
    setVerifying(true)
    try {
      if (user?.isSimulated) {
        // Update simulated database in localStorage
        await new Promise((resolve) => setTimeout(resolve, 800))
        const sessionData = localStorage.getItem("snapstore_simulated_user_session")
        if (sessionData) {
          const profile = JSON.parse(sessionData)
          profile.emailVerified = true
          localStorage.setItem("snapstore_simulated_user_session", JSON.stringify(profile))

          const usersData = localStorage.getItem("snapstore_simulated_users")
          if (usersData) {
            const users = JSON.parse(usersData)
            const updatedUsers = users.map((u: { uid: string; emailVerified: boolean }) =>
              u.uid === profile.uid ? { ...u, emailVerified: true } : u
            )
            localStorage.setItem("snapstore_simulated_users", JSON.stringify(updatedUsers))
          }
        }
        window.location.reload()
      } else {
        // Real Supabase reload status
        if (!supabase) throw new Error("Supabase client is not initialized.")
        const {
          data: { user: updatedUser },
          error,
        } = await supabase.auth.getUser()
        if (error) throw error

        if (updatedUser?.email_confirmed_at) {
          window.location.reload()
        } else {
          alert("Email not verified yet. Please check your inbox or resend the link.")
        }
      }
    } catch (err) {
      alert(
        "Error checking verification status: " + (err instanceof Error ? err.message : String(err))
      )
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
        <Mail className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Verify your email</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          We have sent a verification link to{" "}
          <span className="text-zinc-200 font-medium">{user?.email}</span>. Please click the link to
          verify your account.
        </p>
      </div>

      <div className="space-y-2 pt-2">
        <Button
          type="button"
          onClick={handleCheckStatus}
          disabled={verifying}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium cursor-pointer"
        >
          {verifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              {user?.isSimulated ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Simulate Verification Success
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Check Verification Status
                </>
              )}
            </span>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={resending || verifying}
          className="w-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white cursor-pointer"
        >
          {resending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resending...
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-zinc-500 pt-2 font-normal">
        Want to use a different account?{" "}
        <button
          type="button"
          onClick={async () => {
            await logout()
            onSwitchView("login")
          }}
          className="text-purple-400 hover:text-purple-300 hover:underline font-medium cursor-pointer"
        >
          Sign Out
        </button>
      </p>
    </div>
  )
}
