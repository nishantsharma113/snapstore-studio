"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, MailCheck } from "lucide-react"

const resetSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
})

type ResetFields = z.infer<typeof resetSchema>

interface ResetPasswordFormProps {
  onSwitchView: (view: "login") => void
}

export function ResetPasswordForm({ onSwitchView }: ResetPasswordFormProps) {
  const { resetPassword, loading, error, setError } = useAuthStore()
  const [success, setSuccess] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFields>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  })

  // Clear errors when mounting
  React.useEffect(() => {
    setError(null)
  }, [setError])

  const onSubmit = async (data: ResetFields) => {
    try {
      await resetPassword(data.email)
      setSuccess(true)
    } catch {
      // Handled by store
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
          <MailCheck className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Check your email</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We have sent password recovery instructions to your email address.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => onSwitchView("login")}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium cursor-pointer"
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSwitchView("login")}
          className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 font-medium cursor-pointer mb-2"
          disabled={loading}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </button>
        <h3 className="text-lg font-semibold text-white">Reset Password</h3>
        <p className="text-xs text-zinc-400">
          Enter your email address and we will send you a reset link.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="reset-email">Email Address</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          disabled={loading}
          className={
            errors.email
              ? "border-destructive focus-visible:ring-destructive bg-zinc-900/20"
              : "bg-zinc-900/20 border-zinc-800"
          }
          {...register("email")}
        />
        {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg hover:shadow-purple-500/20 cursor-pointer transition-all duration-200"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  )
}
