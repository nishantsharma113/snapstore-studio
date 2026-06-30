"use client"

import * as React from "react"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { useProjectsQuery } from "@/features/projects/hooks/useProjects"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Shield,
  Clock,
  LogOut,
  Layers,
  FolderArchive,
  Pencil,
  Check,
  X,
  Sun,
  Moon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const { data: projects = [] } = useProjectsQuery()
  const { theme, setTheme } = useTheme()

  const [isEditingName, setIsEditingName] = React.useState(false)
  const [displayName, setDisplayName] = React.useState(user?.displayName || "")

  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => !p.is_archived).length
  const archivedProjects = projects.filter((p) => p.is_archived).length

  const formatDate = (iso?: string) => {
    if (!iso) return "—"
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return "—"
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace("/auth")
  }

  const handleSaveName = () => {
    setIsEditingName(false)
  }

  const initials = (user?.displayName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-md shrink-0 px-6 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">
            Account &amp; Profile
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border bg-surface rounded-2xl p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-black tracking-tighter shadow-xl shadow-primary/20">
                  {initials}
                </div>
                {user?.isSimulated && (
                  <span className="absolute -top-2 -right-2 text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Demo
                  </span>
                )}
              </div>

              {/* Name & Email */}
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-8 text-sm font-bold bg-muted border-primary text-foreground w-48"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName()
                        if (e.key === "Escape") setIsEditingName(false)
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground border border-border cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-black text-foreground tracking-tight truncate">
                      {displayName || user?.displayName || "Anonymous User"}
                    </h2>
                    <button
                      onClick={() => {
                        setDisplayName(user?.displayName || "")
                        setIsEditingName(true)
                      }}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                      title="Edit name"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold">
                    <Shield className="h-2.5 w-2.5" />
                    {user?.isSimulated ? "Simulated Mode" : "Verified Account"}
                  </span>
                  {user?.emailVerified && !user?.isSimulated && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                      Email Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Projects",
                value: totalProjects,
                icon: Layers,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: "Active",
                value: activeProjects,
                icon: Layers,
                color: "text-success",
                bg: "bg-success/10",
              },
              {
                label: "Archived",
                value: archivedProjects,
                icon: FolderArchive,
                color: "text-muted-foreground",
                bg: "bg-muted",
              },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="border border-border bg-surface rounded-xl p-4 text-center"
                >
                  <div
                    className={`mx-auto mb-2 h-8 w-8 flex items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-black text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Account Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-border bg-surface rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                Account Details
              </h3>
            </div>
            <div className="divide-y divide-border/60">
              {[
                {
                  label: "Display Name",
                  value: displayName || user?.displayName || "—",
                  icon: User,
                },
                { label: "Email Address", value: user?.email || "—", icon: Mail },
                {
                  label: "Account Type",
                  value: user?.isSimulated ? "Simulated (Demo)" : "Standard",
                  icon: Shield,
                },
                { label: "Member Since", value: formatDate(user?.createdAt), icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground font-medium">{label}</span>
                  </div>
                  <span className="text-xs text-foreground font-semibold truncate ml-4 max-w-[200px] text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-border bg-surface rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-wider">
                Preferences
              </h3>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Interface Theme</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Choose between light and dark mode
                </p>
              </div>
              <div className="flex items-center border border-border rounded-xl overflow-hidden bg-muted/40">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                    theme === "light"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
                <div className="w-px h-5 bg-border" />
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                    theme === "dark"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-destructive/20 bg-destructive/5 rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-destructive/15">
              <h3 className="text-xs font-bold text-destructive uppercase tracking-wider">
                Danger Zone
              </h3>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Sign Out</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Ends your current session and returns you to the login screen.
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/30 text-xs h-8 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
