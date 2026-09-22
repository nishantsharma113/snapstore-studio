"use client"

import * as React from "react"
import { useCreateProjectMutation } from "../hooks/useProjects"
import { useRouter } from "next/navigation"
import { useProjectStore, TemplateCategoryOption } from "@/store/projectStore"
import { CustomTemplatesRepository, CustomTemplate } from "../data/custom-templates-repository"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Smartphone,
  Layout,
  ShoppingBag,
  Share2,
  Loader2,
  Star,
  Trash2,
  ArrowRight,
  Bookmark,
} from "lucide-react"
import { CanvasData } from "@/types/project"

interface TemplatePreset {
  id: string
  name: string
  category: TemplateCategoryOption
  headline: string
  subtext: string
  canvas_data: CanvasData
  badge?: string
  gradient: string
  accentColor: string
  phoneGlowColor: string
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "tpl_minimal_store",
    name: "Minimal App Store",
    category: "store",
    headline: "Clean & Bold",
    subtext: "Make every pixel count on the App Store",
    badge: "App Store",
    gradient: "linear-gradient(145deg, #1a0533 0%, #3b0764 40%, #6d28d9 100%)",
    accentColor: "#a855f7",
    phoneGlowColor: "rgba(168, 85, 247, 0.4)",
    canvas_data: {
      width: 1242,
      height: 2688,
      layers: [],
      background: { type: "solid", color: "#0a0a0c" },
    },
  },
  {
    id: "tpl_gradient_marketing",
    name: "Sleek Gradient",
    category: "marketing",
    headline: "Stand Out Now",
    subtext: "Premium visuals that convert at first glance",
    badge: "Marketing",
    gradient: "linear-gradient(145deg, #0c0a3e 0%, #1e1b8b 40%, #4f46e5 100%)",
    accentColor: "#818cf8",
    phoneGlowColor: "rgba(99, 102, 241, 0.4)",
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
    name: "Sunset Promo",
    category: "social",
    headline: "Go Viral Fast",
    subtext: "Built for social, designed to be shared",
    badge: "Social",
    gradient: "linear-gradient(145deg, #450a0a 0%, #9f1239 40%, #f43f5e 100%)",
    accentColor: "#fb7185",
    phoneGlowColor: "rgba(244, 63, 94, 0.4)",
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
    name: "Google Play Dark",
    category: "store",
    headline: "Play Store Ready",
    subtext: "Optimized for Android audiences worldwide",
    badge: "Google Play",
    gradient: "linear-gradient(145deg, #020617 0%, #0f172a 40%, #1e3a5f 100%)",
    accentColor: "#38bdf8",
    phoneGlowColor: "rgba(56, 189, 248, 0.4)",
    canvas_data: {
      width: 1080,
      height: 1920,
      layers: [],
      background: { type: "solid", color: "#0f172a" },
    },
  },
  {
    id: "tpl_teal_airy",
    name: "Light & Airy",
    category: "marketing",
    headline: "Fresh & Clean",
    subtext: "Minimal style that breathes and converts",
    badge: "Marketing",
    gradient: "linear-gradient(145deg, #012b2b 0%, #0d4a4a 40%, #0d9488 100%)",
    accentColor: "#2dd4bf",
    phoneGlowColor: "rgba(45, 212, 191, 0.4)",
    canvas_data: {
      width: 1242,
      height: 2688,
      layers: [],
      background: {
        type: "gradient",
        gradient: "linear-gradient(135deg, #0d9488, #06b6d4)",
      },
    },
  },
  {
    id: "tpl_neon_glow",
    name: "Neon Glow",
    category: "social",
    headline: "Glow Up Now",
    subtext: "Electric visuals for bold brand statements",
    badge: "Social",
    gradient: "linear-gradient(145deg, #0a0a1a 0%, #1a0a3e 40%, #2d1b69 100%)",
    accentColor: "#c084fc",
    phoneGlowColor: "rgba(192, 132, 252, 0.5)",
    canvas_data: {
      width: 1080,
      height: 1920,
      layers: [],
      background: {
        type: "gradient",
        gradient: "linear-gradient(135deg, #581c87, #3730a3)",
      },
    },
  },
  {
    id: "tpl_frosted_glass",
    name: "Frosted Glass",
    category: "store",
    headline: "Sleek & Modern",
    subtext: "Glass morphism style for premium app listings",
    badge: "App Store",
    gradient: "linear-gradient(145deg, #071827 0%, #0f2d4a 40%, #1a4a6e 100%)",
    accentColor: "#7dd3fc",
    phoneGlowColor: "rgba(125, 211, 252, 0.35)",
    canvas_data: {
      width: 1242,
      height: 2688,
      layers: [],
      background: {
        type: "gradient",
        gradient: "linear-gradient(135deg, #1e3a5f, #0c4a6e)",
      },
    },
  },
  {
    id: "tpl_bold_orange",
    name: "Bold Minimal",
    category: "marketing",
    headline: "Bold & Bright",
    subtext: "High-energy layouts that demand attention",
    badge: "Marketing",
    gradient: "linear-gradient(145deg, #1c0700 0%, #431407 40%, #c2410c 100%)",
    accentColor: "#fb923c",
    phoneGlowColor: "rgba(251, 146, 60, 0.4)",
    canvas_data: {
      width: 1242,
      height: 2688,
      layers: [],
      background: {
        type: "gradient",
        gradient: "linear-gradient(135deg, #ea580c, #dc2626)",
      },
    },
  },
]

// ───────────────────────────────────────────────────────────────────────────────
// Phone Mockup SVG component
// ───────────────────────────────────────────────────────────────────────────────
function PhoneMockup({
  glowColor,
  accentColor,
  screenContent,
}: {
  glowColor: string
  accentColor: string
  screenContent?: React.ReactNode
}) {
  return (
    <div className="relative" style={{ width: 88, height: 178 }}>
      {/* Glow halo */}
      <div
        className="absolute inset-0 rounded-[26px] blur-xl scale-110 opacity-60"
        style={{ background: glowColor }}
      />
      {/* Phone body */}
      <div
        className="relative w-full h-full rounded-[26px] border-2 overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(160deg, #1c1c2e 0%, #0d0d1a 100%)",
          borderColor: "rgba(255,255,255,0.15)",
          boxShadow: `0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)`,
        }}
      >
        {/* Notch / Dynamic Island */}
        <div className="flex justify-center pt-2 shrink-0">
          <div
            className="rounded-full"
            style={{
              width: 32,
              height: 8,
              background: "#000",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.05)",
            }}
          />
        </div>

        {/* Screen area */}
        <div
          className="flex-1 mx-1 mb-1 rounded-[18px] overflow-hidden flex flex-col items-center justify-center gap-1.5"
          style={{
            background: "linear-gradient(160deg, #16162a 0%, #0a0a16 100%)",
          }}
        >
          {screenContent ? (
            screenContent
          ) : (
            <>
              {/* Mock UI elements */}
              <div
                className="w-8 h-1 rounded-full opacity-30"
                style={{ background: accentColor }}
              />
              <div
                className="rounded-md"
                style={{
                  width: 42,
                  height: 42,
                  background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
                  border: `1px solid ${accentColor}44`,
                }}
              />
              <div className="space-y-1 w-10">
                <div className="h-0.5 rounded-full bg-white/10 w-full" />
                <div className="h-0.5 rounded-full bg-white/10 w-4/5" />
                <div className="h-0.5 rounded-full bg-white/10 w-3/5" />
              </div>
              <div
                className="rounded-md px-2 py-0.5"
                style={{
                  background: accentColor,
                  fontSize: 5,
                  color: "#fff",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                GET STARTED
              </div>
            </>
          )}
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-1.5 shrink-0">
          <div
            className="rounded-full"
            style={{ width: 24, height: 3, background: "rgba(255,255,255,0.15)" }}
          />
        </div>

        {/* Specular highlight */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Side buttons */}
      <div
        className="absolute rounded-r-sm"
        style={{
          left: -2,
          top: 36,
          width: 2,
          height: 14,
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <div
        className="absolute rounded-r-sm"
        style={{
          left: -2,
          top: 56,
          width: 2,
          height: 20,
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <div
        className="absolute rounded-l-sm"
        style={{
          right: -2,
          top: 46,
          width: 2,
          height: 28,
          background: "rgba(255,255,255,0.12)",
        }}
      />
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────────
// Kova-style Template Card
// ───────────────────────────────────────────────────────────────────────────────
function KovaTemplateCard({
  id,
  name,
  headline,
  subtext,
  badge,
  gradient,
  accentColor,
  phoneGlowColor,
  isCreating,
  isCustom = false,
  onSelect,
  onDelete,
}: {
  id: string
  name: string
  headline: string
  subtext: string
  badge?: string
  gradient: string
  accentColor: string
  phoneGlowColor: string
  isCreating: boolean
  isCustom?: boolean
  onSelect: () => void
  onDelete?: (e: React.MouseEvent) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
      onClick={() => !isCreating && onSelect()}
      className="relative flex-shrink-0 cursor-pointer group"
      style={{ width: 210, height: 340 }}
    >
      {/* Card background with gradient */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: gradient,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)`,
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative orb */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-40"
          style={{ background: accentColor }}
        />
        <div
          className="absolute -bottom-12 -left-6 w-28 h-28 rounded-full blur-3xl opacity-25"
          style={{ background: accentColor }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-5">
          {/* Badge */}
          {badge && (
            <div className="self-start mb-3">
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {badge}
              </span>
            </div>
          )}

          {/* Headline */}
          <h3
            className="text-white font-black leading-tight mb-1"
            style={{ fontSize: 22, letterSpacing: -0.5 }}
          >
            {headline}
          </h3>

          {/* Subtext */}
          <p
            className="leading-snug"
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
              maxWidth: 140,
            }}
          >
            {subtext}
          </p>

          {/* Phone mockup — centered below text */}
          <div className="flex-1 flex items-end justify-center pb-2 pt-4">
            <div
              className="transition-transform duration-300 group-hover:scale-105"
              style={{ transformOrigin: "bottom center" }}
            >
              <PhoneMockup glowColor={phoneGlowColor} accentColor={accentColor} />
            </div>
          </div>
        </div>

        {/* Hover overlay — CTA */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
        >
          {isCreating ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-white" />
              <span className="text-[11px] text-white/70 font-semibold">Creating project...</span>
            </>
          ) : (
            <>
              <div
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white"
                style={{ background: accentColor, boxShadow: `0 4px 16px ${phoneGlowColor}` }}
              >
                Use Template
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] text-white/50 font-medium">{name}</span>
            </>
          )}
        </div>

        {/* Delete button for custom templates */}
        {isCustom && onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer transition-all z-20"
            style={{
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,100,100,0.9)",
            }}
            title="Delete template"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Per-card glow shadow on hover */}
      <div
        className="absolute inset-x-4 -bottom-3 h-8 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 -z-10"
        style={{ background: accentColor }}
      />
    </motion.div>
  )
}

// ───────────────────────────────────────────────────────────────────────────────
// Main TemplatesGrid
// ───────────────────────────────────────────────────────────────────────────────
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

  // Map custom template to kova-style gradients
  const CUSTOM_GRADIENTS = [
    {
      gradient: "linear-gradient(145deg, #1a0533 0%, #3b0764 40%, #6d28d9 100%)",
      accentColor: "#a855f7",
      phoneGlowColor: "rgba(168, 85, 247, 0.4)",
    },
    {
      gradient: "linear-gradient(145deg, #0c0a3e 0%, #1e1b8b 40%, #4f46e5 100%)",
      accentColor: "#818cf8",
      phoneGlowColor: "rgba(99, 102, 241, 0.4)",
    },
    {
      gradient: "linear-gradient(145deg, #450a0a 0%, #9f1239 40%, #f43f5e 100%)",
      accentColor: "#fb7185",
      phoneGlowColor: "rgba(244, 63, 94, 0.4)",
    },
    {
      gradient: "linear-gradient(145deg, #012b2b 0%, #0d4a4a 40%, #0d9488 100%)",
      accentColor: "#2dd4bf",
      phoneGlowColor: "rgba(45, 212, 191, 0.4)",
    },
    {
      gradient: "linear-gradient(145deg, #1c0700 0%, #431407 40%, #c2410c 100%)",
      accentColor: "#fb923c",
      phoneGlowColor: "rgba(251, 146, 60, 0.4)",
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Section heading ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Screenshot Templates</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose a template to jumpstart your App Store or Google Play artwork
          </p>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium bg-muted/40 border border-border rounded-lg px-2 py-1">
          {filteredPresets.length +
            (selectedTemplateCategory === "custom" ? customTemplates.length : 0)}{" "}
          templates
        </span>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isActive = selectedTemplateCategory === cat.value
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedTemplateCategory(cat.value)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200"
              style={
                isActive
                  ? cat.value === "custom"
                    ? {
                        background: "linear-gradient(135deg, #854d0e, #ca8a04)",
                        color: "#fff",
                        boxShadow: "0 4px 12px rgba(202, 138, 4, 0.35)",
                      }
                    : {
                        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        color: "#fff",
                        boxShadow: "0 4px 12px rgba(124, 58, 237, 0.35)",
                      }
                  : {
                      background: "transparent",
                      color: "var(--color-muted-foreground)",
                      border: "1px solid var(--color-border)",
                    }
              }
            >
              <Icon className="h-3 w-3" />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Custom Templates Tab ── */}
      <AnimatePresence mode="wait">
        {selectedTemplateCategory === "custom" && (
          <motion.div
            key="custom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {customTemplates.length === 0 ? (
              /* Empty state */
              <div className="border border-dashed border-border rounded-2xl py-20 flex flex-col items-center justify-center gap-4 bg-muted/10">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, #854d0e22, #ca8a0422)",
                    border: "1px solid #ca8a0430",
                  }}
                >
                  <Bookmark className="h-7 w-7 text-yellow-500" />
                </div>
                <div className="text-center space-y-1 max-w-xs">
                  <h3 className="text-sm font-bold text-foreground">No saved templates yet</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    In the editor, click the{" "}
                    <span className="text-yellow-400 font-semibold">Bookmark</span> icon in the top
                    toolbar to save your current design as a custom template.
                  </p>
                </div>
              </div>
            ) : (
              /* Kova-style custom horizontal scroll */
              <div className="relative">
                <div
                  className="flex gap-4 pb-4 overflow-x-auto"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {customTemplates.map((tpl, idx) => {
                    const colorStyle = CUSTOM_GRADIENTS[idx % CUSTOM_GRADIENTS.length]
                    return (
                      <KovaTemplateCard
                        key={tpl.id}
                        id={tpl.id}
                        name={tpl.name}
                        headline={tpl.name}
                        subtext={`Saved on ${new Date(tpl.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                        badge="Custom"
                        gradient={colorStyle.gradient}
                        accentColor={colorStyle.accentColor}
                        phoneGlowColor={colorStyle.phoneGlowColor}
                        isCreating={creatingId === tpl.id}
                        isCustom
                        onSelect={() => handleSelectCustomTemplate(tpl)}
                        onDelete={(e) => handleDeleteCustomTemplate(e, tpl.id)}
                      />
                    )
                  })}
                </div>
                {/* Fade edge */}
                <div className="absolute right-0 top-0 bottom-4 w-20 pointer-events-none bg-gradient-to-l from-background to-transparent" />
              </div>
            )}
          </motion.div>
        )}

        {/* ── Built-in Presets — Kova-style horizontal scroll ── */}
        {selectedTemplateCategory !== "custom" && (
          <motion.div
            key={selectedTemplateCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {filteredPresets.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl py-16 flex flex-col items-center gap-3 bg-muted/10">
                <Smartphone className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground font-medium">
                  No templates in this category
                </p>
              </div>
            ) : (
              <>
                {/* Horizontal scroll strip */}
                <div
                  className="flex gap-4 pb-5 overflow-x-auto"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {filteredPresets.map((tpl, idx) => (
                    <KovaTemplateCard
                      key={tpl.id}
                      id={tpl.id}
                      name={tpl.name}
                      headline={tpl.headline}
                      subtext={tpl.subtext}
                      badge={tpl.badge}
                      gradient={tpl.gradient}
                      accentColor={tpl.accentColor}
                      phoneGlowColor={tpl.phoneGlowColor}
                      isCreating={creatingId === tpl.id}
                      onSelect={() => handleSelectTemplate(tpl)}
                    />
                  ))}
                </div>

                {/* Right fade edge */}
                <div className="absolute right-0 top-0 bottom-5 w-20 pointer-events-none bg-gradient-to-l from-background to-transparent" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Template count & hint ── */}
      {selectedTemplateCategory !== "custom" && filteredPresets.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-center font-medium pb-1">
          Scroll to explore all {filteredPresets.length} templates · Click any card to open a new
          project
        </p>
      )}
    </div>
  )
}
