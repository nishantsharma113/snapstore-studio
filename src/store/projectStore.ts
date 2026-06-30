import { create } from "zustand"

export type SortOption = "updated" | "name"
export type FilterTabOption = "all" | "archived" | "templates"
export type TemplateCategoryOption = "all" | "store" | "marketing" | "social" | "custom"
export type ViewMode = "grid" | "list"

interface ProjectUIState {
  searchQuery: string
  sortBy: SortOption
  filterTab: FilterTabOption
  selectedTemplateCategory: TemplateCategoryOption
  viewMode: ViewMode
  currentPage: number
  itemsPerPage: number
  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: SortOption) => void
  setFilterTab: (tab: FilterTabOption) => void
  setSelectedTemplateCategory: (category: TemplateCategoryOption) => void
  setViewMode: (mode: ViewMode) => void
  setCurrentPage: (page: number) => void
  resetFilters: () => void
}

export const useProjectStore = create<ProjectUIState>((set) => ({
  searchQuery: "",
  sortBy: "updated",
  filterTab: "all",
  selectedTemplateCategory: "all",
  viewMode: "grid",
  currentPage: 1,
  itemsPerPage: 12,

  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterTab: (filterTab) => set({ filterTab, currentPage: 1 }),
  setSelectedTemplateCategory: (selectedTemplateCategory) => set({ selectedTemplateCategory }),
  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  resetFilters: () =>
    set({
      searchQuery: "",
      sortBy: "updated",
      filterTab: "all",
      selectedTemplateCategory: "all",
      currentPage: 1,
    }),
}))
