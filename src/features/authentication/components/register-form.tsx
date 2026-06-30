"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFields = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSwitchView: (view: "login") => void
  onSuccessRegister: () => void
}

export function RegisterForm({ onSwitchView, onSuccessRegister }: RegisterFormProps) {
  const { register: signUp, loading, error, setError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Clear errors when mounting
  React.useEffect(() => {
    setError(null)
  }, [setError])

  const onSubmit = async (data: RegisterFields) => {
    try {
      await signUp(data.email, data.password, data.name)
      onSuccessRegister()
    } catch {
      // Handled by store
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="reg-name">Full Name</Label>
        <Input
          id="reg-name"
          type="text"
          placeholder="John Doe"
          disabled={loading}
          className={
            errors.name
              ? "border-destructive focus-visible:ring-destructive bg-zinc-900/20"
              : "bg-zinc-900/20 border-zinc-800"
          }
          {...register("name")}
        />
        {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-email">Email Address</Label>
        <Input
          id="reg-email"
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

      <div className="space-y-1.5">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={loading}
          className={
            errors.password
              ? "border-destructive focus-visible:ring-destructive bg-zinc-900/20"
              : "bg-zinc-900/20 border-zinc-800"
          }
          {...register("password")}
        />
        {errors.password && (
          <p className="text-[11px] text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-confirm">Confirm Password</Label>
        <Input
          id="reg-confirm"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={loading}
          className={
            errors.confirmPassword
              ? "border-destructive focus-visible:ring-destructive bg-zinc-900/20"
              : "bg-zinc-900/20 border-zinc-800"
          }
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-[11px] text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg hover:shadow-purple-500/20 cursor-pointer transition-all duration-200"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-center text-xs text-zinc-500 pt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitchView("login")}
          className="text-purple-400 hover:text-purple-300 hover:underline font-medium cursor-pointer"
          disabled={loading}
        >
          Sign In
        </button>
      </p>
    </form>
  )
}
