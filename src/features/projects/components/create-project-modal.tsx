"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateProjectMutation } from "../hooks/useProjects"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CanvasData } from "@/types/project"

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(60, "Name must be under 60 characters"),
  preset: z.enum(["iphone", "android", "social", "custom"]),
  width: z.number().min(200, "Min width 200px").max(4000, "Max width 4000px"),
  height: z.number().min(200, "Min height 200px").max(4000, "Max height 4000px"),
  bgColor: z.string().min(4, "Invalid color value"),
})

type CreateProjectFields = z.infer<typeof createProjectSchema>

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter()
  const createMutation = useCreateProjectMutation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectFields>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "My Screenshot",
      preset: "iphone",
      width: 1242,
      height: 2688,
      bgColor: "#7c3aed", // default violet solid color
    },
  })

  const selectedPreset = watch("preset")

  // Update sizes when preset changes
  React.useEffect(() => {
    if (selectedPreset === "iphone") {
      setValue("width", 1242)
      setValue("height", 2688)
    } else if (selectedPreset === "android") {
      setValue("width", 1080)
      setValue("height", 1920)
    } else if (selectedPreset === "social") {
      setValue("width", 1080)
      setValue("height", 1080)
    }
  }, [selectedPreset, setValue])

  const onSubmit = async (data: CreateProjectFields) => {
    const canvasData: CanvasData = {
      width: data.width,
      height: data.height,
      layers: [],
      background: {
        type: "solid",
        color: data.bgColor,
      },
    }

    try {
      const project = await createMutation.mutateAsync({
        name: data.name,
        canvasData,
      })
      onClose()
      router.push(`/editor?id=${project.id}`)
    } catch (err) {
      console.error("Failed to create project:", err)
    }
  }

  // Handle ESC close key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative z-10 w-full max-w-[460px] rounded-2xl border border-border bg-popover p-6 shadow-2xl glow-effect overflow-hidden"
          >
            {/* Background design glow */}
            <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Create Custom Project
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg border border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="proj-name">Project Name</Label>
                <Input
                  id="proj-name"
                  type="text"
                  disabled={createMutation.isPending}
                  className={
                    errors.name ? "border-destructive bg-muted/20" : "bg-muted/20 border-border"
                  }
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-[11px] text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Preset Selector */}
              <div className="space-y-1.5">
                <Label>Dimension Preset</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "iphone", label: "iPhone App Store" },
                    { value: "android", label: "Android Google Play" },
                    { value: "social", label: "Social Graphics" },
                    { value: "custom", label: "Custom Canvas" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between border rounded-lg p-2.5 text-xs font-semibold cursor-pointer transition-all duration-200 ${
                        selectedPreset === option.value
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                      }`}
                    >
                      <span>{option.label}</span>
                      <input
                        type="radio"
                        value={option.value}
                        className="sr-only"
                        disabled={createMutation.isPending}
                        {...register("preset")}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Width / Height dimensions inputs */}
              {selectedPreset === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="proj-width">Width (px)</Label>
                    <Input
                      id="proj-width"
                      type="number"
                      disabled={createMutation.isPending}
                      className="bg-muted/20 border-border"
                      {...register("width", { valueAsNumber: true })}
                    />
                    {errors.width && (
                      <p className="text-[11px] text-destructive">{errors.width.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="proj-height">Height (px)</Label>
                    <Input
                      id="proj-height"
                      type="number"
                      disabled={createMutation.isPending}
                      className="bg-muted/20 border-border"
                      {...register("height", { valueAsNumber: true })}
                    />
                    {errors.height && (
                      <p className="text-[11px] text-destructive">{errors.height.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Background Color Pick */}
              <div className="space-y-1.5">
                <Label htmlFor="proj-color">Canvas Background Color</Label>
                <div className="flex gap-3">
                  <Input
                    id="proj-color"
                    type="color"
                    className="h-10 w-12 p-0.5 border-border bg-transparent rounded-lg cursor-pointer"
                    disabled={createMutation.isPending}
                    {...register("bgColor")}
                  />
                  <Input
                    type="text"
                    className="flex-1 bg-muted/20 border-border"
                    disabled={createMutation.isPending}
                    {...register("bgColor")}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="font-medium cursor-pointer"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
