"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamically load Editor Workspace with SSR disabled to bypass window canvas issues
const EditorWorkspace = dynamic(
  () => import("@/features/editor/components/editor-workspace").then((m) => m.EditorWorkspace),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
            <span className="bg-gradient-to-tr from-purple-500 to-indigo-500 bg-clip-text text-2xl font-black tracking-tighter text-transparent animate-pulse">
              SS
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            <span>Loading Canvas Workspace...</span>
          </div>
        </div>
      </div>
    ),
  }
)

export default function EditorPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white select-none">
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
              <span className="bg-gradient-to-tr from-purple-500 to-indigo-500 bg-clip-text text-2xl font-black tracking-tighter text-transparent animate-pulse">
                SS
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              <span>Loading Canvas Workspace...</span>
            </div>
          </div>
        </div>
      }
    >
      <EditorWorkspace />
    </React.Suspense>
  )
}
