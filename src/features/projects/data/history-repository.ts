import { CanvasData } from "@/types/project"

export interface ProjectSnapshot {
  id: string
  projectId: string
  savedAt: string // ISO date
  canvasData: CanvasData
  label: string // e.g. "Auto-save" | "Manual save"
}

const HISTORY_KEY_PREFIX = "snapstore_history_"
const MAX_SNAPSHOTS = 10

/**
 * @module HistoryRepository
 * Manages per-project version snapshots in localStorage.
 * Stores up to MAX_SNAPSHOTS snapshots per project, pruning oldest first.
 */
export const HistoryRepository = {
  getKey: (projectId: string) => `${HISTORY_KEY_PREFIX}${projectId}`,

  getSnapshots: (projectId: string): ProjectSnapshot[] => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(HistoryRepository.getKey(projectId))
      return raw ? (JSON.parse(raw) as ProjectSnapshot[]) : []
    } catch {
      return []
    }
  },

  saveSnapshot: (
    projectId: string,
    canvasData: CanvasData,
    label: string = "Auto-save"
  ): ProjectSnapshot => {
    const snapshot: ProjectSnapshot = {
      id: "snap_" + Math.random().toString(36).substr(2, 9),
      projectId,
      savedAt: new Date().toISOString(),
      canvasData,
      label,
    }

    if (typeof window === "undefined") return snapshot

    const existing = HistoryRepository.getSnapshots(projectId)

    // Prepend new snapshot and keep only MAX_SNAPSHOTS
    const updated = [snapshot, ...existing].slice(0, MAX_SNAPSHOTS)
    try {
      localStorage.setItem(HistoryRepository.getKey(projectId), JSON.stringify(updated))
    } catch {
      // localStorage quota exceeded — silently drop the snapshot
    }

    return snapshot
  },

  deleteSnapshot: (projectId: string, snapshotId: string): void => {
    if (typeof window === "undefined") return
    const existing = HistoryRepository.getSnapshots(projectId)
    const updated = existing.filter((s) => s.id !== snapshotId)
    localStorage.setItem(HistoryRepository.getKey(projectId), JSON.stringify(updated))
  },

  clearHistory: (projectId: string): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(HistoryRepository.getKey(projectId))
  },
}
