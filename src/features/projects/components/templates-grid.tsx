"use client"

import * as React from "react"
import { useCreateProjectMutation } from "../hooks/useProjects"
import { useRouter } from "next/navigation"
import { useProjectStore, TemplateCategoryOption } from "@/store/projectStore"
import { CustomTemplatesRepository, CustomTemplate } from "../data/custom-templates-repository"
import { motion } from "framer-motion"
import {
  Sparkles,
  Smartphone,
  Layout,
  ShoppingBag,
  Share2,
  Loader2,
  Star,
  Trash2,
} from "lucide-react"
import { CanvasData } from "@/types/project"

interface TemplatePreset {
  id: string
  name: string
  category: TemplateCategoryOption
  description: string
  canvas_data: CanvasData
  badge?: string
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "tpl_minimal_store",
    name: "Minimal App Store Default",
    category: "store",
    description: "Standard Apple App Store screen, centered frame, dark background",
    badge: "App Store",
    canvas_data: {
      width: 1242,
      height: 2688,
      layers: [],
      background: { type: "solid", color: "#0a0a0c" },
    },
  },
  {
    id: "tpl_gradient_marketing",
    name: "Sleek Gradient Marketing",
    category: "marketing",
    description: "Premium purple-indigo linear background with header margins",
    badge: "Marketing",
    canvas_data: {
      width: 1242,
      height: 2688,
      layers: [],
      background: {
        type: "gradient",
        gradient: "linear-gradient(135deg, #7c3aed, #4f46e5)",
      },
    },
  },
  {
    id: "tpl_social_sunset",
    name: "Sunset Radial Promo",
    category: "social",
    description: "Vibrant pink-orange radial glow layout for social shares",
    badge: "Social",
    canvas_data: {
      width: 1080,
      height: 1080,
      layers: [],
      background: {
        type: "gradient",
        gradient: "radial-gradient(circle, #db2777, #f43f5e, #9f1239)",
      },
    },
  },
  {
    id: "tpl_google_play_dark",
    name: "Google Play Dark Classic",
    category: "store",
    description: "16:9 Android aspect ratio optimized for Google Play",
    badge: "Google Play",
    canvas_data: {
      width: 1080,
      height: 1920,
      layers: [],
      background: { type: "solid", color: "#0f172a" },
    },
  },
]

export function TemplatesGrid() {
  const router = useRouter()
  const { selectedTemplateCategory, setSelectedTemplateCategory } = useProjectStore()
  const createMutation = useCreateProjectMutation()
  const [creatingId, setCreatingId] = React.useState<string | null>(null)
  const [customTemplates, setCustomTemplates] = React.useState<CustomTemplate[]>([])

  // Load custom templates from localStorage
  React.useEffect(() => {
    setCustomTemplates(CustomTemplatesRepository.getAll())
  }, [selectedTemplateCategory])

  const handleSelectTemplate = async (template: TemplatePreset) => {
    setCreatingId(template.id)
    try {
      const project = await createMutation.mutateAsync({
        name: `My ${template.name}`,
        canvasData: template.canvas_data,
      })
      router.push(`/editor?id=${project.id}`)
    } catch (err) {
      console.error("Failed to create project from template:", err)
      setCreatingId(null)
    }
  }

  const handleSelectCustomTemplate = async (template: CustomTemplate) => {
    setCreatingId(template.id)
    try {
      const project = await createMutation.mutateAsync({
        name: `My ${template.name}`,
        canvasData: template.canvasData,
      })
      router.push(`/editor?id=${project.id}`)
    } catch (err) {
      console.error("Failed to create project from custom template:", err)
      setCreatingId(null)
    }
  }

  const handleDeleteCustomTemplate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    CustomTemplatesRepository.delete(id)
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  const filteredPresets =
    selectedTemplateCategory === "custom"
      ? []
      : TEMPLATE_PRESETS.filter(
          (tpl) => selectedTemplateCategory === "all" || tpl.category === selectedTemplateCategory
        )

  const categories = [
    { label: "All Templates", value: "all" as const, icon: Layout },
    { label: "App Stores", value: "store" as const, icon: ShoppingBag },
    { label: "Marketing", value: "marketing" as const, icon: Sparkles },
    { label: "Social Graphics", value: "social" as const, icon: Share2 },
    {
      label: `My Templates${customTemplates.length > 0 ? ` (${customTemplates.length})` : ""}`,
      value: "custom" as const,
      icon: Star,
    },
  ]

  const TemplateCard = ({
    id,
    name,
    description,
    badge,
    canvasData,
    isCustom = false,
    onSelect,
    onDelete,
  }: {
    id: string
    name: string
    description: string
    badge?: string
    canvasData: CanvasData
    isCustom?: boolean
    onSelect: () => void
    onDelete?: (e: React.MouseEvent) => void
  }) => {
    const isCreating = creatingId === id
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => !isCreating && onSelect()}
        className="group border border-border bg-surface rounded-xl overflow-hidden hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 cursor-pointer transition-all duration-300 flex flex-col h-72 relative"
      >
        {/* Preview */}
        <div
          className="flex-1 w-full flex items-center justify-center relative overflow-hidden"
          style={
            (canvasData.background?.type || "solid") === "solid"
              ? { backgroundColor: canvasData.background?.color || "#09090b" }
              : {
                  backgroundImage:
                    canvasData.background?.gradient ||
                    "linear-gradient(to bottom, #8b5cf6, #3b82f6)",
                }
          }
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />

          <div className="w-16 h-28 border border-white/10 bg-black/40 rounded-lg p-1.5 shadow-2xl relative transition-transform duration-300 group-hover:scale-105 flex flex-col justify-between">
            <div className="h-1 bg-white/5 rounded-sm" />
            <div className="flex-1 my-1.5 border border-white/5 bg-white/5 rounded flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white/20" />
            </div>
            <div className="h-0.5 w-1/3 bg-white/5 rounded-sm self-center" />
          </div>

          {badge && (
            <span className="absolute top-3 left-3 text-[10px] bg-black/60 backdrop-blur-md border border-white/10 text-white px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
              {badge}
            </span>
          )}

          {isCustom && onDelete && (
            <button
              onClick={onDelete}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/20 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
              title="Delete template"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}

          {isCreating && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-[10px] text-white/70 font-medium">Creating project...</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 border-t border-border bg-surface space-y-1">
          <h4 className="text-xs font-semibold text-foreground truncate">{name}</h4>
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-border pb-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isActive = selectedTemplateCategory === cat.value
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedTemplateCategory(cat.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all duration-200 ${
                isActive
                  ? cat.value === "custom"
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-primary/10 border-primary/30 text-primary"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Custom Templates Tab */}
      {selectedTemplateCategory === "custom" && (
        <>
          {customTemplates.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-16 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No saved templates yet</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                In the editor, click the{" "}
                <span className="text-yellow-400 font-semibold">Bookmark</span> icon in the top
                toolbar to save your current design as a custom template.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {customTemplates.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  id={tpl.id}
                  name={tpl.name}
                  description={`Saved ${new Date(tpl.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  badge="Custom"
                  canvasData={tpl.canvasData}
                  isCustom
                  onSelect={() => handleSelectCustomTemplate(tpl)}
                  onDelete={(e) => handleDeleteCustomTemplate(e, tpl.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Built-in Presets */}
      {selectedTemplateCategory !== "custom" && (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredPresets.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              id={tpl.id}
              name={tpl.name}
              description={tpl.description}
              badge={tpl.badge}
              canvasData={tpl.canvas_data}
              onSelect={() => handleSelectTemplate(tpl)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
