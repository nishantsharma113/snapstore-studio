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

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" {...props}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFields = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSwitchView: (view: "register" | "forgot") => void
}

export function LoginForm({ onSwitchView }: LoginFormProps) {
  const { login, loginWithGoogle, loading, error, setError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Clear errors when mounting
  React.useEffect(() => {
    setError(null)
  }, [setError])

  const onSubmit = async (data: LoginFields) => {
    try {
      await login(data.email, data.password)
    } catch {
      // Handled by store
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
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
        <Label htmlFor="login-email">Email Address</Label>
        <Input
          id="login-email"
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
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <button
            type="button"
            onClick={() => onSwitchView("forgot")}
            className="text-xs text-purple-400 hover:text-purple-300 hover:underline"
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
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

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg hover:shadow-purple-500/20 cursor-pointer transition-all duration-200"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <span className="relative bg-zinc-950 px-2 text-xs text-zinc-500 uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white cursor-pointer"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <GoogleIcon />
        Google
      </Button>

      <p className="text-center text-xs text-zinc-500 pt-2">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitchView("register")}
          className="text-purple-400 hover:text-purple-300 hover:underline font-medium cursor-pointer"
          disabled={loading}
        >
          Sign Up
        </button>
      </p>
    </form>
  )
}
