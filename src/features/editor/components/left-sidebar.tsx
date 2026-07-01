"use client"

import * as React from "react"
import { useEditorStore } from "@/store/editorStore"
import {
  Grid,
  Upload,
  Smartphone,
  Sparkles,
  Type,
  Square,
  Plus,
  ImageIcon,
  Layers,
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Star,
  Hexagon,
} from "lucide-react"

export function LeftSidebar() {
  const {
    activeTab,
    setActiveTab,
    setBackground,
    addLayer,
    setLayers,
    setPages,
    setCurrentPageId,
    layers,
    selectedIds,
    setSelectedIds,
    updateLayer,
    deleteLayer,
    moveLayerToIndex,
  } = useEditorStore()

  const uid = () => `layer_${Math.random().toString(36).slice(2, 11)}`
  const pid = () => `page_${Math.random().toString(36).slice(2, 11)}`

  // Base64 simulated image uploads
  const [uploads, setUploads] = React.useState<string[]>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setUploads((prev) => [result, ...prev])
        // Automatically add the uploaded image as a layer
        addLayer({
          name: file.name.split(".")[0],
          type: "image",
          width: 300,
          height: 400,
          imageProps: { src: result },
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddText = (style: "title" | "subtitle" | "body") => {
    let size = 80
    let text = "Text Block"
    let weight: "normal" | "bold" | "italic" = "normal"

    if (style === "title") {
      size = 96
      text = "ADD HEADING"
      weight = "bold"
    } else if (style === "subtitle") {
      size = 64
      text = "Add sub-heading"
      weight = "normal"
    } else {
      size = 40
      text = "Add paragraph text..."
      weight = "normal"
    }

    addLayer({
      name: text,
      type: "text",
      width: 600,
      height: 120,
      textProps: {
        text,
        fontSize: size,
        fontFamily: "Inter",
        fontStyle: weight,
        fill: "#ffffff",
        align: "center",
      },
    })
  }

  const handleAddShape = (shapeType: "rect" | "circle" | "triangle" | "star" | "hexagon") => {
    addLayer({
      name: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
      type: "shape",
      width: 200,
      height: 200,
      shapeProps: {
        shapeType,
        fill: "#a855f7",
        stroke: "#ffffff",
        strokeWidth: 0,
      },
    })
  }

  const handleAddDevice = (frameType: string) => {
    const isTablet = frameType === "ipad_pro" || frameType === "android_tablet"
    const displayName = frameType
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
    addLayer({
      name: displayName,
      type: "device",
      width: isTablet ? 900 : 800,
      height: isTablet ? 1200 : 1600,
      deviceProps: {
        frameType,
        screenshotUrl: undefined,
      },
    })
  }

  const sidebarTabs = [
    { id: "layers" as const, label: "Layers", icon: Layers },
    { id: "templates" as const, label: "Templates", icon: Grid },
    { id: "uploads" as const, label: "Uploads", icon: Upload },
    { id: "frames" as const, label: "Frames", icon: Smartphone },
    { id: "backgrounds" as const, label: "Backgrounds", icon: Sparkles },
    { id: "text" as const, label: "Text", icon: Type },
    { id: "shapes" as const, label: "Shapes", icon: Square },
  ]

  // Render sub-panel content based on tab choice
  const renderTabContent = () => {
    switch (activeTab) {
      case "layers": {
        const reversedLayers = [...layers].reverse()

        const getTypeIcon = (type: string) => {
          switch (type) {
            case "text":
              return <Type className="h-3 w-3 text-blue-400 shrink-0" />
            case "shape":
              return <Square className="h-3 w-3 text-purple-400 shrink-0" />
            case "image":
              return <ImageIcon className="h-3 w-3 text-green-400 shrink-0" />
            case "device":
              return <Smartphone className="h-3 w-3 text-orange-400 shrink-0" />
            default:
              return <Square className="h-3 w-3 text-zinc-400 shrink-0" />
          }
        }

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200">Layers</h3>
              <span className="text-[10px] text-zinc-500 font-semibold bg-zinc-900 px-1.5 py-0.5 rounded-full">
                {layers.length}
              </span>
            </div>

            {reversedLayers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Layers className="h-8 w-8 text-zinc-700 mb-2" />
                <p className="text-xs text-zinc-500">No layers yet</p>
                <p className="text-[10px] text-zinc-600 mt-1">Add elements from the other tabs</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {reversedLayers.map((layer, visualIdx) => {
                  // visualIdx 0 = top of stack, so actual array index is reversed
                  const layerIdx = layers.length - 1 - visualIdx
                  const isSelected = selectedIds.includes(layer.id)

                  return (
                    <div
                      key={layer.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("dragLayerId", layer.id)
                        e.dataTransfer.setData("dragFromIdx", String(layerIdx))
                        e.dataTransfer.effectAllowed = "move"
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = "move"
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const srcId = e.dataTransfer.getData("dragLayerId")
                        if (srcId === layer.id) return
                        moveLayerToIndex(srcId, layerIdx)
                      }}
                      onClick={() => setSelectedIds([layer.id])}
                      className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all select-none ${
                        isSelected
                          ? "border-purple-500/40 bg-purple-500/10"
                          : "border-transparent hover:border-zinc-800 hover:bg-zinc-900/40"
                      }`}
                    >
                      <GripVertical className="h-3 w-3 text-zinc-700 group-hover:text-zinc-500 shrink-0 cursor-grab" />
                      {getTypeIcon(layer.type)}
                      <span
                        className={`text-xs flex-1 truncate font-medium ${
                          isSelected
                            ? "text-purple-200"
                            : layer.isVisible
                              ? "text-zinc-300"
                              : "text-zinc-600"
                        }`}
                      >
                        {layer.name}
                      </span>

                      {/* Inline actions — show on hover or when state is non-default */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateLayer(layer.id, { isVisible: !layer.isVisible })
                          }}
                          className="p-0.5 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
                          title={layer.isVisible ? "Hide" : "Show"}
                        >
                          {layer.isVisible ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-zinc-700" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateLayer(layer.id, { isLocked: !layer.isLocked })
                          }}
                          className="p-0.5 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
                          title={layer.isLocked ? "Unlock" : "Lock"}
                        >
                          {layer.isLocked ? (
                            <Lock className="h-3 w-3 text-yellow-500" />
                          ) : (
                            <Unlock className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLayer(layer.id)
                          }}
                          className="p-0.5 rounded text-zinc-600 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Persistent state indicators */}
                      {(!layer.isVisible || layer.isLocked) && (
                        <div className="flex items-center gap-0.5 group-hover:hidden">
                          {!layer.isVisible && <EyeOff className="h-2.5 w-2.5 text-zinc-700" />}
                          {layer.isLocked && <Lock className="h-2.5 w-2.5 text-yellow-700" />}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      }

      case "templates": {
        // Canvas is always 1242 wide — center layers horizontally
        const cx = (w: number) => Math.round((1242 - w) / 2)
        const base = { rotation: 0, opacity: 1, isLocked: false, isVisible: true }

        const applyPreset = (preset: "classic" | "banner" | "minimal" | "light") => {
          const reset = (
            bg: Parameters<typeof setBackground>[0],
            layerList: Parameters<typeof setLayers>[0]
          ) => {
            const newId = pid()
            setPages([{ id: newId, name: "Page 1", background: bg, layers: layerList }])
            setCurrentPageId(newId)
          }

          if (preset === "classic") {
            reset({ type: "solid", color: "#09090b" }, [
              {
                ...base,
                id: uid(),
                name: "App Heading",
                type: "text",
                x: cx(1000),
                y: 100,
                width: 1000,
                height: 140,
                textProps: {
                  text: "YOUR APP NAME",
                  fontSize: 100,
                  fontFamily: "Inter",
                  fontStyle: "bold",
                  fill: "#ffffff",
                  align: "center",
                },
              },
              {
                ...base,
                id: uid(),
                name: "Sub-heading",
                type: "text",
                x: cx(900),
                y: 210,
                width: 900,
                height: 80,
                textProps: {
                  text: "The best app for everything",
                  fontSize: 52,
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fill: "#a1a1aa",
                  align: "center",
                },
              },
              {
                ...base,
                id: uid(),
                name: "iPhone 16 Pro",
                type: "device",
                x: cx(960),
                y: 320,
                width: 960,
                height: 1960,
                deviceProps: { frameType: "iphone_16" },
              },
            ])
          } else if (preset === "banner") {
            reset(
              {
                type: "gradient",
                gradient: "linear-gradient(160deg, #7c3aed 0%, #4f46e5 55%, #0ea5e9 100%)",
              },
              [
                {
                  ...base,
                  id: uid(),
                  name: "iPhone 16 Pro",
                  type: "device",
                  x: cx(960),
                  y: 180,
                  width: 960,
                  height: 1960,
                  deviceProps: { frameType: "iphone_16" },
                },
                {
                  ...base,
                  id: uid(),
                  name: "Feature Badge",
                  type: "text",
                  x: cx(900),
                  y: 2180,
                  width: 900,
                  height: 90,
                  textProps: {
                    text: "★  Featured on App Store",
                    fontSize: 52,
                    fontFamily: "Inter",
                    fontStyle: "bold",
                    fill: "#fde68a",
                    align: "center",
                  },
                },
                {
                  ...base,
                  id: uid(),
                  name: "Tagline",
                  type: "text",
                  x: cx(1000),
                  y: 2310,
                  width: 1000,
                  height: 130,
                  textProps: {
                    text: "Download now. Free forever.",
                    fontSize: 64,
                    fontFamily: "Inter",
                    fontStyle: "bold",
                    fill: "#ffffff",
                    align: "center",
                  },
                },
              ]
            )
          } else if (preset === "minimal") {
            reset({ type: "solid", color: "#f8fafc" }, [
              {
                ...base,
                id: uid(),
                name: "App Title",
                type: "text",
                x: cx(1000),
                y: 100,
                width: 1000,
                height: 130,
                textProps: {
                  text: "Clean. Simple. Powerful.",
                  fontSize: 100,
                  fontFamily: "Inter",
                  fontStyle: "bold",
                  fill: "#0f172a",
                  align: "center",
                },
              },
              {
                ...base,
                id: uid(),
                name: "Description",
                type: "text",
                x: cx(900),
                y: 210,
                width: 900,
                height: 80,
                textProps: {
                  text: "Design your screenshots in minutes",
                  fontSize: 48,
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fill: "#64748b",
                  align: "center",
                },
              },
              {
                ...base,
                id: uid(),
                name: "iPhone 16 Pro",
                type: "device",
                x: cx(960),
                y: 320,
                width: 960,
                height: 1960,
                deviceProps: { frameType: "iphone_16" },
              },
            ])
          } else {
            reset({ type: "solid", color: "#cae8fb" }, [
              {
                ...base,
                id: uid(),
                name: "Headline",
                type: "text",
                x: cx(1000),
                y: 100,
                width: 1000,
                height: 150,
                textProps: {
                  text: "Add text here",
                  fontSize: 100,
                  fontFamily: "Inter",
                  fontStyle: "bold",
                  fill: "#0f172a",
                  align: "center",
                },
              },
              {
                ...base,
                id: uid(),
                name: "iPhone 16 Pro",
                type: "device",
                x: cx(960),
                y: 300,
                width: 960,
                height: 1960,
                deviceProps: { frameType: "iphone_16" },
              },
            ])
          }
        }

        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">Layout Presets</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Click a preset to populate the canvas with a starter layout.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                onClick={() => applyPreset("classic")}
                className="flex flex-col items-start text-left p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded bg-zinc-800 flex items-center justify-center">
                    <div className="h-3 w-1.5 rounded-sm bg-zinc-400" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                    Split Screen Classic
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 ml-7">
                  Dark bg · centered device · bold header
                </span>
              </button>
              <button
                onClick={() => applyPreset("banner")}
                className="flex flex-col items-start text-left p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                    <div className="h-2 w-3 rounded-sm bg-white/50" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                    Marketing Banner
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 ml-7">
                  Gradient bg · device + feature badge
                </span>
              </button>
              <button
                onClick={() => applyPreset("minimal")}
                className="flex flex-col items-start text-left p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded bg-slate-100 border border-zinc-700 flex items-center justify-center">
                    <div className="h-3 w-1.5 rounded-sm bg-slate-400" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                    Showcase Minimal
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 ml-7">
                  Light bg · clean device · elegant text
                </span>
              </button>
              <button
                onClick={() => applyPreset("light")}
                className="flex flex-col items-start text-left p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-5 w-5 rounded border border-zinc-700 flex items-center justify-center"
                    style={{ backgroundColor: "#cae8fb" }}
                  >
                    <div className="h-3 w-1.5 rounded-sm bg-zinc-800" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                    App Showcase Light
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 ml-7">
                  Sky blue bg · bold header · iPhone frame
                </span>
              </button>
            </div>
          </div>
        )
      }
      case "uploads":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">Image Uploads</h3>
            <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl p-6 bg-zinc-950/20 hover:border-zinc-700/80 cursor-pointer transition-all duration-200">
              <Upload className="h-6 w-6 text-zinc-500 mb-2" />
              <span className="text-xs text-zinc-400 font-semibold">Upload Image File</span>
              <span className="text-[9px] text-zinc-600 mt-1">PNG, JPG, SVG up to 5MB</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {uploads.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                  Recent Uploads
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {uploads.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        addLayer({
                          name: `Uploaded Asset ${idx + 1}`,
                          type: "image",
                          width: 300,
                          height: 400,
                          imageProps: { src: url },
                        })
                      }
                      className="aspect-square rounded-lg border border-zinc-900 overflow-hidden relative cursor-pointer hover:border-zinc-800 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Uploaded item" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      case "frames":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">Device Frames</h3>
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                Apple
              </span>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  { id: "iphone_16", name: "iPhone 16 Pro Max", desc: "Titanium · Dynamic Island" },
                  { id: "iphone_15", name: "iPhone 15 Pro", desc: "Titanium · Notch" },
                  { id: "ipad_pro", name: 'iPad Pro 12.9"', desc: "Liquid Retina · Face ID" },
                ].map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleAddDevice(device.id)}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/20 cursor-pointer text-left transition-all duration-200 w-full"
                  >
                    <div>
                      <span className="text-xs font-semibold text-zinc-300 block">
                        {device.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">{device.desc}</span>
                    </div>
                    <Plus className="h-4 w-4 text-zinc-500" />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                Android
              </span>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {[
                  {
                    id: "samsung_s24",
                    name: "Samsung Galaxy S24",
                    desc: "Armor Aluminum · Punch Hole",
                  },
                  {
                    id: "google_pixel",
                    name: "Google Pixel 9 Pro",
                    desc: "Polished frame · Punch Hole",
                  },
                  {
                    id: "android_tablet",
                    name: "Android Tablet",
                    desc: 'Generic 10.1" tablet frame',
                  },
                ].map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleAddDevice(device.id)}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/20 cursor-pointer text-left transition-all duration-200 w-full"
                  >
                    <div>
                      <span className="text-xs font-semibold text-zinc-300 block">
                        {device.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">{device.desc}</span>
                    </div>
                    <Plus className="h-4 w-4 text-zinc-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      case "backgrounds":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">Canvas Backgrounds</h3>

            {/* Solid Presets */}
            <div className="space-y-2">
              <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                Solid Colors
              </span>
              <div className="grid grid-cols-5 gap-2">
                {[
                  "#09090b",
                  "#7c3aed",
                  "#ec4899",
                  "#3b82f6",
                  "#10b981",
                  "#ef4444",
                  "#f59e0b",
                  "#ffffff",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackground({ type: "solid", color })}
                    className="aspect-square rounded-lg border border-zinc-900 cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Gradient Presets */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                Linear Gradients
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: "Sunset Glow",
                    css: "linear-gradient(to right, #ec4899, #f43f5e, #f59e0b)",
                  },
                  {
                    name: "Hyper Space",
                    css: "linear-gradient(to bottom right, #a855f7, #6366f1)",
                  },
                  {
                    name: "Emerald Mint",
                    css: "linear-gradient(to bottom right, #059669, #10b981, #6ee7b7)",
                  },
                  { name: "Slate Dark", css: "linear-gradient(to bottom, #1e293b, #0f172a)" },
                ].map((grad) => (
                  <button
                    key={grad.name}
                    onClick={() => setBackground({ type: "gradient", gradient: grad.css })}
                    className="h-12 rounded-lg border border-zinc-900 cursor-pointer flex items-end p-1.5 hover:scale-[1.02] transition-transform"
                    style={{ backgroundImage: grad.css }}
                  >
                    <span className="text-[9px] text-white/80 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded font-medium truncate w-full text-left">
                      {grad.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Image Upload */}
            <div className="space-y-2 pt-2 border-t border-zinc-900/60">
              <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                Background Image
              </span>
              <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl p-4 bg-zinc-950/20 hover:border-zinc-700/80 cursor-pointer transition-all duration-200">
                <ImageIcon className="h-5 w-5 text-zinc-500 mb-1" />
                <span className="text-[10px] text-zinc-400 font-semibold">Upload BG Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      const url = ev.target?.result as string
                      if (url) setBackground({ type: "image", imageUrl: url })
                    }
                    reader.readAsDataURL(file)
                  }}
                />
              </label>
            </div>
          </div>
        )
      case "text":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">Typography Elements</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleAddText("title")}
                className="w-full text-left p-3 rounded-lg border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900/20 cursor-pointer flex items-center justify-between transition-colors"
              >
                <span className="text-lg font-extrabold text-white">Add Heading</span>
                <Plus className="h-4 w-4 text-zinc-500" />
              </button>
              <button
                onClick={() => handleAddText("subtitle")}
                className="w-full text-left p-3 rounded-lg border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900/20 cursor-pointer flex items-center justify-between transition-colors"
              >
                <span className="text-sm font-semibold text-zinc-300">Add Sub-heading</span>
                <Plus className="h-4 w-4 text-zinc-500" />
              </button>
              <button
                onClick={() => handleAddText("body")}
                className="w-full text-left p-3 rounded-lg border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900/20 cursor-pointer flex items-center justify-between transition-colors"
              >
                <span className="text-xs text-zinc-400">Add paragraph text</span>
                <Plus className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
          </div>
        )
      case "shapes":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">Geometric Shapes</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "rect", label: "Rect", Icon: Square },
                { type: "circle", label: "Circle", Icon: Square },
                { type: "triangle", label: "Triangle", Icon: Square },
                { type: "star", label: "Star", Icon: Star },
                { type: "hexagon", label: "Hexagon", Icon: Hexagon },
              ].map(({ type, label, Icon }) => (
                <button
                  key={type}
                  onClick={() =>
                    handleAddShape(type as "rect" | "circle" | "triangle" | "star" | "hexagon")
                  }
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/20 cursor-pointer transition-all duration-200"
                >
                  <Icon className="h-5 w-5 text-purple-400 mb-1" />
                  <span className="text-[10px] text-zinc-400 font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-full select-none">
      {/* Icon Tab Bar */}
      <div className="w-16 border-r border-zinc-900 bg-zinc-950 flex flex-col items-center py-4 gap-2">
        {sidebarTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-xl cursor-pointer transition-colors relative group ${
                isActive ? "text-purple-400 bg-purple-500/10" : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-label={tab.label}
            >
              <Icon className="h-5 w-5" />
              {tab.id === "layers" && layers.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-3.5 min-w-[14px] px-0.5 rounded-full bg-purple-500 text-[8px] text-white font-bold flex items-center justify-center leading-none">
                  {layers.length > 99 ? "99+" : layers.length}
                </span>
              )}
              {/* Sidebar tooltip hover */}
              <span className="absolute left-16 top-3.5 z-50 scale-0 group-hover:scale-100 rounded bg-zinc-900 px-2 py-1 text-[10px] font-semibold text-white transition-all duration-150 shadow-xl whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Slide-out Drawer Panel */}
      <div className="w-64 border-r border-zinc-900 bg-zinc-950/40 p-4 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  )
}
