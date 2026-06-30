"use client"

import * as React from "react"
import { useAuthStore } from "@/store/authStore"
import { LoginForm } from "@/features/authentication/components/login-form"
import { RegisterForm } from "@/features/authentication/components/register-form"
import { ResetPasswordForm } from "@/features/authentication/components/reset-password-form"
import { VerifyEmailForm } from "@/features/authentication/components/verify-email-form"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Layers, Image as ImageIcon, Smartphone } from "lucide-react"

type AuthView = "login" | "register" | "forgot" | "verify"

export default function AuthPage() {
  const { user } = useAuthStore()
  const [view, setView] = React.useState<AuthView>("login")

  // Auto-switch to verify if user is registered but not verified
  React.useEffect(() => {
    if (user && !user.emailVerified) {
      setView("verify")
    }
  }, [user])

  const renderForm = () => {
    switch (view) {
      case "login":
        return <LoginForm key="login" onSwitchView={setView} />
      case "register":
        return (
          <RegisterForm
            key="register"
            onSwitchView={setView}
            onSuccessRegister={() => setView("verify")}
          />
        )
      case "forgot":
        return <ResetPasswordForm key="forgot" onSwitchView={setView} />
      case "verify":
        return <VerifyEmailForm key="verify" onSwitchView={setView} />
    }
  }

  const getTitle = () => {
    switch (view) {
      case "login":
        return "Welcome back"
      case "register":
        return "Create your account"
      case "forgot":
        return "Reset your password"
      case "verify":
        return "Verify your account"
    }
  }

  const getSubtitle = () => {
    switch (view) {
      case "login":
        return "Sign in to your account to continue designing"
      case "register":
        return "Start designing App Store & Google Play screenshots"
      case "forgot":
        return "Enter your email to receive a password reset link"
      case "verify":
        return "Verify your email to active your developer profile"
    }
  }

  return (
    <div className="relative flex min-h-screen w-full bg-zinc-950 overflow-hidden select-none">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Grid container */}
      <div className="relative z-10 grid w-full grid-cols-1 lg:grid-cols-12">
        {/* Left Side Panel (Desktop only banner) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 relative border-r border-zinc-900/60 bg-zinc-950/40 backdrop-blur-sm">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/15">
              <span className="text-lg font-black tracking-tighter text-white">SS</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              SnapStore{" "}
              <span className="text-purple-400 font-medium text-sm bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 ml-1.5">
                Studio
              </span>
            </span>
          </div>

          {/* Core Visual Preview Card */}
          <div className="relative my-auto max-w-lg mx-auto w-full aspect-[4/3] rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 glow-effect overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-indigo-500/5" />

            {/* Visual Canvas Elements Mockup */}
            <div className="relative h-full w-full flex flex-col justify-between border border-dashed border-zinc-800 rounded-xl p-4 bg-zinc-950/40">
              <div className="flex justify-between items-center text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Canvas Workspace
                </span>
                <span>1242 × 2688 px</span>
              </div>

              {/* Mockup App Screen Layer */}
              <div className="flex gap-4 items-center justify-center h-full max-h-56">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-36 h-48 border border-zinc-800 bg-zinc-900 rounded-xl p-2 relative shadow-2xl flex flex-col justify-between"
                >
                  <div className="h-3 w-full bg-zinc-800 rounded-sm mb-1.5" />
                  <div className="h-2 w-2/3 bg-zinc-800 rounded-sm mb-4" />

                  {/* Floating screenshot layer */}
                  <div className="flex-1 border border-purple-500/30 bg-purple-500/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <Smartphone className="h-10 w-10 text-purple-400/60" />
                    <div className="absolute -bottom-2 right-1 w-8 h-12 bg-zinc-800 rounded-t-md border border-zinc-700 p-0.5">
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 rounded-sm" />
                    </div>
                  </div>
                </motion.div>

                {/* Properties inspector tooltip */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-44 bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 shadow-2xl text-xs space-y-2"
                >
                  <div className="font-semibold text-zinc-300 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Background
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border border-zinc-700" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 w-full bg-zinc-800 rounded-sm" />
                      <div className="h-1.5 w-2/3 bg-zinc-800 rounded-sm" />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="flex justify-between items-center text-xs text-zinc-500 pt-2 border-t border-zinc-900">
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" /> 4K Export Ready
                </span>
                <span className="text-purple-400 font-semibold">100% Client Rendered</span>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Design screenshots that stand out.
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
              Publish gorgeous, customized App Store and Google Play screenshots directly from your
              browser. Try simulated mode today.
            </p>
          </div>
        </div>

        {/* Right Side Panel (Form) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-12 relative min-h-screen bg-zinc-950/20">
          {/* Brand Logo for Mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8 self-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
              <span className="text-sm font-black tracking-tighter text-white">SS</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              SnapStore{" "}
              <span className="text-purple-400 font-medium text-xs bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Studio
              </span>
            </span>
          </div>

          <div className="w-full max-w-[400px]">
            {/* Header Text */}
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white">{getTitle()}</h2>
              <p className="text-sm text-zinc-400 mt-1">{getSubtitle()}</p>
            </div>

            {/* Form Card Container */}
            <div className="glass-panel rounded-2xl p-6 shadow-2xl relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                >
                  {renderForm()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
