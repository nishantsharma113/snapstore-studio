"use client"

import * as React from "react"
import { useEditorStore } from "@/store/editorStore"
import { useUpdateProjectMutation } from "@/features/projects/hooks/useProjects"
import { useAutosave } from "@/hooks/useAutosave"
import { HistoryRepository } from "@/features/projects/data/history-repository"
import { CustomTemplatesRepository } from "@/features/projects/data/custom-templates-repository"
import { HistoryPanel } from "./history-panel"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  Loader2,
  Clock,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Maximize2,
} from "lucide-react"

export function TopToolbar() {
  const router = useRouter()
  const {
    activeProject,
    canvasWidth,
    canvasHeight,
    layers,
    background,
    pages,
    currentPageId,
    zoom,
    setZoom,
    undo,
    redo,
    history,
    historyIndex,
    exportCallback,
    setCanvasDimensions,
  } = useEditorStore()

  const updateMutation = useUpdateProjectMutation()
  const [exportOpen, setExportOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [saveMsg, setSaveMsg] = React.useState<string | null>(null)
  const exportMenuRef = React.useRef<HTMLDivElement>(null)
  const saveTemplateRef = React.useRef<HTMLDivElement>(null)
  const resizeMenuRef = React.useRef<HTMLDivElement>(null)
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false)
  const [templateName, setTemplateName] = React.useState("")
  const [resizeOpen, setResizeOpen] = React.useState(false)
  const [customW, setCustomW] = React.useState(canvasWidth)
  const [customH, setCustomH] = React.useState(canvasHeight)

  // Autosave
  const { saveStatus } = useAutosave({
    projectId: activeProject?.id,
    canvasWidth,
    canvasHeight,
    pages,
    currentPageId,
    background,
    enabled: !!activeProject,
  })

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportOpen(false)
      }
      if (saveTemplateRef.current && !saveTemplateRef.current.contains(event.target as Node)) {
        setTemplateDialogOpen(false)
      }
      if (resizeMenuRef.current && !resizeMenuRef.current.contains(event.target as Node)) {
        setResizeOpen(false)
      }
    }
    if (exportOpen || templateDialogOpen || resizeOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [exportOpen, templateDialogOpen, resizeOpen])

  const buildCanvasData = () => ({
    width: canvasWidth,
    height: canvasHeight,
    pages,
    currentPageId,
    layers: pages.find((p) => p.id === currentPageId)?.layers || layers,
    background: pages.find((p) => p.id === currentPageId)?.background || background,
  })

  const handleSave = async () => {
    if (!activeProject) return
    try {
      const canvasData = buildCanvasData()
      await updateMutation.mutateAsync({
        projectId: activeProject.id,
        updates: { canvas_data: canvasData },
      })
      // Record manual snapshot
      HistoryRepository.saveSnapshot(activeProject.id, canvasData, "Manual save")
      setSaveMsg("Saved!")
      setTimeout(() => setSaveMsg(null), 3000)
    } catch (err) {
      setSaveMsg("Save failed")
      setTimeout(() => setSaveMsg(null), 4000)
      console.error(err)
    }
  }

  const handleExport = async (
    format: "png" | "jpeg" | "pdf" | "transparent",
    scale: number,
    target: "active" | "all"
  ) => {
    setExportOpen(false)
    if (!exportCallback) {
      alert("Canvas workspace is still loading.")
      return
    }
    setIsExporting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      await exportCallback(format, scale, target)
    } catch (err) {
      console.error(err)
      alert("Failed to export image: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsExporting(false)
    }
  }

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) return
    const canvasData = buildCanvasData()
    CustomTemplatesRepository.save(templateName.trim(), canvasData)
    setTemplateDialogOpen(false)
    setTemplateName("")
    setSaveMsg("Template saved!")
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Autosave status badge
  const AutosaveBadge = () => {
    if (saveStatus === "saving") {
      return (
        <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          Saving…
        </span>
      )
    }
    if (saveStatus === "saved") {
      return (
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Auto-saved
        </span>
      )
    }
    if (saveStatus === "error") {
      return (
        <span className="flex items-center gap-1 text-[10px] text-red-400 font-medium">
          <AlertCircle className="h-2.5 w-2.5" />
          Save failed
        </span>
      )
    }
    return null
  }

  return (
    <>
      <header className="border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md px-6 h-14 flex items-center justify-between sticky top-0 z-40 select-none">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1 rounded-lg border border-zinc-900 bg-zinc-900/20 text-zinc-400 hover:text-white hover:bg-zinc-900/60 cursor-pointer transition-colors"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-100 truncate max-w-[160px] md:max-w-xs">
              {activeProject?.name || "Untitled Design"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                {canvasWidth} × {canvasHeight} px ({pages.length} screen
                {pages.length !== 1 ? "s" : ""})
              </span>
              {saveMsg ? (
                <span className="text-[10px] text-emerald-400 font-semibold">· {saveMsg}</span>
              ) : (
                <AutosaveBadge />
              )}
            </div>
          </div>
        </div>

        {/* Center: History & Zoom */}
        <div className="flex items-center gap-6">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1.5 border-r border-zinc-900 pr-6">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/40 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/40 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(zoom - 0.05)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/20 cursor-pointer"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-bold text-zinc-500 min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(zoom + 0.05)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/20 cursor-pointer"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right: History + Save + Export */}
        <div className="flex items-center gap-2">
          {/* Canvas Resize */}
          <div className="relative" ref={resizeMenuRef}>
            <button
              onClick={() => {
                setCustomW(canvasWidth)
                setCustomH(canvasHeight)
                setResizeOpen((o) => !o)
              }}
              className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-900/20 text-zinc-400 hover:text-white hover:bg-zinc-900/60 cursor-pointer transition-colors"
              title="Canvas Size"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {resizeOpen && (
              <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl space-y-3">
                <p className="text-xs font-bold text-zinc-200">Canvas Size</p>

                {/* Platform presets */}
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    App Store
                  </span>
                  {[
                    { label: 'iPhone 6.7" (Portrait)', w: 1290, h: 2796 },
                    { label: 'iPhone 6.5" (Portrait)', w: 1242, h: 2688 },
                    { label: 'iPad Pro 12.9"', w: 2048, h: 2732 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setCanvasDimensions(p.w, p.h)
                        setResizeOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer transition-colors"
                    >
                      <span>{p.label}</span>
                      <span className="text-[9px] text-zinc-500 font-medium">
                        {p.w}×{p.h}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    Google Play
                  </span>
                  {[
                    { label: "Phone Portrait", w: 1080, h: 1920 },
                    { label: 'Tablet 7"', w: 1200, h: 1920 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setCanvasDimensions(p.w, p.h)
                        setResizeOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer transition-colors"
                    >
                      <span>{p.label}</span>
                      <span className="text-[9px] text-zinc-500 font-medium">
                        {p.w}×{p.h}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom dimensions */}
                <div className="border-t border-zinc-900 pt-2 space-y-2">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    Custom
                  </span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={customW}
                      min={100}
                      max={8000}
                      onChange={(e) => setCustomW(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Width"
                    />
                    <span className="text-zinc-600 text-xs">×</span>
                    <input
                      type="number"
                      value={customH}
                      min={100}
                      max={8000}
                      onChange={(e) => setCustomH(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Height"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setCanvasDimensions(customW, customH)
                      setResizeOpen(false)
                    }}
                    className="w-full py-1.5 text-xs bg-purple-600/20 text-purple-300 border border-purple-500/20 rounded-lg hover:bg-purple-600/30 cursor-pointer font-semibold transition-colors"
                  >
                    Apply Custom Size
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Version History */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-900/20 text-zinc-400 hover:text-white hover:bg-zinc-900/60 cursor-pointer transition-colors"
            title="Version History"
          >
            <Clock className="h-4 w-4" />
          </button>

          {/* Save as Template */}
          <div className="relative" ref={saveTemplateRef}>
            <button
              onClick={() => {
                setTemplateName(
                  activeProject?.name ? `${activeProject.name} Template` : "My Template"
                )
                setTemplateDialogOpen((o) => !o)
              }}
              className="p-1.5 rounded-lg border border-zinc-900 bg-zinc-900/20 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-500/5 hover:border-yellow-500/20 cursor-pointer transition-colors"
              title="Save as Template"
            >
              <Bookmark className="h-4 w-4" />
            </button>

            {templateDialogOpen && (
              <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
                <p className="text-xs font-bold text-zinc-200 mb-2">Save as Template</p>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveAsTemplate()
                    if (e.key === "Escape") setTemplateDialogOpen(false)
                  }}
                />
                <div className="flex justify-end gap-2 mt-2.5">
                  <button
                    onClick={() => setTemplateDialogOpen(false)}
                    className="px-2.5 py-1 text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAsTemplate}
                    className="px-3 py-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 cursor-pointer font-semibold transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Manual Save */}
          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 hover:text-white text-xs h-8 cursor-pointer"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 text-purple-400" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
            )}
            <span>Save</span>
          </Button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              onClick={() => setExportOpen(!exportOpen)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs h-8 shadow-lg hover:shadow-purple-500/15 cursor-pointer"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export
                </>
              )}
            </Button>

            {exportOpen && (
              <div className="absolute right-0 top-9 z-50 w-60 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
                {/* ── Single Screen ── */}
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-2.5 py-1 block">
                  Active Screen
                </span>
                {(["png", "jpeg", "pdf", "transparent"] as const).map((fmt) => (
                  <button
                    key={`active-${fmt}`}
                    onClick={() => handleExport(fmt, 1, "active")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer text-left transition-colors"
                  >
                    <span>
                      {fmt === "transparent" ? "Transparent PNG" : `Export ${fmt.toUpperCase()}`}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-medium">1x</span>
                  </button>
                ))}

                {/* ── Retina Quality (single screen) ── */}
                <div className="my-1.5 border-t border-zinc-900" />
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-2.5 py-1 block">
                  Export Quality (PNG)
                </span>
                {([1, 2, 3, 4] as const).map((scale) => (
                  <button
                    key={`quality-${scale}`}
                    onClick={() => handleExport("png", scale, "active")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer text-left transition-colors"
                  >
                    <span>PNG — Active Screen</span>
                    <span
                      className={`text-[9px] font-bold ${scale === 1 ? "text-zinc-500" : "text-purple-400"}`}
                    >
                      {scale}x
                    </span>
                  </button>
                ))}

                {/* ── Batch — All Screens ── */}
                <div className="my-1.5 border-t border-zinc-900" />
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-2.5 py-1 block">
                  Batch Export — All Screens
                </span>
                {(["png", "jpeg", "pdf"] as const).map((fmt) => (
                  <button
                    key={`all-${fmt}`}
                    onClick={() => handleExport(fmt, 1, "all")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer text-left transition-colors"
                  >
                    <span>All Screens — {fmt.toUpperCase()}</span>
                    <span className="text-[9px] text-purple-400 font-semibold">1x</span>
                  </button>
                ))}
                {([2, 3, 4] as const).map((scale) => (
                  <button
                    key={`all-${scale}x`}
                    onClick={() => handleExport("png", scale, "all")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer text-left transition-colors"
                  >
                    <span>All Screens — PNG</span>
                    <span className="text-[9px] text-purple-400 font-bold">{scale}x</span>
                  </button>
                ))}

                {/* ── Platform Presets ── */}
                <div className="my-1.5 border-t border-zinc-900" />
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-2.5 py-1 block">
                  Platform Batch
                </span>
                {[
                  { label: "Apple App Store", scale: 1, fmt: "png" as const, tag: "iOS" },
                  { label: "Google Play", scale: 1, fmt: "png" as const, tag: "Droid" },
                  { label: "Tablet (2x)", scale: 2, fmt: "png" as const, tag: "2x" },
                  { label: "Phone (3x)", scale: 3, fmt: "png" as const, tag: "3x" },
                ].map(({ label, scale, fmt, tag }) => (
                  <button
                    key={label}
                    onClick={() => handleExport(fmt, scale, "all")}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 cursor-pointer text-left transition-colors"
                  >
                    <span>{label}</span>
                    <span className="text-[9px] text-emerald-400 font-semibold">{tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Version History Side Panel */}
      {activeProject && (
        <HistoryPanel
          projectId={activeProject.id}
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </>
  )
}
