"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { useProjectStore, FilterTabOption, SortOption, ViewMode } from "@/store/projectStore"
import { useProjectsQuery } from "@/features/projects/hooks/useProjects"
import { DashboardStats } from "@/features/projects/components/dashboard-stats"
import { ProjectCard } from "@/features/projects/components/project-card"
import { ProjectsTable } from "@/features/projects/components/projects-table"
import { TemplatesGrid } from "@/features/projects/components/templates-grid"
import { ActivityChart } from "@/features/projects/components/activity-chart"
import { CreateProjectModal } from "@/features/projects/components/create-project-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { Pagination } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  SlidersHorizontal,
  FolderOpen,
  FolderArchive,
  Grid,
  Loader2,
  FolderHeart,
  LayoutGrid,
  List,
  Bell,
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterTab,
    setFilterTab,
    viewMode,
    setViewMode,
    currentPage,
    itemsPerPage,
    setCurrentPage,
  } = useProjectStore()

  const { data: projects = [], isLoading } = useProjectsQuery()
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)

  // Reactively sync URL tab param whenever searchParams changes
  React.useEffect(() => {
    const tab = searchParams.get("tab") as FilterTabOption | null
    if (tab === "templates" || tab === "archived" || tab === "all") {
      setFilterTab(tab)
    } else {
      setFilterTab("all")
    }
  }, [searchParams, setFilterTab])

  // Filter projects by search, tab, and sorting choice
  const processedProjects = React.useMemo(() => {
    let result = [...projects]

    // Tab Filter
    if (filterTab === "archived") {
      result = result.filter((p) => p.is_archived)
    } else {
      result = result.filter((p) => !p.is_archived)
    }

    // Search Query Filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

    return result
  }, [projects, filterTab, searchQuery, sortBy])

  // Paginated slice
  const paginatedProjects = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return processedProjects.slice(start, start + itemsPerPage)
  }, [processedProjects, currentPage, itemsPerPage])

  const totalActive = projects.filter((p) => !p.is_archived).length
  const totalArchived = projects.filter((p) => p.is_archived).length

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-md shrink-0 px-6 h-14 flex items-center justify-between z-10">
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-foreground tracking-tight">Creative Dashboard</h1>
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            {user?.displayName && `Welcome back, ${user.displayName.split(" ")[0]}`}
            {" · "}
            {totalActive} active project{totalActive !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {user?.isSimulated && (
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-bold uppercase tracking-wider hidden sm:inline">
              Simulated
            </span>
          )}
          <button className="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <Bell className="h-3.5 w-3.5" />
          </button>
          <ThemeToggle />
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="default"
            size="sm"
            className="h-8 text-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Design
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Stats + Activity Chart Row */}
          {filterTab !== "templates" && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              <div className="xl:col-span-3">
                <DashboardStats projects={projects} />
              </div>
              <div className="xl:col-span-1">
                <ActivityChart projects={projects} />
              </div>
            </div>
          )}

          {/* Control Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
            {/* Tab Selection */}
            <div className="flex gap-1.5 bg-muted/40 border border-border p-1 rounded-xl self-start">
              {[
                { id: "all", label: "Projects", icon: FolderOpen, count: totalActive },
                { id: "templates", label: "Templates", icon: Grid },
                { id: "archived", label: "Archived", icon: FolderArchive, count: totalArchived },
              ].map((tab) => {
                const Icon = tab.icon
                const isSelected = filterTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id as FilterTabOption)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-surface border border-border text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? "bg-muted text-foreground/70"
                            : "bg-muted/60 text-muted-foreground"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Right: Search + Sort + View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              {/* Search */}
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-surface border-border focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/60 text-xs h-9 w-full"
                />
              </div>

              {/* Sort */}
              {filterTab !== "templates" && (
                <div className="flex items-center gap-2 border border-border bg-surface px-3 py-1.5 rounded-xl text-xs text-muted-foreground font-semibold h-9">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent focus:outline-none cursor-pointer text-foreground"
                  >
                    <option value="updated">Recent</option>
                    <option value="name">A–Z</option>
                  </select>
                </div>
              )}

              {/* View Mode Toggle */}
              {filterTab !== "templates" && (
                <div className="flex items-center border border-border bg-surface rounded-xl overflow-hidden h-9">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 h-full flex items-center cursor-pointer transition-colors ${
                      viewMode === "grid"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-px h-5 bg-border" />
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 h-full flex items-center cursor-pointer transition-colors ${
                      viewMode === "list"
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="List View"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-semibold">
                Loading projects...
              </span>
            </div>
          ) : filterTab === "templates" ? (
            <TemplatesGrid />
          ) : processedProjects.length > 0 ? (
            <>
              {viewMode === "list" ? (
                <ProjectsTable projects={paginatedProjects} />
              ) : (
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
              <Pagination
                currentPage={currentPage}
                totalItems={processedProjects.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            /* Empty State */
            <div className="border border-dashed border-border rounded-2xl p-16 text-center max-w-xl mx-auto my-8 space-y-4 bg-muted/10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FolderHeart className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  {searchQuery
                    ? "No matching projects found"
                    : filterTab === "archived"
                      ? "No archived designs"
                      : "No projects yet"}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-sm mx-auto">
                  {searchQuery
                    ? "Try clearing your search or browsing all projects."
                    : filterTab === "archived"
                      ? "Archive a project from the card menu to store it here."
                      : "Create your first App Store or Google Play screenshot package."}
                </p>
              </div>
              {!searchQuery && filterTab !== "archived" && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="default"
                  size="sm"
                  className="cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Create First Project
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}
