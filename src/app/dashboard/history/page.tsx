"use client"

import * as React from "react"
import { useProjectsQuery } from "@/features/projects/hooks/useProjects"
import { HistoryRepository, ProjectSnapshot } from "@/features/projects/data/history-repository"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Clock,
  Layers,
  GitBranch,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Search,
  FolderOpen,
  Save,
  Zap,
  Calendar,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog"

interface GroupedHistory {
  project: { id: string; name: string }
  snapshots: ProjectSnapshot[]
}

function formatRelativeTime(iso: string): string {
  try {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const mins = Math.floor(diffMs / 60_000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return "Yesterday"
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return "Unknown"
  }
}

function formatFullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

function getSnapshotIcon(label: string) {
  if (label.toLowerCase().includes("auto")) return Zap
  if (label.toLowerCase().includes("manual")) return Save
  return GitBranch
}

function getSnapshotColor(label: string) {
  if (label.toLowerCase().includes("auto")) return "text-muted-foreground bg-muted"
  if (label.toLowerCase().includes("manual")) return "text-primary bg-primary/10"
  return "text-secondary bg-secondary/10"
}

export default function HistoryPage() {
  const router = useRouter()
  const { data: projects = [] } = useProjectsQuery()

  const [search, setSearch] = React.useState("")
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [allHistory, setAllHistory] = React.useState<GroupedHistory[]>([])
  const { confirm: showConfirm, dialogProps } = useConfirm()

  // Load all project snapshots from localStorage
  React.useEffect(() => {
    if (projects.length === 0) return
    const grouped: GroupedHistory[] = projects
      .map((p) => ({
        project: { id: p.id, name: p.name },
        snapshots: HistoryRepository.getSnapshots(p.id),
      }))
      .filter((g) => g.snapshots.length > 0)
      .sort((a, b) => {
        const aLatest = a.snapshots[0]?.savedAt ?? ""
        const bLatest = b.snapshots[0]?.savedAt ?? ""
        return bLatest.localeCompare(aLatest)
      })
    setAllHistory(grouped)

    // Auto-expand first group
    if (grouped.length > 0) {
      setExpanded({ [grouped[0].project.id]: true })
    }
  }, [projects])

  const handleDeleteSnapshot = (projectId: string, snapshotId: string) => {
    HistoryRepository.deleteSnapshot(projectId, snapshotId)
    setAllHistory((prev) =>
      prev
        .map((g) =>
          g.project.id === projectId
            ? { ...g, snapshots: g.snapshots.filter((s) => s.id !== snapshotId) }
            : g
        )
        .filter((g) => g.snapshots.length > 0)
    )
  }

  const handleClearProject = async (projectId: string, projectName: string) => {
    const ok = await showConfirm({
      title: `Clear history for "${projectName}"?`,
      description: "All saved snapshots for this project will be permanently deleted.",
      confirmLabel: "Clear History",
      variant: "warning",
    })
    if (!ok) return
    HistoryRepository.clearHistory(projectId)
    setAllHistory((prev) => prev.filter((g) => g.project.id !== projectId))
  }

  const toggleGroup = (projectId: string) => {
    setExpanded((prev) => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  // Filter by search
  const filtered = React.useMemo(() => {
    if (!search.trim()) return allHistory
    const q = search.toLowerCase()
    return allHistory
      .map((g) => ({
        ...g,
        snapshots: g.snapshots.filter(
          (s) => g.project.name.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.snapshots.length > 0 || g.project.name.toLowerCase().includes(q))
  }, [allHistory, search])

  const totalSnapshots = allHistory.reduce((acc, g) => acc + g.snapshots.length, 0)

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <ConfirmDialog {...dialogProps} />
      {/* Header */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-md shrink-0 px-6 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">Version History</h1>
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            {totalSnapshots} snapshot{totalSnapshots !== 1 ? "s" : ""} across {allHistory.length}{" "}
            project{allHistory.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Snapshots",
                value: totalSnapshots,
                icon: GitBranch,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: "Projects Tracked",
                value: allHistory.length,
                icon: FolderOpen,
                color: "text-secondary",
                bg: "bg-secondary/10",
              },
              {
                label: "Auto-saves",
                value: allHistory.reduce(
                  (a, g) =>
                    a + g.snapshots.filter((s) => s.label.toLowerCase().includes("auto")).length,
                  0
                ),
                icon: Zap,
                color: "text-warning",
                bg: "bg-warning/10",
              },
            ].map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-border bg-surface p-4 flex items-center gap-3"
              >
                <div className={`p-2 rounded-lg ${bg} ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                  <p className="text-xl font-black text-foreground">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-surface border-border"
            />
          </div>

          {/* History Groups */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-dashed border-border rounded-2xl p-16 text-center space-y-3"
            >
              <div className="mx-auto h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                <Clock className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {search ? "No matching history" : "No version history yet"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  {search
                    ? "Try adjusting your search query."
                    : "Open a project in the Editor and make changes — snapshots are saved automatically."}
                </p>
              </div>
              {!search && (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Go to Projects
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filtered.map((group, gi) => (
                <motion.div
                  key={group.project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.05 }}
                  className="rounded-2xl border border-border bg-surface overflow-hidden"
                >
                  {/* Group Header */}
                  <div
                    className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => toggleGroup(group.project.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderOpen className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{group.project.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {group.snapshots.length} snapshot{group.snapshots.length !== 1 ? "s" : ""}
                          {" · "} Latest: {formatRelativeTime(group.snapshots[0]?.savedAt ?? "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/editor?id=${group.project.id}`)
                        }}
                        className="text-[10px] text-primary hover:underline font-semibold px-2 py-1 rounded-lg hover:bg-primary/5"
                      >
                        Open
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleClearProject(group.project.id, group.project.name)
                        }}
                        className="text-[10px] text-muted-foreground hover:text-destructive font-semibold px-2 py-1 rounded-lg hover:bg-destructive/5 transition-colors"
                      >
                        Clear
                      </button>
                      {expanded[group.project.id] ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Snapshot List */}
                  <AnimatePresence>
                    {expanded[group.project.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border divide-y divide-border/60">
                          {group.snapshots.map((snap, si) => {
                            const SnapIcon = getSnapshotIcon(snap.label)
                            const snapColor = getSnapshotColor(snap.label)
                            const layerCount = snap.canvasData.layers?.length ?? 0

                            return (
                              <motion.div
                                key={snap.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: si * 0.04 }}
                                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                              >
                                {/* Icon */}
                                <div
                                  className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center ${snapColor}`}
                                >
                                  <SnapIcon className="h-3.5 w-3.5" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">
                                    {snap.label}
                                  </p>
                                  <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Calendar className="h-2.5 w-2.5" />
                                      {formatFullDate(snap.savedAt)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/60">·</span>
                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Layers className="h-2.5 w-2.5" />
                                      {layerCount} layer{layerCount !== 1 ? "s" : ""}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/60">·</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatRelativeTime(snap.savedAt)}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    title="Restore this version"
                                    onClick={() => router.push(`/editor?id=${group.project.id}`)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 cursor-pointer transition-colors"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    title="Delete snapshot"
                                    onClick={() => handleDeleteSnapshot(group.project.id, snap.id)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
