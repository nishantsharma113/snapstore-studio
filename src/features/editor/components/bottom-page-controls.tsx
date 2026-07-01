"use client"

import * as React from "react"
import { useEditorStore } from "@/store/editorStore"
import { Plus, Copy, Edit2, Trash2, ZoomIn, ZoomOut, Check, X } from "lucide-react"
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog"

export function BottomPageControls() {
  const {
    pages,
    currentPageId,
    setCurrentPageId,
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
    zoom,
    setZoom,
  } = useEditorStore()

  const [isRenaming, setIsRenaming] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState("")
  const { confirm: showConfirm, dialogProps } = useConfirm()

  const activePage = React.useMemo(() => {
    return pages.find((p) => p.id === currentPageId) || null
  }, [pages, currentPageId])

  // Initialize rename value when activePage changes or renaming starts
  React.useEffect(() => {
    if (activePage) {
      setRenameValue(activePage.name)
    }
  }, [activePage, isRenaming])

  const handleStartRename = () => {
    if (activePage) {
      setRenameValue(activePage.name)
      setIsRenaming(true)
    }
  }

  const handleSaveRename = () => {
    if (activePage && renameValue.trim() !== "") {
      renamePage(activePage.id, renameValue.trim())
      setIsRenaming(false)
    }
  }

  const handleCancelRename = () => {
    setIsRenaming(false)
  }

  const handleDelete = async () => {
    if (!activePage) return
    if (pages.length <= 1) return

    const ok = await showConfirm({
      title: `Delete "${activePage.name}"?`,
      description: "This screen and all its layers will be permanently removed.",
      confirmLabel: "Delete Screen",
      variant: "danger",
    })
    if (ok) deletePage(activePage.id)
  }

  if (pages.length === 0) return null

  return (
    <div className="shrink-0 bg-zinc-950 border-t border-zinc-900 px-4 py-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
      {/* Left: Page Navigation & Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider hidden md:inline">
          Active Screen:
        </span>

        {isRenaming ? (
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveRename()
                if (e.key === "Escape") handleCancelRename()
              }}
              className="bg-zinc-900 border border-purple-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 h-8 w-44"
              autoFocus
            />
            <button
              onClick={handleSaveRename}
              className="p-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 cursor-pointer h-8 w-8 flex items-center justify-center transition-colors"
              title="Save Name"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleCancelRename}
              className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer h-8 w-8 flex items-center justify-center transition-colors"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <select
              value={currentPageId}
              onChange={(e) => setCurrentPageId(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer h-8 max-w-[200px]"
            >
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Rename Page Button */}
            <button
              onClick={handleStartRename}
              className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-900/20 text-zinc-400 hover:text-white hover:bg-zinc-900/60 cursor-pointer h-8 w-8 flex items-center justify-center transition-colors"
              title="Rename Screen"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="h-4 w-[1px] bg-zinc-900 mx-1 hidden sm:block" />

        {/* Page Mutation Actions */}
        <div className="flex items-center gap-1">
          {/* Add Page Button */}
          <button
            onClick={() => addPage()}
            className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-950/25 text-zinc-400 hover:text-white hover:bg-zinc-900/60 cursor-pointer h-8 w-8 flex items-center justify-center transition-colors"
            title="Add New Screen"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Duplicate Page Button */}
          <button
            onClick={() => duplicatePage(currentPageId)}
            className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-950/25 text-zinc-400 hover:text-white hover:bg-zinc-900/60 cursor-pointer h-8 w-8 flex items-center justify-center transition-colors"
            title="Duplicate Screen"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* Delete Page Button */}
          <button
            onClick={handleDelete}
            disabled={pages.length <= 1}
            className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-950/25 text-zinc-400 hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-zinc-900/20 disabled:hover:text-zinc-400 disabled:cursor-not-allowed cursor-pointer h-8 w-8 flex items-center justify-center transition-colors"
            title="Delete Screen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Zoom Range controls */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider hidden md:inline">
          Zoom Stage:
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(zoom - 0.05)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/20 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <input
            type="range"
            min="0.05"
            max="2"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24 sm:w-36 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
            title="Zoom Slider"
          />

          <button
            onClick={() => setZoom(zoom + 0.05)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/20 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className="text-xs font-bold text-zinc-400 min-w-[36px] text-center">
          {Math.round(zoom * 100)}%
        </span>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}
