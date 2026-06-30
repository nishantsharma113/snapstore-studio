"use client"

import * as React from "react"
import { useAuthStore } from "@/store/authStore"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  User,
  Mail,
  Bell,
  Shield,
  Monitor,
  Sun,
  Moon,
  Keyboard,
  HardDrive,
  Globe,
  ChevronRight,
  Check,
  Loader2,
  Eye,
  EyeOff,
  Pencil,
  X,
} from "lucide-react"

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  )
}

interface SectionCardProps {
  icon: React.ElementType
  title: string
  description?: string
  children: React.ReactNode
  delay?: number
}

function SectionCard({ icon: Icon, title, description, children, delay = 0 }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl border border-border bg-surface overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </motion.div>
  )
}

interface SettingRowProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const SHORTCUTS = [
  { keys: ["Ctrl", "Z"], action: "Undo" },
  { keys: ["Ctrl", "Y"], action: "Redo" },
  { keys: ["Ctrl", "S"], action: "Save project" },
  { keys: ["Ctrl", "D"], action: "Duplicate layer" },
  { keys: ["Del"], action: "Delete selected" },
  { keys: ["Ctrl", "A"], action: "Select all layers" },
  { keys: ["Ctrl", "Shift", "C"], action: "Copy layer style" },
  { keys: ["Ctrl", "Shift", "V"], action: "Paste layer style" },
  { keys: ["Ctrl", "+"], action: "Zoom in" },
  { keys: ["Ctrl", "-"], action: "Zoom out" },
  { keys: ["Ctrl", "0"], action: "Fit canvas to window" },
  { keys: ["Esc"], action: "Deselect / close panel" },
]

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const [isEditingName, setIsEditingName] = React.useState(false)
  const [displayName, setDisplayName] = React.useState(user?.displayName || "")
  const [savingName, setSavingName] = React.useState(false)

  const [showCurrentPw, setShowCurrentPw] = React.useState(false)
  const [currentPw, setCurrentPw] = React.useState("")
  const [newPw, setNewPw] = React.useState("")

  const [notifs, setNotifs] = React.useState({
    projectUpdates: true,
    exportComplete: true,
    weeklyDigest: false,
    productUpdates: true,
    securityAlerts: true,
  })

  const [language, setLanguage] = React.useState("en")

  const handleSaveName = async () => {
    setSavingName(true)
    await new Promise((r) => setTimeout(r, 600))
    setSavingName(false)
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
      {/* Header */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-md shrink-0 px-6 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            Manage your account, appearance, and workspace preferences
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
          {/* Profile */}
          <SectionCard
            icon={User}
            title="Profile"
            description="Your public identity in SnapStore Studio"
            delay={0}
          >
            <div className="px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20">
                  {initials}
                </div>
                {user?.isSimulated && (
                  <span className="absolute -top-1.5 -right-1.5 text-[7px] bg-warning text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Demo
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-8 text-sm font-semibold border-primary bg-background"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName()
                        if (e.key === "Escape") setIsEditingName(false)
                      }}
                    />
                    <Button
                      size="icon-sm"
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="shrink-0"
                    >
                      {savingName ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => setIsEditingName(false)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground truncate">
                      {displayName || user?.displayName || "Anonymous"}
                    </span>
                    <button
                      onClick={() => {
                        setDisplayName(user?.displayName || "")
                        setIsEditingName(true)
                      }}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  <span>{user?.email}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="badge-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {user?.isSimulated ? "Simulated Mode" : "Standard"}
                  </span>
                  {user?.emailVerified && !user?.isSimulated && (
                    <span className="badge-success text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="h-2.5 w-2.5" /> Email Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Appearance */}
          <SectionCard
            icon={Monitor}
            title="Appearance"
            description="Customize how SnapStore Studio looks"
            delay={0.05}
          >
            <SettingRow
              label="Interface Theme"
              description="Choose between light, dark, or follow your system preference"
            >
              <div className="flex items-center border border-border rounded-xl overflow-hidden bg-muted/40 p-0.5 gap-0.5">
                {[
                  { id: "light", icon: Sun, label: "Light" },
                  { id: "dark", icon: Moon, label: "Dark" },
                  { id: "system", icon: Monitor, label: "Auto" },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      theme === id || (!theme && id === "system" && !resolvedTheme)
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </SettingRow>

            <SettingRow
              label="Language"
              description="Select the display language for the interface"
            >
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </SettingRow>
          </SectionCard>

          {/* Notifications */}
          <SectionCard
            icon={Bell}
            title="Notifications"
            description="Choose what you want to be notified about"
            delay={0.1}
          >
            {[
              {
                key: "projectUpdates",
                label: "Project updates",
                desc: "Get notified when collaborators make changes",
              },
              {
                key: "exportComplete",
                label: "Export complete",
                desc: "Notify when your export is ready to download",
              },
              {
                key: "weeklyDigest",
                label: "Weekly digest",
                desc: "A summary of your activity every Monday",
              },
              {
                key: "productUpdates",
                label: "Product updates",
                desc: "New features, templates, and improvements",
              },
              {
                key: "securityAlerts",
                label: "Security alerts",
                desc: "Important alerts about your account security",
              },
            ].map(({ key, label, desc }) => (
              <SettingRow key={key} label={label} description={desc}>
                <Toggle
                  checked={notifs[key as keyof typeof notifs]}
                  onChange={(v) => setNotifs((prev) => ({ ...prev, [key]: v }))}
                />
              </SettingRow>
            ))}
          </SectionCard>

          {/* Security */}
          <SectionCard
            icon={Shield}
            title="Security"
            description="Manage your account password and security"
            delay={0.15}
          >
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs font-semibold text-foreground">Change Password</p>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="Current password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="pr-9 h-8 text-xs bg-background"
                    disabled={user?.isSimulated}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((s) => !s)}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPw ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="h-8 text-xs bg-background"
                  disabled={user?.isSimulated}
                />
              </div>
              <Button
                size="sm"
                disabled={user?.isSimulated || !currentPw || !newPw}
                className="mt-1"
              >
                Update Password
              </Button>
              {user?.isSimulated && (
                <p className="text-[10px] text-muted-foreground">
                  Password changes are disabled in simulated mode.
                </p>
              )}
            </div>
          </SectionCard>

          {/* Storage */}
          <SectionCard
            icon={HardDrive}
            title="Storage"
            description="Manage your workspace storage usage"
            delay={0.2}
          >
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Storage Used</span>
                <span className="text-muted-foreground">14 MB / 50 MB</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
                  style={{ width: "28%" }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                28% of your free storage is used. Upgrade to Pro for 5 GB.
              </p>
              <Button size="sm" variant="outline" className="mt-1">
                <HardDrive className="h-3.5 w-3.5 mr-1.5" />
                Manage Storage
              </Button>
            </div>
          </SectionCard>

          {/* Keyboard Shortcuts */}
          <SectionCard
            icon={Keyboard}
            title="Keyboard Shortcuts"
            description="Speed up your workflow with these hotkeys"
            delay={0.25}
          >
            <div className="px-5 py-4">
              <div className="space-y-1">
                {SHORTCUTS.map(({ keys, action }) => (
                  <div
                    key={action}
                    className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                  >
                    <span className="text-xs text-muted-foreground">{action}</span>
                    <div className="flex items-center gap-1">
                      {keys.map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-[9px] text-muted-foreground/50">+</span>}
                          <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-md border border-border bg-muted text-[9px] font-mono font-bold text-foreground shadow-sm">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="rounded-2xl border border-destructive/20 bg-destructive/5 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-destructive/15">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-destructive">Danger Zone</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Irreversible account actions
                </p>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-foreground">Delete Account</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/30 shrink-0"
                disabled={user?.isSimulated}
              >
                Delete Account
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
