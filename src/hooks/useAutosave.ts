"use client"

import { useEffect, useRef, useState } from "react"
import { useDebounce } from "./useDebounce"
import { ProjectRepository } from "@/features/projects/data/project-repository"
import { HistoryRepository } from "@/features/projects/data/history-repository"
import { Page, CanvasBackground } from "@/types/project"
import { useEditorStore } from "@/store/editorStore"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

interface UseAutosaveOptions {
  projectId: string | undefined
  canvasWidth: number
  canvasHeight: number
  pages: Page[]
  currentPageId: string
  background: CanvasBackground
  enabled?: boolean
  delayMs?: number
}

/**
 * @hook useAutosave
 * Debounce-driven autosave for the editor canvas.
 * Silently persists canvas changes to the project repository
 * 4 seconds after the last edit (configurable via delayMs).
 *
 * Returns the current save status for display in the toolbar.
 */
export function useAutosave({
  projectId,
  canvasWidth,
  canvasHeight,
  pages,
  currentPageId,
  background,
  enabled = true,
  delayMs = 4000,
}: UseAutosaveOptions): { saveStatus: SaveStatus; lastSavedAt: Date | null } {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // Track whether we're mounted (avoid saving on initial render)
  const isMountedRef = useRef(false)
  const saveCountRef = useRef(0)

  // Serialize pages to a stable string so useDebounce can detect actual changes
  const pagesJson = JSON.stringify(pages)
  const debouncedPagesJson = useDebounce(pagesJson, delayMs)

  useEffect(() => {
    // Skip the very first render — we don't want to save on mount
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }

    if (!enabled || !projectId) return

    const saveCount = ++saveCountRef.current

    const performSave = async () => {
      setSaveStatus("saving")
      try {
        const canvasData = {
          width: canvasWidth,
          height: canvasHeight,
          pages,
          currentPageId,
          layers: pages.find((p) => p.id === currentPageId)?.layers || [],
          background: pages.find((p) => p.id === currentPageId)?.background || background,
        }

        let thumbnailUrl: string | undefined
        try {
          const thumb = useEditorStore.getState().thumbnailCallback?.()
          if (thumb) thumbnailUrl = thumb
        } catch {
          /* ignore thumbnail failures */
        }

        await ProjectRepository.updateProject(projectId, {
          canvas_data: canvasData,
          ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
        })

        // Snapshot for version history (only if this is the latest save)
        if (saveCount === saveCountRef.current) {
          HistoryRepository.saveSnapshot(projectId, canvasData)
        }

        setSaveStatus("saved")
        setLastSavedAt(new Date())

        // Revert to idle after 3 seconds
        const timer = setTimeout(() => setSaveStatus("idle"), 3000)
        return () => clearTimeout(timer)
      } catch {
        setSaveStatus("error")
        const timer = setTimeout(() => setSaveStatus("idle"), 5000)
        return () => clearTimeout(timer)
      }
    }

    performSave()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPagesJson])

  return { saveStatus, lastSavedAt }
}
