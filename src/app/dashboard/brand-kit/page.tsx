"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Palette,
  Type,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Upload,
  RefreshCw,
  Check,
  Star,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandKitRepository } from "@/features/brand-kit/data/brand-kit-repository"
import { BrandKit, BrandAsset, BRAND_FONT_OPTIONS } from "@/types/brand-kit"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ColorSwatch({
  color,
  label,
  onChange,
}: {
  color: string
  label: string
  onChange: (c: string) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <button
        onClick={() => inputRef.current?.click()}
        className="group relative h-14 w-full rounded-xl border-2 border-border cursor-pointer overflow-hidden hover:border-primary/40 transition-colors"
        style={{ backgroundColor: color }}
        title={`Change ${label}`}
      >
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 text-white text-[10px] font-bold">
          {color.toUpperCase()}
        </span>
      </button>
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
      <div className="flex items-center gap-1.5 border border-border rounded-lg px-2 py-1 bg-muted/40">
        <span
          className="h-3 w-3 rounded-full shrink-0 border border-border/60"
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] text-foreground font-mono flex-1">{color.toUpperCase()}</span>
        <Palette className="h-3 w-3 text-muted-foreground/60" />
      </div>
    </div>
  )
}

export default function BrandKitPage() {
  const [kit, setKit] = React.useState<BrandKit | null>(null)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const iconInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setKit(BrandKitRepository.get())
  }, [])

  const showError = (msg: string) => {
    setError(msg)
    setTimeout(() => setError(null), 6000)
  }

  const update = (partial: Partial<BrandKit>) => {
    try {
      const next = BrandKitRepository.update(partial)
      setKit(next)
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to save.")
    }
  }

  const handleSave = () => {
    if (!kit) return
    try {
      BrandKitRepository.update(kit)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to save.")
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const src = await readFileAsDataUrl(file)
      const next = await BrandKitRepository.setLogo({ name: file.name, src })
      setKit(next)
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to upload logo.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      let current = kit!
      for (const file of files) {
        const src = await readFileAsDataUrl(file)
        current = await BrandKitRepository.addIcon({ name: file.name, src, type: "icon" })
      }
      setKit(current)
    } catch (e) {
      showError(e instanceof Error ? e.message : "Failed to upload asset.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleRemoveIcon = (id: string) => {
    const next = BrandKitRepository.removeIcon(id)
    setKit(next)
  }

  const handleReset = () => {
    const next = BrandKitRepository.reset()
    setKit(next)
  }

  if (!kit) return null

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Error banner */}
      {error && (
        <div className="shrink-0 flex items-center gap-2 bg-destructive/10 border-b border-destructive/20 text-destructive px-4 py-2 text-xs font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-md shrink-0 px-6 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">Brand Kit</h1>
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            Store your brand colors, fonts, and logos in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground h-8 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} className="h-8 cursor-pointer">
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5" /> Saved!
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Save Brand Kit
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
          {/* ── Colors ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Brand Colors</h3>
                <p className="text-[11px] text-muted-foreground">
                  Click any swatch to change the color
                </p>
              </div>
            </div>
            <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <ColorSwatch
                color={kit.primaryColor}
                label="Primary Color"
                onChange={(c) => update({ primaryColor: c })}
              />
              <ColorSwatch
                color={kit.secondaryColor}
                label="Secondary Color"
                onChange={(c) => update({ secondaryColor: c })}
              />
              <ColorSwatch
                color={kit.accentColor}
                label="Accent Color"
                onChange={(c) => update({ accentColor: c })}
              />
            </div>

            {/* Palette preview strip */}
            <div className="px-5 pb-5">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                Preview
              </p>
              <div className="flex h-10 rounded-xl overflow-hidden border border-border">
                {[
                  kit.primaryColor,
                  kit.secondaryColor,
                  kit.accentColor,
                  kit.primaryColor + "88",
                  kit.secondaryColor + "55",
                ].map((c, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Typography ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="h-8 w-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <Type className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Brand Font</h3>
                <p className="text-[11px] text-muted-foreground">
                  Select your primary brand typeface
                </p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-4">
              {/* Font picker grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BRAND_FONT_OPTIONS.map(({ label, value }) => {
                  const isActive = kit.fontFamily === value
                  return (
                    <button
                      key={value}
                      onClick={() => update({ fontFamily: value })}
                      className={`flex flex-col items-start px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? "border-primary/40 bg-primary/8 text-primary"
                          : "border-border bg-muted/20 text-muted-foreground hover:text-foreground hover:border-border/80"
                      }`}
                    >
                      <span
                        className="text-base font-bold leading-tight"
                        style={{ fontFamily: value }}
                      >
                        Aa
                      </span>
                      <span className="text-[10px] mt-0.5 font-semibold">{label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                  Preview
                </p>
                <p
                  className="text-2xl font-bold text-foreground"
                  style={{ fontFamily: kit.fontFamily }}
                >
                  Your Brand Name
                </p>
                <p
                  className="text-sm text-muted-foreground mt-1"
                  style={{ fontFamily: kit.fontFamily }}
                >
                  The quick brown fox jumps over the lazy dog. 0123456789
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Logo ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Logo</h3>
                  <p className="text-[11px] text-muted-foreground">Your primary brand logo</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploading}
                className="h-8 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {uploading ? "Processing…" : kit.logo ? "Replace" : "Upload"}
              </Button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            <div className="px-5 py-5">
              {kit.logo ? (
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={kit.logo.src}
                      alt={kit.logo.name}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {kit.logo.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Logo on dark background:
                    </p>
                    <div className="mt-2 h-16 w-32 rounded-lg bg-zinc-900 border border-border/20 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={kit.logo.src}
                        alt="dark bg preview"
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      BrandKitRepository.setLogo(undefined)
                      setKit(BrandKitRepository.get())
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                    title="Remove logo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl py-10 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all"
                >
                  <ImageIcon className="h-8 w-8 opacity-40" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Upload your logo</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      PNG, SVG, or WebP recommended
                    </p>
                  </div>
                </button>
              )}
            </div>
          </motion.div>

          {/* ── Icons / Brand Assets ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Icons &amp; Brand Assets</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {kit.icons.length} asset{kit.icons.length !== 1 ? "s" : ""} saved
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => iconInputRef.current?.click()}
                disabled={uploading}
                className="h-8 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {uploading ? "Processing…" : "Add Assets"}
              </Button>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleIconUpload}
                className="hidden"
              />
            </div>

            <div className="px-5 py-5">
              {kit.icons.length === 0 ? (
                <button
                  onClick={() => iconInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl py-10 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all"
                >
                  <Sparkles className="h-8 w-8 opacity-40" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">No brand assets yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Upload icons, illustrations, or other brand visuals
                    </p>
                  </div>
                </button>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                  {kit.icons.map((icon: BrandAsset) => (
                    <div key={icon.id} className="group relative">
                      <div className="aspect-square rounded-xl border border-border bg-muted/30 overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={icon.src}
                          alt={icon.name}
                          className="h-full w-full object-contain p-1.5"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveIcon(icon.id)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                        title="Remove"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                      <p className="text-[9px] text-muted-foreground truncate mt-1 text-center">
                        {icon.name}
                      </p>
                    </div>
                  ))}
                  {/* Add more button */}
                  <button
                    onClick={() => iconInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all"
                    title="Add more"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Reusable Components / Saved Templates ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="h-8 w-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Reusable Components</h3>
                <p className="text-[11px] text-muted-foreground">
                  Save any design as a reusable template from the Editor toolbar
                </p>
              </div>
            </div>
            <div className="px-5 py-5 space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Open a project in the <strong className="text-foreground">Editor</strong>, design
                  your component layout, then click the{" "}
                  <strong className="text-foreground">Bookmark</strong> icon in the top toolbar to
                  save it as a custom template. Saved templates appear in{" "}
                  <strong className="text-foreground">Dashboard → Templates → My Templates</strong>.
                </div>
              </div>
              <a
                href="/dashboard?tab=templates"
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer"
              >
                <span className="text-xs font-semibold text-foreground">View Saved Templates</span>
                <span className="text-[10px] text-primary font-semibold group-hover:underline">
                  Open →
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
