"use client"

import * as React from "react"
import { useAuthStore } from "@/store/authStore"
import { motion } from "framer-motion"
import {
  Zap,
  Crown,
  Building2,
  Check,
  CreditCard,
  Receipt,
  HardDrive,
  Layers,
  Download,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlanProps {
  name: string
  price: string
  period: string
  description: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  features: string[]
  cta: string
  ctaVariant: "default" | "outline" | "premium"
  highlight?: boolean
  badge?: string
  delay: number
}

function PlanCard({
  name,
  price,
  period,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  features,
  cta,
  ctaVariant,
  highlight,
  badge,
  delay,
}: PlanProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
        highlight
          ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border bg-surface hover:border-border/80 hover:shadow-sm"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground shadow-sm uppercase tracking-wide">
            <Sparkles className="h-2.5 w-2.5" />
            {badge}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{name}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-foreground tracking-tight">{price}</span>
          {period && <span className="text-xs text-muted-foreground font-medium">{period}</span>}
        </div>
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-xs text-foreground/80">
            <Check className="h-3.5 w-3.5 text-success shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        variant={
          ctaVariant === "premium" ? "premium" : ctaVariant === "default" ? "default" : "outline"
        }
        size="sm"
        className="w-full justify-center"
      >
        {cta}
        {ctaVariant !== "outline" && <ArrowRight className="h-3.5 w-3.5 ml-1.5" />}
      </Button>
    </motion.div>
  )
}

const PLANS: Omit<PlanProps, "delay">[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    icon: Zap,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
    features: [
      "3 active projects",
      "Basic device frames (6)",
      "PNG export at 1x",
      "50 MB storage",
      "Community templates",
      "Watermark on exports",
    ],
    cta: "Current Plan",
    ctaVariant: "outline",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/ month",
    description: "For individual creators",
    icon: Crown,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    features: [
      "Unlimited projects",
      "All device frames (30+)",
      "PNG / JPEG / PDF export up to 4x",
      "5 GB storage",
      "Premium template library",
      "No watermark",
      "Brand Kit (logos, fonts, colors)",
      "Version history (30 days)",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    ctaVariant: "premium",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Business",
    price: "$39",
    period: "/ month",
    description: "For teams and agencies",
    icon: Building2,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    features: [
      "Everything in Pro",
      "Up to 10 team seats",
      "25 GB shared storage",
      "Custom brand templates",
      "Team Brand Kit",
      "Version history (unlimited)",
      "API access",
      "Dedicated account manager",
      "SLA & invoice billing",
    ],
    cta: "Contact Sales",
    ctaVariant: "default",
  },
]

const INVOICES = [
  { id: "INV-001", date: "Jun 1, 2026", amount: "$0.00", status: "Free", plan: "Free" },
  { id: "INV-002", date: "May 1, 2026", amount: "$0.00", status: "Free", plan: "Free" },
  { id: "INV-003", date: "Apr 1, 2026", amount: "$0.00", status: "Free", plan: "Free" },
]

const USAGE_STATS = [
  {
    label: "Projects",
    value: 2,
    limit: 3,
    unit: "",
    icon: Layers,
    color: "text-primary",
    bg: "bg-primary/10",
    pct: 67,
  },
  {
    label: "Storage",
    value: 14,
    limit: 50,
    unit: "MB",
    icon: HardDrive,
    color: "text-secondary",
    bg: "bg-secondary/10",
    pct: 28,
  },
  {
    label: "Exports",
    value: 8,
    limit: 20,
    unit: "",
    icon: Download,
    color: "text-accent",
    bg: "bg-accent/10",
    pct: 40,
  },
]

export default function BillingPage() {
  const { user } = useAuthStore()

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-md shrink-0 px-6 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">Billing & Plans</h1>
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            Manage your subscription, usage, and invoices
          </p>
        </div>
        {user?.isSimulated && (
          <span className="badge-warning text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Simulated Mode
          </span>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
          {/* Current Plan Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 to-secondary/5 p-5"
          >
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Current Plan
                  </p>
                  <h2 className="text-xl font-black text-foreground tracking-tight">Free Plan</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Renews automatically — no credit card required
                  </p>
                </div>
              </div>
              <Button variant="premium" size="sm">
                <Crown className="h-3.5 w-3.5 mr-1.5" />
                Upgrade to Pro
              </Button>
            </div>
          </motion.div>

          {/* Usage Stats */}
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="text-xs font-bold text-foreground uppercase tracking-widest mb-3 flex items-center gap-2"
            >
              <span className="h-px flex-1 bg-border" />
              <span>Usage This Month</span>
              <span className="h-px flex-1 bg-border" />
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {USAGE_STATS.map(({ label, value, limit, unit, icon: Icon, color, bg, pct }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${bg} ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xl font-black text-foreground">{value}</span>
                    <span className="text-xs text-muted-foreground">
                      / {limit}
                      {unit && ` ${unit}`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{pct}% used</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Plan Comparison */}
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2"
            >
              <span className="h-px flex-1 bg-border" />
              <span>Available Plans</span>
              <span className="h-px flex-1 bg-border" />
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PLANS.map((plan, i) => (
                <PlanCard key={plan.name} {...plan} delay={0.22 + i * 0.08} />
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.42 }}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Payment Method</h3>
              </div>
              <Button size="sm" variant="outline" disabled={user?.isSimulated}>
                Add Card
              </Button>
            </div>
            <div className="px-5 py-5 flex flex-col items-center justify-center gap-2 text-center min-h-[100px]">
              <Shield className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No payment method on file</p>
              <p className="text-[11px] text-muted-foreground/60">
                Add a card to upgrade your plan. We support Visa, Mastercard, and AMEX.
              </p>
            </div>
          </motion.div>

          {/* Invoice History */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.48 }}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Receipt className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Billing History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-semibold text-foreground">
                        {inv.id}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> {inv.date}
                      </td>
                      <td className="px-4 py-3.5 text-foreground">{inv.plan}</td>
                      <td className="px-4 py-3.5 font-bold text-foreground">{inv.amount}</td>
                      <td className="px-4 py-3.5">
                        <span className="badge-success text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="text-[10px] text-primary hover:underline font-semibold">
                          <Download className="h-3 w-3 inline mr-1" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
