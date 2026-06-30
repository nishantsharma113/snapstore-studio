"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
  HardDrive,
  FolderOpen,
  Search,
  FileImage,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const ASSETS_STORAGE_KEY = "snapstore_assets"

interface Asset {
  id: string
  name: string
  src: string
  size: number
  type: string
  uploadedAt: string
}

function getStoredAssets(): Asset[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(ASSETS_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveAssets(assets: Asset[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets))
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AssetsPage() {
  const [assets, setAssets] = React.useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isDragging, setIsDragging] = React.useState(false)
  const dropRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setAssets(getStoredAssets())
  }, [])

  const addAssets = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    if (imageFiles.length === 0) return

    let processed = 0
    const newAssets: Asset[] = []

    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        if (src) {
          newAssets.push({
            id: "asset_" + Math.random().toString(36).substr(2, 9),
            name: file.name,
            src,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
          })
        }
        processed++
        if (processed === imageFiles.length) {
          setAssets((prev) => {
            const updated = [...newAssets, ...prev]
            saveAssets(updated)
            return updated
          })
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addAssets(files)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    addAssets(files)
  }

  const handleDelete = (id: string) => {
    setAssets((prev) => {
      const updated = prev.filter((a) => a.id !== id)
      saveAssets(updated)
      return updated
    })
  }

  const handleDownload = (asset: Asset) => {
    const a = document.createElement("a")
    a.href = asset.src
    a.download = asset.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const filtered = assets.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const totalSize = assets.reduce((acc, a) => acc + a.size, 0)

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-md shrink-0 px-6 h-14 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">Assets Library</h1>
          <p className="text-[10px] text-muted-foreground">
            {assets.length} files · {formatBytes(totalSize)} used
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="default"
          size="sm"
          className="cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Upload Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Storage Usage Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Assets",
                value: assets.length,
                icon: FileImage,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: "Storage Used",
                value: formatBytes(totalSize),
                icon: HardDrive,
                color: "text-secondary",
                bg: "bg-secondary/10",
              },
              {
                label: "Recent Uploads",
                value: assets.filter((a) => {
                  const d = new Date(a.uploadedAt)
                  const cutoff = new Date()
                  cutoff.setDate(cutoff.getDate() - 7)
                  return d >= cutoff
                }).length,
                icon: FolderOpen,
                color: "text-destructive",
                bg: "bg-destructive/10",
              },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-border bg-surface rounded-xl p-4 flex items-center gap-4"
                >
                  <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-surface border-border focus-visible:ring-primary text-xs h-9"
            />
          </div>

          {/* Drop Zone + Grid */}
          <div
            ref={dropRef}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {assets.length === 0 ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-20 text-center transition-colors duration-200 ${
                  isDragging ? "border-primary/60 bg-primary/5" : "border-border bg-muted/10"
                }`}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Drop images here</h3>
                <p className="text-muted-foreground text-xs mb-6">
                  Upload PNG, JPG, SVG, WebP images to your library
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="default"
                  size="sm"
                  className="cursor-pointer"
                >
                  Browse Files
                </Button>
              </div>
            ) : (
              <>
                {isDragging && (
                  <div className="border-2 border-dashed border-primary/60 bg-primary/5 rounded-2xl p-8 text-center mb-4 transition-colors">
                    <p className="text-primary font-semibold text-sm">Drop to upload</p>
                  </div>
                )}

                {filtered.length === 0 ? (
                  <p className="text-center text-muted-foreground text-xs py-12">
                    No assets match &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : (
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {filtered.map((asset, idx) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group relative border border-border bg-surface rounded-xl overflow-hidden hover:border-primary/20 transition-all duration-200"
                      >
                        {/* Thumbnail */}
                        <div className="aspect-square w-full overflow-hidden bg-muted/50 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.src}
                            alt={asset.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="p-2">
                          <p className="text-[10px] font-semibold text-foreground truncate">
                            {asset.name}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {formatBytes(asset.size)}
                          </p>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownload(asset)}
                            className="p-2 rounded-lg bg-background/80 border border-border text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="p-2 rounded-lg bg-background/80 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/20 cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
