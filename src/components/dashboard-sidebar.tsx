"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  HardDrive,
  Pencil,
  Palette,
  Clock,
  Download,
  Settings,
  CreditCard,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Zap,
  ChevronUp,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: string
  badgeColor?: string
  isNew?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard?tab=all", label: "Projects", icon: FolderOpen },
      { href: "/dashboard?tab=templates", label: "Templates", icon: Layers },
      { href: "/dashboard/assets", label: "Assets", icon: HardDrive },
    ],
  },
  {
    title: "Create",
    items: [
      { href: "/editor", label: "Editor", icon: Pencil },
      { href: "/dashboard/brand-kit", label: "Brand Kit", icon: Palette, isNew: true },
      { href: "/dashboard/history", label: "History", icon: Clock },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard, badge: "Pro" },
      { href: "/dashboard/profile", label: "Profile", icon: User },
    ],
  },
]

const STORAGE_PERCENT = 28

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await logout()
    router.replace("/auth")
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      // Active only when on /dashboard with no tab param (pure overview)
      return pathname === "/dashboard" && !searchParams.get("tab")
    }
    if (href.includes("?tab=")) {
      const hrefTab = new URLSearchParams(href.split("?")[1]).get("tab")
      return pathname === "/dashboard" && searchParams.get("tab") === hrefTab
    }
    if (href === "/editor") return pathname.startsWith("/editor")
    return pathname.startsWith(href)
  }

  // Close user menu on outside click
  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [userMenuOpen])

  const initials = (user?.displayName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 224 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full border-r border-border bg-surface/60 dark:bg-zinc-950/70 backdrop-blur-xl shrink-0 overflow-hidden z-20"
    >
      {/* ── Logo / Brand ── */}
      <div className="flex items-center h-14 border-b border-border px-3.5 gap-2.5 shrink-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/25">
          <Layers className="h-4 w-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden"
            >
              <span className="text-sm font-extrabold tracking-tight text-foreground">
                SnapStore
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Studio
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  key={`label-${section.title}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 pb-1.5"
                >
                  {section.title}
                </motion.span>
              )}
            </AnimatePresence>

            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, badge, isNew }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-primary/6"
                        transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                      />
                    )}

                    <Icon
                      className={`h-4 w-4 shrink-0 relative z-10 transition-colors ${active ? "text-primary" : ""}`}
                    />

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          key={`nav-${href}`}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.12 }}
                          className="relative z-10 whitespace-nowrap flex-1"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Badge */}
                    {!collapsed && badge && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider"
                      >
                        {badge}
                      </motion.span>
                    )}
                    {!collapsed && isNew && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-success/10 text-success border border-success/25 uppercase"
                      >
                        New
                      </motion.span>
                    )}

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <span className="absolute left-[calc(100%+8px)] z-50 hidden group-hover:block bg-popover border border-border text-foreground text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                        {label}
                        {badge && <span className="ml-1.5 text-primary text-[9px]">({badge})</span>}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Storage Usage ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            key="storage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 border-t border-border"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground">Storage</span>
              <span className="text-[10px] font-bold text-foreground">{STORAGE_PERCENT}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${STORAGE_PERCENT}%` }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">14 MB of 50 MB used</p>

            {/* Plan badge */}
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-warning bg-warning/10 border border-warning/20 rounded-lg px-2 py-1">
              <Zap className="h-3 w-3" />
              {user?.isSimulated ? "Simulated Mode" : "Free Plan"}
              <span className="ml-auto text-[9px] underline cursor-pointer hover:text-warning/80">
                Upgrade
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User Info ── */}
      <div className="shrink-0 border-t border-border p-2.5" ref={userMenuRef}>
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
              userMenuOpen
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary uppercase">{initials}</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  key="user-name"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.12 }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-[11px] font-semibold text-foreground truncate leading-none">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-[9px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <ChevronUp
                className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* User popup menu */}
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                  View Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-warning" />
                  Upgrade Plan
                </Link>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/8 cursor-pointer transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Collapsed tooltip for user */}
        {collapsed && (
          <div className="relative group mt-0">
            <span className="absolute left-[calc(100%+8px)] bottom-0 z-50 hidden group-hover:block bg-popover border border-border text-foreground text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
              {user?.displayName || "User"}
            </span>
          </div>
        )}
      </div>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[3.75rem] z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/30 cursor-pointer transition-all shadow-md"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </motion.aside>
  )
}
