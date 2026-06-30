"use client"

import * as React from "react"
import { Project } from "@/types/project"
import { motion } from "framer-motion"
import { Layers, Activity, HardDrive } from "lucide-react"

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
      title: "Total Workspace Projects",
      value: totalProjects,
      description: `${activeProjects} active, ${archivedProjects} archived`,
      icon: Layers,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Storage Space Used",
      value: `${simulatedUsedMb.toFixed(1)} MB`,
      description: `${storagePercent}% of ${storageLimitMb} MB limit`,
      icon: HardDrive,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      progress: storagePercent,
    },
    {
      title: "Active Quick Shares",
      value: activeProjects,
      description: "Direct rendering enabled",
      icon: Activity,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="border border-border bg-surface rounded-xl p-5 flex flex-col justify-between hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium tracking-tight">
                  {stat.title}
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bgColor} ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {stat.progress !== undefined ? (
              <div className="mt-4 space-y-1.5">
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground flex justify-between">
                  <span>Usage status: Safe</span>
                  <span>{stat.description}</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground mt-3">{stat.description}</p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
