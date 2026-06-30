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
  ExternalLink,
  Edit2,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  Smartphone,
} from "lucide-react"
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog"

type SortKey = "name" | "updated_at" | "created_at"
type SortDir = "asc" | "desc"

interface ProjectsTableProps {
  projects: Project[]
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter()
  const [sortKey, setSortKey] = React.useState<SortKey>("updated_at")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editName, setEditName] = React.useState("")

  const updateMutation = useUpdateProjectMutation()
  const deleteMutation = useDeleteProjectMutation()
  const duplicateMutation = useDuplicateProjectMutation()
  const { confirm: showConfirm, dialogProps } = useConfirm()

  const sorted = React.useMemo(() => {
    return [...projects].sort((a, b) => {
      if (sortKey === "name") {
        return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      const aVal = new Date(a[sortKey]).getTime()
      const bVal = new Date(b[sortKey]).getTime()
      return sortDir === "asc" ? aVal - bVal : bVal - aVal
    })
  }, [projects, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const handleRenameSubmit = async (project: Project) => {
    if (!editName.trim() || editName === project.name) {
      setEditingId(null)
      return
    }
    try {
      await updateMutation.mutateAsync({
        projectId: project.id,
        updates: { name: editName.trim() },
      })
    } finally {
      setEditingId(null)
    }
  }

  const handleDelete = async (project: Project) => {
    const ok = await showConfirm({
      title: `Delete "${project.name}"?`,
      description: "This action is permanent and cannot be undone. All canvas data will be lost.",
      confirmLabel: "Delete Project",
      variant: "danger",
    })
    if (!ok) return
    await deleteMutation.mutateAsync(project.id)
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return "—"
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 text-muted-foreground/40" />
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    )
  }

  if (projects.length === 0) return null

  return (
    <>
      <ConfirmDialog {...dialogProps} />
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-xs text-foreground/80">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-8">#</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  Project <SortIcon col="name" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">
                Canvas
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                Screens
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">
                <button
                  onClick={() => handleSort("updated_at")}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  Updated <SortIcon col="updated_at" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">
                <button
                  onClick={() => handleSort("created_at")}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors"
                >
                  Created <SortIcon col="created_at" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                Status
              </th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((project, idx) => {
              const isLoading =
                (updateMutation.isPending && editingId === project.id) ||
                deleteMutation.isPending ||
                duplicateMutation.isPending
              const bg = project.canvas_data.background
              const screenCount = project.canvas_data.pages?.length ?? 1

              return (
                <tr
                  key={project.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors group"
                >
                  <td className="px-4 py-3 text-muted-foreground/60 font-mono">{idx + 1}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-6 rounded border border-border shrink-0 overflow-hidden flex items-center justify-center"
                        style={
                          project.thumbnail_url
                            ? {
                                backgroundImage: `url(${project.thumbnail_url})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center top",
                              }
                            : bg?.type === "solid"
                              ? { backgroundColor: bg.color || "#09090b" }
                              : bg?.type === "gradient"
                                ? { backgroundImage: bg.gradient }
                                : { backgroundColor: "#09090b" }
                        }
                      >
                        {!project.thumbnail_url && (
                          <Smartphone className="h-2.5 w-2.5 text-white/30" />
                        )}
                      </div>

                      {editingId === project.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleRenameSubmit(project)
                          }}
                          className="flex-1"
                        >
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleRenameSubmit(project)}
                            className="w-full bg-muted border border-primary rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                        </form>
                      ) : (
                        <button
                          onClick={() => router.push(`/editor?id=${project.id}`)}
                          className="font-semibold text-foreground hover:text-foreground/70 truncate max-w-[160px] text-left cursor-pointer"
                        >
                          {project.name}
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell font-mono text-[10px]">
                    {project.canvas_data.width} × {project.canvas_data.height}
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {screenCount} {screenCount === 1 ? "screen" : "screens"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(project.updated_at)}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(project.created_at)}
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    {project.is_archived ? (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                        Archived
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <>
                          <button
                            onClick={() => router.push(`/editor?id=${project.id}`)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                            title="Open Editor"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(project.id)
                              setEditName(project.name)
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateMutation.mutateAsync(project.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              updateMutation.mutateAsync({
                                projectId: project.id,
                                updates: { is_archived: !project.is_archived },
                              })
                            }
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                            title={project.is_archived ? "Unarchive" : "Archive"}
                          >
                            {project.is_archived ? (
                              <ArchiveRestore className="h-3.5 w-3.5" />
                            ) : (
                              <Archive className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(project)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
