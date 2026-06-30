"use client"

import * as React from "react"
import { useEditorStore } from "@/store/editorStore"
import { HistoryRepository, ProjectSnapshot } from "@/features/projects/data/history-repository"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, RotateCcw, Trash2, AlertCircle } from "lucide-react"
import { Page } from "@/types/project"
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog"

interface HistoryPanelProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

function timeAgo(isoDate: string): string {
  try {
    const diff = (Date.now() - new Date(isoDate).getTime()) / 1000
    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Unknown"
  }
}

export function HistoryPanel({ projectId, isOpen, onClose }: HistoryPanelProps) {
  const { setPages, setCurrentPageId, setBackground, setCanvasDimensions } = useEditorStore()
  const [snapshots, setSnapshots] = React.useState<ProjectSnapshot[]>([])
  const [restoringId, setRestoringId] = React.useState<string | null>(null)
  const [restoredId, setRestoredId] = React.useState<string | null>(null)
  const { confirm: showConfirm, dialogProps } = useConfirm()

  // Load snapshots whenever panel opens
  React.useEffect(() => {
    if (isOpen && projectId) {
      setSnapshots(HistoryRepository.getSnapshots(projectId))
    }
  }, [isOpen, projectId])

  const handleRestore = (snapshot: ProjectSnapshot) => {
    setRestoringId(snapshot.id)

    try {
      const { canvasData } = snapshot

      // Restore canvas dimensions
      setCanvasDimensions(canvasData.width, canvasData.height)

      // Restore pages (multi-page) or migrate single-page legacy data
      if (canvasData.pages && canvasData.pages.length > 0) {
        setPages(canvasData.pages as Page[])
        const targetPageId = canvasData.currentPageId || canvasData.pages[0].id
        setCurrentPageId(targetPageId)
        const activePage =
          canvasData.pages.find((p) => p.id === targetPageId) || canvasData.pages[0]
        setBackground(activePage.background)
      } else if (canvasData.background) {
        setBackground(canvasData.background)
      }

      setRestoredId(snapshot.id)
      setTimeout(() => setRestoredId(null), 3000)
    } finally {
      setRestoringId(null)
    }
  }

  const handleDelete = (snapshotId: string) => {
    HistoryRepository.deleteSnapshot(projectId, snapshotId)
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId))
  }

  const handleClearAll = async () => {
    const ok = await showConfirm({
      title: "Clear version history?",
      description: "All saved snapshots for this project will be permanently deleted.",
      confirmLabel: "Clear History",
      variant: "warning",
    })
    if (!ok) return
    HistoryRepository.clearHistory(projectId)
    setSnapshots([])
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="history-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="history-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3.5 shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">Version History</h2>
              </div>
              <div className="flex items-center gap-2">
                {snapshots.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] text-zinc-500 hover:text-red-400 cursor-pointer transition-colors font-semibold"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Snapshot List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {snapshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-300">No versions yet</p>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      Versions are created automatically when you save, or you can save manually.
                    </p>
                  </div>
                </div>
              ) : (
                snapshots.map((snap, idx) => {
                  const isRestored = restoredId === snap.id
                  const isRestoring = restoringId === snap.id

                  return (
                    <motion.div
                      key={snap.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`group relative border rounded-xl p-3 transition-all duration-200 ${
                        isRestored
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 hover:bg-zinc-900/40"
                      }`}
                    >
                      {/* Snapshot info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                snap.label === "Manual save"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {snap.label}
                            </span>
                            {idx === 0 && (
                              <span className="text-[9px] text-emerald-400 font-semibold">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-zinc-200 mt-1.5">
                            {snap.canvasData.width} × {snap.canvasData.height} px
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {snap.canvasData.pages?.length ?? 1} screen
                            {(snap.canvasData.pages?.length ?? 1) !== 1 ? "s" : ""} ·{" "}
                            {timeAgo(snap.savedAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleRestore(snap)}
                            disabled={isRestoring}
                            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
                            title="Restore this version"
                          >
                            <RotateCcw
                              className={`h-3.5 w-3.5 ${isRestoring ? "animate-spin" : ""}`}
                            />
                          </button>
                          <button
                            onClick={() => handleDelete(snap.id)}
                            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 cursor-pointer transition-colors"
                            title="Delete this snapshot"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Restored badge */}
                      {isRestored && (
                        <div className="flex items-center gap-1 mt-2 text-emerald-400 text-[10px] font-semibold">
                          <AlertCircle className="h-3 w-3" />
                          Canvas restored — remember to save!
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Footer note */}
            <div className="shrink-0 border-t border-zinc-900 px-4 py-3">
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                Up to 10 versions are stored per project. Older snapshots are pruned automatically.
              </p>
            </div>
            <ConfirmDialog {...dialogProps} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
