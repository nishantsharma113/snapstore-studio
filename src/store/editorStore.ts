import { create } from "zustand"
import { CanvasBackground, Project, Page, Layer } from "@/types/project"

export type SidebarTab =
  "templates" | "uploads" | "frames" | "backgrounds" | "text" | "shapes" | "layers"
export type AlignMode = "left" | "center-h" | "right" | "top" | "center-v" | "bottom"

interface EditorState {
  activeProject: Project | null
  canvasWidth: number
  canvasHeight: number
  background: CanvasBackground
  pages: Page[]
  currentPageId: string
  layers: Layer[]
  selectedIds: string[]
  zoom: number
  panX: number
  panY: number
  activeTab: SidebarTab
  exportCallback:
    | ((
        format: "png" | "jpeg" | "pdf" | "transparent",
        scale: number,
        target: "active" | "all"
      ) => Promise<void>)
    | null
  thumbnailCallback: (() => string | null) | null
  clipboard: Layer | null
  styleClipboard: Partial<Layer> | null

  // History stack for undo/redo (tracks Pages state)
  history: Page[][]
  historyIndex: number

  // Actions
  setActiveProject: (project: Project | null) => void
  setCanvasDimensions: (width: number, height: number) => void
  setBackground: (bg: CanvasBackground) => void
  setPages: (pages: Page[]) => void
  setCurrentPageId: (id: string) => void
  addPage: (name?: string) => void
  duplicatePage: (id: string) => void
  deletePage: (id: string) => void
  renamePage: (id: string, newName: string) => void
  setExportCallback: (
    callback:
      | ((
          format: "png" | "jpeg" | "pdf" | "transparent",
          scale: number,
          target: "active" | "all"
        ) => Promise<void>)
      | null
  ) => void
  setThumbnailCallback: (callback: (() => string | null) | null) => void

  setLayers: (layers: Layer[]) => void
  addLayer: (
    layer: Omit<Layer, "id" | "x" | "y" | "rotation" | "opacity" | "isLocked" | "isVisible">
  ) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  deleteLayer: (id: string) => void
  duplicateLayer: (id: string) => void
  reorderLayer: (id: string, direction: "up" | "down") => void
  moveLayerToIndex: (id: string, toIndex: number) => void
  alignLayers: (mode: AlignMode) => void
  distributeLayers: (axis: "h" | "v") => void
  copyLayerStyle: (id: string) => void
  pasteLayerStyle: (id: string) => void
  copyLayer: (id: string) => void
  cutLayer: (id: string) => void
  pasteLayer: () => void
  selectAllLayers: () => void
  setSelectedIds: (ids: string[]) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  setActiveTab: (tab: SidebarTab) => void

  // History controls
  saveHistory: (newPages: Page[]) => void
  undo: () => void
  redo: () => void
  resetEditor: () => void
}

const newId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 11)}`

export const useEditorStore = create<EditorState>((set) => ({
  activeProject: null,
  canvasWidth: 1242,
  canvasHeight: 2688,
  background: { type: "solid", color: "#09090b" },
  pages: [],
  currentPageId: "",
  layers: [],
  selectedIds: [],
  zoom: 0.2,
  panX: 0,
  panY: 0,
  activeTab: "templates",
  exportCallback: null,
  thumbnailCallback: null,
  clipboard: null,
  styleClipboard: null,

  history: [[]],
  historyIndex: 0,

  setActiveProject: (project) => {
    if (!project) {
      set({
        activeProject: null,
        pages: [],
        currentPageId: "",
        layers: [],
        background: { type: "solid", color: "#09090b" },
        history: [[]],
        historyIndex: 0,
        selectedIds: [],
      })
      return
    }

    const { canvas_data } = project

    let pagesList: Page[] = []
    if (canvas_data.pages && canvas_data.pages.length > 0) {
      pagesList = canvas_data.pages as Page[]
    } else {
      pagesList = [
        {
          id: newId("page"),
          name: "Page 1",
          layers: (canvas_data.layers as Layer[]) || [],
          background: canvas_data.background || { type: "solid", color: "#09090b" },
        },
      ]
    }

    const currentId = canvas_data.currentPageId || pagesList[0].id
    const activePage = pagesList.find((p) => p.id === currentId) || pagesList[0]

    set({
      activeProject: project,
      canvasWidth: canvas_data.width,
      canvasHeight: canvas_data.height,
      background: activePage.background,
      pages: pagesList,
      currentPageId: activePage.id,
      layers: activePage.layers,
      history: [pagesList],
      historyIndex: 0,
      selectedIds: [],
    })
  },

  setCanvasDimensions: (width, height) => set({ canvasWidth: width, canvasHeight: height }),

  setBackground: (background) => {
    set((state) => {
      const updatedPages = state.pages.map((page) => {
        if (page.id !== state.currentPageId) return page
        return { ...page, background }
      })

      const nextHistory = state.history.slice(0, state.historyIndex + 1)
      return {
        background,
        pages: updatedPages,
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  setPages: (pages) => set({ pages }),

  setCurrentPageId: (currentPageId) => {
    set((state) => {
      const activePage = state.pages.find((p) => p.id === currentPageId)
      if (!activePage) return {}
      return {
        currentPageId,
        layers: activePage.layers,
        background: activePage.background,
      }
    })
  },

  addPage: (name) => {
    set((state) => {
      const activePage = state.pages.find((p) => p.id === state.currentPageId)
      const newPage: Page = {
        id: newId("page"),
        name: name || `Page ${state.pages.length + 1}`,
        layers: [],
        background: activePage ? { ...activePage.background } : { type: "solid", color: "#09090b" },
      }

      const updatedPages = [...state.pages, newPage]
      const nextHistory = state.history.slice(0, state.historyIndex + 1)

      return {
        pages: updatedPages,
        currentPageId: newPage.id,
        layers: [],
        background: newPage.background,
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  duplicatePage: (id) => {
    set((state) => {
      const pageToDuplicate = state.pages.find((p) => p.id === id)
      if (!pageToDuplicate) return {}

      const clonedLayers = pageToDuplicate.layers.map((l) => ({ ...l, id: newId("layer") }))

      const newPage: Page = {
        id: newId("page"),
        name: `${pageToDuplicate.name} (Copy)`,
        layers: clonedLayers,
        background: { ...pageToDuplicate.background },
      }

      const index = state.pages.findIndex((p) => p.id === id)
      const updatedPages = [...state.pages]
      updatedPages.splice(index + 1, 0, newPage)

      const nextHistory = state.history.slice(0, state.historyIndex + 1)
      return {
        pages: updatedPages,
        currentPageId: newPage.id,
        layers: newPage.layers,
        background: newPage.background,
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  deletePage: (id) => {
    set((state) => {
      if (state.pages.length <= 1) return {}

      const index = state.pages.findIndex((p) => p.id === id)
      const updatedPages = state.pages.filter((p) => p.id !== id)

      let nextIndex = index - 1
      if (nextIndex < 0) nextIndex = 0
      const nextActivePage = updatedPages[nextIndex]

      const nextHistory = state.history.slice(0, state.historyIndex + 1)
      return {
        pages: updatedPages,
        currentPageId: nextActivePage.id,
        layers: nextActivePage.layers,
        background: nextActivePage.background,
        selectedIds: [],
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  renamePage: (id, newName) => {
    set((state) => {
      const updatedPages = state.pages.map((p) => (p.id === id ? { ...p, name: newName } : p))
      const nextHistory = state.history.slice(0, state.historyIndex + 1)
      return {
        pages: updatedPages,
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  setExportCallback: (exportCallback) => set({ exportCallback }),
  setThumbnailCallback: (thumbnailCallback) => set({ thumbnailCallback }),

  setLayers: (layers) => {
    set((state) => {
      const updatedPages = state.pages.map((page) => {
        if (page.id !== state.currentPageId) return page
        return { ...page, layers }
      })
      return { layers, pages: updatedPages }
    })
  },

  addLayer: (layerData) => {
    set((state) => {
      const newLayer: Layer = {
        ...layerData,
        id: newId("layer"),
        x: state.canvasWidth / 2 - (layerData.width || 200) / 2,
        y: 120,
        rotation: 0,
        opacity: 1,
        isLocked: false,
        isVisible: true,
      }

      const updatedPages = state.pages.map((page) => {
        if (page.id !== state.currentPageId) return page
        return { ...page, layers: [...page.layers, newLayer] }
      })

      const activePage = updatedPages.find((p) => p.id === state.currentPageId)
      const nextHistory = state.history.slice(0, state.historyIndex + 1)

      return {
        pages: updatedPages,
        layers: activePage ? activePage.layers : [],
        selectedIds: [newLayer.id],
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  updateLayer: (id, updates) => {
    set((state) => {
      const updatedPages = state.pages.map((page) => {
        const hasLayer = page.layers.some((l) => l.id === id)
        if (!hasLayer) return page
        return {
          ...page,
          layers: page.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }
      })

      const activePage = updatedPages.find((p) => p.id === state.currentPageId)
      const nextHistory = state.history.slice(0, state.historyIndex + 1)

      return {
        pages: updatedPages,
        layers: activePage ? activePage.layers : [],
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  deleteLayer: (id) => {
    set((state) => {
      const updatedPages = state.pages.map((page) => {
        const hasLayer = page.layers.some((l) => l.id === id)
        if (!hasLayer) return page
        return { ...page, layers: page.layers.filter((l) => l.id !== id) }
      })

      const activePage = updatedPages.find((p) => p.id === state.currentPageId)
      const nextHistory = state.history.slice(0, state.historyIndex + 1)

      return {
        pages: updatedPages,
        layers: activePage ? activePage.layers : [],
        selectedIds: state.selectedIds.filter((sid) => sid !== id),
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  duplicateLayer: (id) => {
    set((state) => {
      const source = state.layers.find((l) => l.id === id)
      if (!source) return {}

      const newLayer: Layer = {
        ...source,
        id: newId("layer"),
        x: source.x + 20,
        y: source.y + 20,
        name: `${source.name} (Copy)`,
      }

      const updatedPages = state.pages.map((page) => {
        if (page.id !== state.currentPageId) return page
        return { ...page, layers: [...page.layers, newLayer] }
      })

      const activePage = updatedPages.find((p) => p.id === state.currentPageId)
      const nextHistory = state.history.slice(0, state.historyIndex + 1)

      return {
        pages: updatedPages,
        layers: activePage ? activePage.layers : [],
        selectedIds: [newLayer.id],
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  reorderLayer: (id, direction) => {
    set((state) => {
      const updatedPages = state.pages.map((page) => {
        if (page.id !== state.currentPageId) return page
        const layers = [...page.layers]
        const index = layers.findIndex((l) => l.id === id)
        if (index === -1) return page
        if (direction === "up" && index < layers.length - 1) {
          ;[layers[index], layers[index + 1]] = [layers[index + 1], layers[index]]
        } else if (direction === "down" && index > 0) {
          ;[layers[index], layers[index - 1]] = [layers[index - 1], layers[index]]
        }
        return { ...page, layers }
      })

      const activePage = updatedPages.find((p) => p.id === state.currentPageId)
      const nextHistory = state.history.slice(0, state.historyIndex + 1)

      return {
        pages: updatedPages,
        layers: activePage ? activePage.layers : [],
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  moveLayerToIndex: (id, toIndex) => {
    set((state) => {
      const updatedPages = state.pages.map((page) => {
        if (page.id !== state.currentPageId) return page
        const layers = [...page.layers]
        const fromIndex = layers.findIndex((l) => l.id === id)
        if (fromIndex === -1 || fromIndex === toIndex) return page
        const [moved] = layers.splice(fromIndex, 1)
        layers.splice(toIndex, 0, moved)
        return { ...page, layers }
      })
      const activePage = updatedPages.find((p) => p.id === state.currentPageId)
      const nextHistory = state.history.slice(0, state.historyIndex + 1)
      return {
        pages: updatedPages,
        layers: activePage ? activePage.layers : [],
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  alignLayers: (mode) => {
    set((state) => {
      if (state.selectedIds.length < 2) return {}
      const activePage = state.pages.find((p) => p.id === state.currentPageId)
      if (!activePage) return {}
      const sel = activePage.layers.filter((l) => state.selectedIds.includes(l.id))
      const minX = Math.min(...sel.map((l) => l.x))
      const maxX = Math.max(...sel.map((l) => l.x + l.width))
      const minY = Math.min(...sel.map((l) => l.y))
      const maxY = Math.max(...sel.map((l) => l.y + l.height))
      const cX = (minX + maxX) / 2
      const cY = (minY + maxY) / 2
      const updatedLayers = activePage.layers.map((l) => {
        if (!state.selectedIds.includes(l.id)) return l
        switch (mode) {
          case "left":
            return { ...l, x: minX }
          case "center-h":
            return { ...l, x: cX - l.width / 2 }
          case "right":
            return { ...l, x: maxX - l.width }
          case "top":
            return { ...l, y: minY }
          case "center-v":
            return { ...l, y: cY - l.height / 2 }
          case "bottom":
            return { ...l, y: maxY - l.height }
        }
      })
      const updatedPages = state.pages.map((p) =>
        p.id === state.currentPageId ? { ...p, layers: updatedLayers } : p
      )
      const nextHistory = state.history.slice(0, state.historyIndex + 1)
      return {
        pages: updatedPages,
        layers: updatedLayers,
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  distributeLayers: (axis) => {
    set((state) => {
      if (state.selectedIds.length < 3) return {}
      const activePage = state.pages.find((p) => p.id === state.currentPageId)
      if (!activePage) return {}
      const sel = activePage.layers.filter((l) => state.selectedIds.includes(l.id))
      const positions: Record<string, { x: number; y: number }> = {}
      if (axis === "h") {
        const sorted = [...sel].sort((a, b) => a.x - b.x)
        const totalW = sorted.reduce((s, l) => s + l.width, 0)
        const span = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width - sorted[0].x
        const gap = (span - totalW) / (sorted.length - 1)
        let cur = sorted[0].x
        sorted.forEach((l) => {
          positions[l.id] = { x: cur, y: l.y }
          cur += l.width + gap
        })
      } else {
        const sorted = [...sel].sort((a, b) => a.y - b.y)
        const totalH = sorted.reduce((s, l) => s + l.height, 0)
        const span = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height - sorted[0].y
        const gap = (span - totalH) / (sorted.length - 1)
        let cur = sorted[0].y
        sorted.forEach((l) => {
          positions[l.id] = { x: l.x, y: cur }
          cur += l.height + gap
        })
      }
      const updatedLayers = activePage.layers.map((l) =>
        positions[l.id] ? { ...l, ...positions[l.id] } : l
      )
      const updatedPages = state.pages.map((p) =>
        p.id === state.currentPageId ? { ...p, layers: updatedLayers } : p
      )
      const nextHistory = state.history.slice(0, state.historyIndex + 1)
      return {
        pages: updatedPages,
        layers: updatedLayers,
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  copyLayerStyle: (id) => {
    set((state) => {
      const layer = state.layers.find((l) => l.id === id)
      if (!layer) return {}
      return {
        styleClipboard: {
          opacity: layer.opacity,
          blendMode: layer.blendMode,
          shadowProps: layer.shadowProps ? { ...layer.shadowProps } : undefined,
          textProps: layer.textProps ? { ...layer.textProps } : undefined,
          shapeProps: layer.shapeProps ? { ...layer.shapeProps } : undefined,
          imageProps: layer.imageProps ? { ...layer.imageProps } : undefined,
        },
      }
    })
  },

  pasteLayerStyle: (id) => {
    set((state) => {
      if (!state.styleClipboard) return {}
      const { opacity, blendMode, shadowProps, textProps, shapeProps, imageProps } =
        state.styleClipboard
      const updatedPages = state.pages.map((page) => {
        const target = page.layers.find((l) => l.id === id)
        if (!target) return page
        const updates: Partial<Layer> = {}
        if (opacity !== undefined) updates.opacity = opacity
        if (blendMode !== undefined) updates.blendMode = blendMode
        if (shadowProps !== undefined) updates.shadowProps = { ...shadowProps }
        if (textProps !== undefined && target.type === "text")
          updates.textProps = { ...target.textProps!, ...textProps }
        if (shapeProps !== undefined && target.type === "shape")
          updates.shapeProps = { ...target.shapeProps!, ...shapeProps }
        if (imageProps !== undefined && target.type === "image")
          updates.imageProps = { ...target.imageProps!, ...imageProps }
        return { ...page, layers: page.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)) }
      })
      const activePage = updatedPages.find((p) => p.id === state.currentPageId)
      const nextHistory = state.history.slice(0, state.historyIndex + 1)
      return {
        pages: updatedPages,
        layers: activePage ? activePage.layers : [],
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  copyLayer: (id) => {
    set((state) => {
      const layer = state.layers.find((l) => l.id === id)
      if (!layer) return {}
      return { clipboard: { ...layer } }
    })
  },

  cutLayer: (id) => {
    set((state) => {
      const layer = state.layers.find((l) => l.id === id)
      if (!layer) return {}

      const updatedPages = state.pages.map((page) => {
        if (page.id !== state.currentPageId) return page
        return { ...page, layers: page.layers.filter((l) => l.id !== id) }
      })

      const activePage = updatedPages.find((p) => p.id === state.currentPageId)
      const nextHistory = state.history.slice(0, state.historyIndex + 1)

      return {
        clipboard: { ...layer },
        pages: updatedPages,
        layers: activePage ? activePage.layers : [],
        selectedIds: state.selectedIds.filter((sid) => sid !== id),
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  pasteLayer: () => {
    set((state) => {
      if (!state.clipboard) return {}

      const newLayer: Layer = {
        ...state.clipboard,
        id: newId("layer"),
        x: state.clipboard.x + 20,
        y: state.clipboard.y + 20,
        name: `${state.clipboard.name} (Copy)`,
      }

      const updatedPages = state.pages.map((page) => {
        if (page.id !== state.currentPageId) return page
        return { ...page, layers: [...page.layers, newLayer] }
      })

      const activePage = updatedPages.find((p) => p.id === state.currentPageId)
      const nextHistory = state.history.slice(0, state.historyIndex + 1)

      return {
        pages: updatedPages,
        layers: activePage ? activePage.layers : [],
        selectedIds: [newLayer.id],
        history: [...nextHistory, updatedPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  selectAllLayers: () => {
    set((state) => ({
      selectedIds: state.layers.filter((l) => !l.isLocked && l.isVisible).map((l) => l.id),
    }))
  },

  setSelectedIds: (selectedIds) => set({ selectedIds }),

  setZoom: (zoom) => set({ zoom: Math.max(0.05, Math.min(zoom, 3)) }),

  setPan: (panX, panY) => set({ panX, panY }),

  setActiveTab: (activeTab) => set({ activeTab }),

  saveHistory: (newPages) => {
    set((state) => {
      const nextHistory = state.history.slice(0, state.historyIndex + 1)
      return {
        history: [...nextHistory, newPages],
        historyIndex: nextHistory.length,
      }
    })
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex === 0) return {}
      const prevIndex = state.historyIndex - 1
      const prevPages = state.history[prevIndex]
      const activePage = prevPages.find((p) => p.id === state.currentPageId) || prevPages[0]

      return {
        pages: prevPages,
        layers: activePage ? activePage.layers : [],
        background: activePage ? activePage.background : { type: "solid", color: "#09090b" },
        historyIndex: prevIndex,
        selectedIds: [],
      }
    })
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return {}
      const nextIndex = state.historyIndex + 1
      const nextPages = state.history[nextIndex]
      const activePage = nextPages.find((p) => p.id === state.currentPageId) || nextPages[0]

      return {
        pages: nextPages,
        layers: activePage ? activePage.layers : [],
        background: activePage ? activePage.background : { type: "solid", color: "#09090b" },
        historyIndex: nextIndex,
        selectedIds: [],
      }
    })
  },

  resetEditor: () => {
    set({
      activeProject: null,
      layers: [],
      pages: [],
      currentPageId: "",
      selectedIds: [],
      zoom: 0.2,
      panX: 0,
      panY: 0,
      history: [[]],
      historyIndex: 0,
      exportCallback: null,
      thumbnailCallback: null,
      clipboard: null,
      styleClipboard: null,
    })
  },
}))
