"use client"

import * as React from "react"
import { Project } from "@/types/project"
import { motion } from "framer-motion"
import { Layers, HardDrive, Zap } from "lucide-react"

interface DashboardStatsProps {
  projects: Project[]
}

export function DashboardStats({ projects }: DashboardStatsProps) {
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => !p.is_archived).length
  const archivedProjects = projects.filter((p) => p.is_archived).length

  const storageLimitMb = 50
  const simulatedUsedMb = Math.min(totalProjects * 2.4 + 1.2, storageLimitMb)
  const storagePercent = Math.round((simulatedUsedMb / storageLimitMb) * 100)

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      sub: `${activeProjects} active · ${archivedProjects} archived`,
      icon: Layers,
      accent: "from-primary to-secondary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      bar: null,
    },
    {
      title: "Storage Used",
      value: `${simulatedUsedMb.toFixed(1)} MB`,
      sub: `${storagePercent}% of ${storageLimitMb} MB limit`,
      icon: HardDrive,
      accent: "from-secondary to-accent",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      bar: storagePercent,
    },
    {
      title: "Active Designs",
      value: activeProjects,
      sub: "Ready to export",
      icon: Zap,
      accent: "from-accent to-primary",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      bar: null,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 h-full">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: idx * 0.07, ease: "easeOut" }}
            className="relative border border-border bg-surface rounded-2xl overflow-hidden flex flex-col justify-between hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
          >
            {/* Accent gradient top bar */}
            <div
              className={`h-0.5 w-full bg-gradient-to-r ${stat.accent} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div className="p-5 flex flex-col gap-4 flex-1">
              <div className="flex items-start justify-between">
                <span className="text-xs text-muted-foreground font-medium leading-snug max-w-[120px]">
                  {stat.title}
                </span>
                <div
                  className={`p-2.5 rounded-xl ${stat.iconBg} ${stat.iconColor} shrink-0 group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                  {stat.value}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
              </div>

              {stat.bar !== null && (
                <div className="space-y-1.5 mt-auto">
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.bar}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.07 + 0.2, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${stat.accent} rounded-full`}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/70">
                    {stat.bar < 60
                      ? "Safe — plenty of room"
                      : stat.bar < 85
                        ? "Moderate usage"
                        : "Approaching limit"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
