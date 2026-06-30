import { CanvasData } from "@/types/project"

export type TemplateCategory = "all" | "store" | "marketing" | "social" | "custom"

export interface CustomTemplate {
  id: string
  name: string
  category: TemplateCategory
  canvasData: CanvasData
  createdAt: string
  badge?: string
}

const CUSTOM_TEMPLATES_KEY = "snapstore_custom_templates"

/**
 * @module CustomTemplatesRepository
 * Manages user-saved custom templates in localStorage.
 * These appear in the Templates grid under the "Custom" category tab.
 */
export const CustomTemplatesRepository = {
  getAll: (): CustomTemplate[] => {
    if (typeof window === "undefined") return []
    try {
      const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
      return raw ? (JSON.parse(raw) as CustomTemplate[]) : []
    } catch {
      return []
    }
  },

  save: (
    name: string,
    canvasData: CanvasData,
    category: Exclude<TemplateCategory, "all" | "custom"> = "store"
  ): CustomTemplate => {
    const template: CustomTemplate = {
      id: "ctpl_" + Math.random().toString(36).substr(2, 9),
      name,
      category: "custom" as TemplateCategory,
      canvasData,
      createdAt: new Date().toISOString(),
      badge: "Custom",
    }

    if (typeof window === "undefined") return template

    const existing = CustomTemplatesRepository.getAll()
    const updated = [template, ...existing]
    try {
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated))
    } catch {
      // quota exceeded
    }
    return template
  },

  delete: (id: string): void => {
    if (typeof window === "undefined") return
    const existing = CustomTemplatesRepository.getAll()
    const updated = existing.filter((t) => t.id !== id)
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated))
  },
}
