"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useProjectsQuery } from "@/features/projects/hooks/useProjects"
import { useEditorStore } from "@/store/editorStore"
import { useKeyboardShortcuts } from "@/hooks"
import { TopToolbar } from "./top-toolbar"
import { LeftSidebar } from "./left-sidebar"
import { CanvasArea } from "./canvas-area"
import { RightSidebar } from "./right-sidebar"
import { BottomPageControls } from "./bottom-page-controls"
import { Loader2 } from "lucide-react"

export function EditorWorkspace() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("id")

  useKeyboardShortcuts()

  const { data: projects = [], isLoading: isProjectsLoading } = useProjectsQuery()
  const { activeProject, setActiveProject, resetEditor, addPage, pages } = useEditorStore()

  // Find and load active project when an ID is present
  React.useEffect(() => {
    if (isProjectsLoading || !projectId) return
    const matched = projects.find((p) => p.id === projectId)
    if (matched) setActiveProject(matched)
  }, [projectId, projects, isProjectsLoading, setActiveProject])

  // When opened without a project ID (bare /editor route), seed a blank screen
  React.useEffect(() => {
    if (projectId) return // project effect handles this
    if (isProjectsLoading) return // wait for query to settle first
    if (pages.length === 0) addPage("Screen 1")
  }, [projectId, isProjectsLoading, pages.length, addPage])

  // Reset editor state when unmounting
  React.useEffect(() => {
    return () => resetEditor()
  }, [resetEditor])

  if (isProjectsLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl animate-pulse">
            <span className="bg-gradient-to-tr from-purple-500 to-indigo-500 bg-clip-text text-2xl font-black tracking-tighter text-transparent">
              SS
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            <span>Loading workspace assets...</span>
          </div>
        </div>
      </div>
    )
  }

  if (projectId && !activeProject) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm p-6">
          <h3 className="text-lg font-bold text-white">Project Not Found</h3>
          <p className="text-zinc-500 text-xs leading-relaxed">
            The project workspace you are trying to open may have been deleted, archived, or is
            inaccessible.
          </p>
          <a
            href="/dashboard"
            className="mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-50 select-none overflow-hidden">
      {/* 1. Header Toolbar */}
      <TopToolbar />

      {/* 2. Left side drawer, canvas workspace stage, and properties inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Panel */}
        <LeftSidebar />

        {/* Central Workspace Stage */}
        <div className="flex-1 h-full relative overflow-hidden flex flex-col">
          <CanvasArea />
          <BottomPageControls />
        </div>

        {/* Right Properties Panel */}
        <RightSidebar />
      </div>
    </div>
  )
}
