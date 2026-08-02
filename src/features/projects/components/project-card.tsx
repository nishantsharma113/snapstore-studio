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
  Pencil,
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

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const handleOpen = () => router.push(`/editor?id=${project.id}`)

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
      console.error(err)
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
      console.error(err)
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
      console.error(err)
    }
  }

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const diffMs = Date.now() - date.getTime()
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

  const getThumbnailStyle = (): React.CSSProperties => {
    if (project.thumbnail_url) {
      return {
        backgroundImage: `url(${project.thumbnail_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }
    }
    const bg = project.canvas_data.background || { type: "solid" as const, color: "#09090b" }
    if (bg.type === "solid") return { backgroundColor: bg.color || "#09090b" }
    if (bg.type === "gradient")
      return { backgroundImage: bg.gradient || "linear-gradient(135deg, #8b5cf6, #3b82f6)" }
    return { backgroundColor: "#09090b" }
  }

  const isLoading =
    updateMutation.isPending || deleteMutation.isPending || duplicateMutation.isPending

  return (
    <div className="group relative border border-border bg-surface rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 flex flex-col h-72">
      {/* Thumbnail */}
      <div
        className="relative flex-1 w-full cursor-pointer overflow-hidden"
        style={getThumbnailStyle()}
        onClick={handleOpen}
      >
        {/* Vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Placeholder mockup */}
        {!project.thumbnail_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-28 border border-white/10 bg-black/40 rounded-xl shadow-2xl overflow-hidden transition-transform duration-300 group-hover:scale-105 flex flex-col">
              <div className="h-2 w-full bg-white/5 shrink-0" />
              <div className="flex-1 flex items-center justify-center">
                <Pencil className="h-5 w-5 text-white/20" />
              </div>
              <div className="h-1.5 w-1/3 bg-white/5 rounded-sm self-center mb-2" />
            </div>
          </div>
        )}

        {/* Hover — open editor button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 border border-white/10 shadow-2xl">
            <ExternalLink className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-semibold text-white">Open in Editor</span>
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Archived badge */}
        {project.is_archived && (
          <div className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-0.5">
            <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">
              Archived
            </span>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="p-3.5 border-t border-border bg-surface flex items-center justify-between gap-3 shrink-0">
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <form onSubmit={handleRenameSubmit}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                className="w-full bg-muted border border-primary rounded-lg px-2 py-0.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </form>
          ) : (
            <h4
              className="text-sm font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={handleOpen}
            >
              {project.name}
            </h4>
          )}
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Calendar className="h-2.5 w-2.5 shrink-0" />
            {formatTime(project.updated_at)}
          </p>
        </div>

        {/* Context menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Project actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 bottom-9 z-50 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                onClick={handleOpen}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open Editor
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setIsEditingName(true)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" /> Rename
              </button>
              <button
                onClick={handleDuplicate}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </button>
              <button
                onClick={handleToggleArchive}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                {project.is_archived ? (
                  <>
                    <ArchiveRestore className="h-3.5 w-3.5" /> Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </>
                )}
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Project
              </button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog {...dialogProps} />
    </div>
  )
}
