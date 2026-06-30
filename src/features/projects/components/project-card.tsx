"use client"

import * as React from "react"
import { Project } from "@/types/project"
import { useRouter } from "next/navigation"
import {
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useDuplicateProjectMutation,
} from "../hooks/useProjects"
import {
  MoreVertical,
  ExternalLink,
  Edit2,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
  Smartphone,
  Calendar,
} from "lucide-react"
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [isEditingName, setIsEditingName] = React.useState(false)
  const [editName, setEditName] = React.useState(project.name)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const updateMutation = useUpdateProjectMutation()
  const deleteMutation = useDeleteProjectMutation()
  const duplicateMutation = useDuplicateProjectMutation()
  const { confirm: showConfirm, dialogProps } = useConfirm()

  // Close menu on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  const handleOpen = () => {
    router.push(`/editor?id=${project.id}`)
  }

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || editName === project.name) {
      setIsEditingName(false)
      return
    }
    try {
      await updateMutation.mutateAsync({
        projectId: project.id,
        updates: { name: editName.trim() },
      })
    } catch {
      // Restore old name on fail
      setEditName(project.name)
    } finally {
      setIsEditingName(false)
    }
  }

  const handleDuplicate = async () => {
    setMenuOpen(false)
    try {
      await duplicateMutation.mutateAsync(project.id)
    } catch (err) {
      console.error("Failed to duplicate:", err)
    }
  }

  const handleToggleArchive = async () => {
    setMenuOpen(false)
    try {
      await updateMutation.mutateAsync({
        projectId: project.id,
        updates: { is_archived: !project.is_archived },
      })
    } catch (err) {
      console.error("Failed to archive:", err)
    }
  }

  const handleDelete = async () => {
    setMenuOpen(false)
    const ok = await showConfirm({
      title: `Delete "${project.name}"?`,
      description: "This action is permanent and cannot be undone. All canvas data will be lost.",
      confirmLabel: "Delete Project",
      variant: "danger",
    })
    if (!ok) return
    try {
      await deleteMutation.mutateAsync(project.id)
    } catch (err) {
      console.error("Failed to delete:", err)
    }
  }

  // Format updated date
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return "Yesterday"
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    } catch {
      return "Recently"
    }
  }

  // Render thumbnail background styles
  const getThumbnailStyle = (): React.CSSProperties => {
    if (project.thumbnail_url) {
      return {
        backgroundImage: `url(${project.thumbnail_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }
    }
    const bg = project.canvas_data.background || { type: "solid" as const, color: "#09090b" }
    if (bg.type === "solid") {
      return { backgroundColor: bg.color || "#09090b" }
    }
    if (bg.type === "gradient") {
      return { backgroundImage: bg.gradient || "linear-gradient(to bottom, #8b5cf6, #3b82f6)" }
    }
    return { backgroundColor: "#09090b" }
  }

  const isLoading =
    updateMutation.isPending || deleteMutation.isPending || duplicateMutation.isPending

  return (
    <div className="group relative border border-border bg-surface rounded-xl overflow-hidden hover:border-primary/20 transition-all duration-300 flex flex-col h-64">
      {/* Thumbnail Area */}
      <div
        className="flex-1 w-full relative flex items-center justify-center cursor-pointer overflow-hidden"
        style={getThumbnailStyle()}
        onClick={handleOpen}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />

        {/* Placeholder mockup — only shown before a thumbnail is generated */}
        {!project.thumbnail_url && (
          <div className="w-16 h-28 border border-white/10 bg-black/40 rounded-lg p-1 shadow-2xl relative transition-transform duration-300 group-hover:scale-105 flex flex-col justify-between">
            <div className="h-1.5 w-full bg-white/5 rounded-sm" />
            <div className="flex-1 my-1 border border-white/5 bg-white/5 rounded flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white/20" />
            </div>
            <div className="h-1 w-1/3 bg-white/5 rounded-sm self-center" />
          </div>
        )}

        {/* Action overlay spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        )}
      </div>

      {/* Info Info Section */}
      <div className="p-4 border-t border-border bg-surface flex items-center justify-between relative">
        <div className="flex-1 pr-4 min-w-0">
          {isEditingName ? (
            <form onSubmit={handleRenameSubmit} className="w-full">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                className="w-full bg-muted border border-primary rounded px-1.5 py-0.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </form>
          ) : (
            <h4
              className="text-sm font-semibold text-foreground truncate cursor-pointer"
              onClick={handleOpen}
            >
              {project.name}
            </h4>
          )}
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
            <Calendar className="h-3 w-3" />
            <span>Updated {formatTime(project.updated_at)}</span>
          </p>
        </div>

        {/* Options Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer transition-colors"
            aria-label="Project actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 bottom-8 z-50 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                onClick={handleOpen}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Editor
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setIsEditingName(true)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Rename
              </button>
              <button
                onClick={handleDuplicate}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
              <button
                onClick={handleToggleArchive}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                {project.is_archived ? (
                  <>
                    <ArchiveRestore className="h-3.5 w-3.5" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </>
                )}
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}
