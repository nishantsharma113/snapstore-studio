"use client"

import * as React from "react"
import { Project } from "@/types/project"

interface ActivityChartProps {
  projects: Project[]
}

function getActivityData(projects: Project[]) {
  const days = 7
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: days }, (_, i) => {
    const day = new Date(today)
    day.setDate(today.getDate() - (days - 1 - i))
    const nextDay = new Date(day)
    nextDay.setDate(day.getDate() + 1)

    const count = projects.filter((p) => {
      const updated = new Date(p.updated_at)
      return updated >= day && updated < nextDay
    }).length

    return {
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      count,
      date: day,
    }
  })
}

export function ActivityChart({ projects }: ActivityChartProps) {
  const data = React.useMemo(() => getActivityData(projects), [projects])
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  const chartH = 80
  const barW = 28
  const gap = 8
  const totalW = data.length * (barW + gap) - gap

  return (
    <div className="border border-border bg-surface rounded-xl p-5 hover:border-primary/20 transition-all duration-300 h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs text-muted-foreground font-medium">Activity</span>
          <h3 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            {projects.length}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">total projects created</p>
        </div>
        <div className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Last 7 days
        </div>
      </div>

      {/* SVG fills use CSS custom properties so they respond to theme */}
      <svg
        viewBox={`0 0 ${totalW} ${chartH + 20}`}
        className="w-full overflow-visible"
        style={{ height: chartH + 20 }}
      >
        {data.map((d, i) => {
          const barH = maxCount > 0 ? Math.max(4, (d.count / maxCount) * chartH) : 4
          const x = i * (barW + gap)
          const y = chartH - barH
          const isToday = i === data.length - 1

          return (
            <g key={d.label}>
              {/* Background track */}
              <rect
                x={x}
                y={0}
                width={barW}
                height={chartH}
                rx={6}
                style={{ fill: "hsl(var(--muted))" }}
              />
              {/* Value bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={6}
                style={{
                  fill: isToday
                    ? "hsl(var(--primary))"
                    : d.count > 0
                      ? "hsl(var(--primary) / 0.45)"
                      : "hsl(var(--muted-foreground) / 0.2)",
                }}
              />
              {/* Day label */}
              <text
                x={x + barW / 2}
                y={chartH + 14}
                textAnchor="middle"
                style={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 9,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                {d.label}
              </text>
              {/* Count above active bar */}
              {d.count > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle"
                  style={{
                    fill: "hsl(var(--primary))",
                    fontSize: 8,
                    fontWeight: 700,
                    fontFamily: "inherit",
                  }}
                >
                  {d.count}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
