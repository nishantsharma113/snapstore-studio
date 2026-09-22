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

        type PresetKey =
          | "appscreens"
          | "classic"
          | "banner"
          | "minimal"
          | "neon"
          | "light"
          | "ipad"
          | "android_tablet"

        const applyPreset = (preset: PresetKey) => {
          const reset = (
            bg: Parameters<typeof setBackground>[0],
            layerList: Parameters<typeof setLayers>[0]
          ) => {
            const newId = pid()
            setPages([{ id: newId, name: "Page 1", background: bg, layers: layerList }])
            setCurrentPageId(newId)
          }

          if (preset === "appscreens") {
            // Appscreens-style: white bg, bold purple left headline, sparkle deco, phone bottom-left
            reset({ type: "solid", color: "#ffffff" }, [
              {
                ...base,
                id: uid(),
                name: "Sparkle Large",
                type: "text",
                x: 840,
                y: 72,
                width: 200,
                height: 200,
                textProps: {
                  text: "✦",
                  fontSize: 100,
                  fontFamily: "Inter",
                  fontStyle: "bold",
                  fill: "#c4b5fd",
                  align: "left",
                },
              },
              {
                ...base,
                id: uid(),
                name: "Sparkle Small",
                type: "text",
                x: 700,
                y: 36,
                width: 150,
                height: 150,
                textProps: {
                  text: "✦",
                  fontSize: 56,
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fill: "#a78bfa",
                  align: "left",
                },
              },
              {
                ...base,
                id: uid(),
                name: "Main Headline",
                type: "text",
                x: 60,
                y: 80,
                width: 880,
                height: 600,
                textProps: {
                  text: "Learn\nLanguages\nin Minutes",
                  fontSize: 160,
                  fontFamily: "Inter",
                  fontStyle: "bold",
                  fill: "#6d28d9",
                  align: "left",
                },
              },
              {
                ...base,
                id: uid(),
                name: "Sub-caption",
                type: "text",
                x: 60,
                y: 700,
                width: 720,
                height: 100,
                textProps: {
                  text: "Quick sessions fit busy days",
                  fontSize: 52,
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fill: "#7c3aed",
                  align: "left",
                },
              },
              {
                ...base,
                id: uid(),
                name: "iPhone 16 Pro",
                type: "device",
                x: 60,
                y: 840,
                width: 880,
                height: 1800,
                deviceProps: { frameType: "iphone_16" },
              },
            ])
          } else if (preset === "classic") {
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
          } else if (preset === "neon") {
            reset({ type: "solid", color: "#09090b" }, [
              {
                ...base,
                id: uid(),
                name: "Neon Headline",
                type: "text",
                x: cx(1060),
                y: 80,
                width: 1060,
                height: 230,
                textProps: {
                  text: "GLOW UP\nYOUR APP",
                  fontSize: 120,
                  fontFamily: "Inter",
                  fontStyle: "bold",
                  fill: "#c084fc",
                  align: "center",
                },
              },
              {
                ...base,
                id: uid(),
                name: "Sub-caption",
                type: "text",
                x: cx(800),
                y: 320,
                width: 800,
                height: 90,
                textProps: {
                  text: "Electric visuals that demand attention",
                  fontSize: 52,
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fill: "#a78bfa",
                  align: "center",
                },
              },
              {
                ...base,
                id: uid(),
                name: "iPhone 16 Pro",
                type: "device",
                x: cx(960),
                y: 440,
                width: 960,
                height: 1960,
                deviceProps: { frameType: "iphone_16" },
              },
            ])
          } else if (preset === "ipad") {
            // iPad Pro layout — 2048×2732 canvas, landscape-style centered device
            const cxIpad = (w: number) => Math.round((2048 - w) / 2)
            reset(
              {
                type: "gradient",
                gradient: "linear-gradient(160deg, #f8fafc 0%, #e0e7ff 100%)",
              },
              [
                {
                  ...base,
                  id: uid(),
                  name: "App Headline",
                  type: "text",
                  x: cxIpad(1600),
                  y: 100,
                  width: 1600,
                  height: 200,
                  textProps: {
                    text: "Your App. Reimagined.",
                    fontSize: 140,
                    fontFamily: "Inter",
                    fontStyle: "bold",
                    fill: "#1e1b4b",
                    align: "center",
                  },
                },
                {
                  ...base,
                  id: uid(),
                  name: "Subtext",
                  type: "text",
                  x: cxIpad(1400),
                  y: 280,
                  width: 1400,
                  height: 120,
                  textProps: {
                    text: "Stunning on every screen, built for iPad",
                    fontSize: 80,
                    fontFamily: "Inter",
                    fontStyle: "normal",
                    fill: "#4338ca",
                    align: "center",
                  },
                },
                {
                  ...base,
                  id: uid(),
                  name: "iPad Pro 12.9",
                  type: "device",
                  x: cxIpad(1400),
                  y: 440,
                  width: 1400,
                  height: 1960,
                  deviceProps: { frameType: "ipad_pro" },
                },
              ]
            )
          } else if (preset === "android_tablet") {
            // Android Tablet layout — 1600×2560 canvas
            const cxAt = (w: number) => Math.round((1600 - w) / 2)
            reset(
              {
                type: "gradient",
                gradient: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #0c4a6e 100%)",
              },
              [
                {
                  ...base,
                  id: uid(),
                  name: "App Headline",
                  type: "text",
                  x: cxAt(1400),
                  y: 100,
                  width: 1400,
                  height: 200,
                  textProps: {
                    text: "Built for Android",
                    fontSize: 130,
                    fontFamily: "Inter",
                    fontStyle: "bold",
                    fill: "#ffffff",
                    align: "center",
                  },
                },
                {
                  ...base,
                  id: uid(),
                  name: "Subtext",
                  type: "text",
                  x: cxAt(1200),
                  y: 280,
                  width: 1200,
                  height: 110,
                  textProps: {
                    text: "Optimized for Play Store tablet listing",
                    fontSize: 72,
                    fontFamily: "Inter",
                    fontStyle: "normal",
                    fill: "#7dd3fc",
                    align: "center",
                  },
                },
                {
                  ...base,
                  id: uid(),
                  name: "Android Tablet",
                  type: "device",
                  x: cxAt(1200),
                  y: 420,
                  width: 1200,
                  height: 1900,
                  deviceProps: { frameType: "android_tablet" },
                },
              ]
            )
          } else {
            // light
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

        // Mini phone shape used inside thumbnails
        const MiniPhone = ({ dark = true }: { dark?: boolean }) => (
          <div
            className="rounded-[4px] border overflow-hidden flex flex-col"
            style={{
              width: 16,
              height: 30,
              backgroundColor: dark ? "#1c1c2e" : "#e2e8f0",
              borderColor: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
            }}
          >
            <div className="flex justify-center pt-0.5 shrink-0">
              <div
                className="rounded-full"
                style={{ width: 5, height: 1.5, backgroundColor: dark ? "#000" : "#94a3b8" }}
              />
            </div>
            <div
              className="flex-1 mx-0.5 mb-0.5 rounded-[2px]"
              style={{ backgroundColor: dark ? "#2a2a3e" : "#cbd5e1" }}
            />
          </div>
        )

        // Mini tablet shape used inside thumbnails (wider, shorter aspect)
        const MiniTablet = ({ dark = false }: { dark?: boolean }) => (
          <div
            className="rounded-[3px] border overflow-hidden flex flex-col"
            style={{
              width: 38,
              height: 28,
              backgroundColor: dark ? "#1c1c2e" : "#e8eaf6",
              borderColor: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
            }}
          >
            <div className="flex justify-center pt-0.5 shrink-0">
              <div
                className="rounded-full"
                style={{ width: 6, height: 1.5, backgroundColor: dark ? "#000" : "#94a3b8" }}
              />
            </div>
            <div
              className="flex-1 mx-0.5 mb-0.5 rounded-[2px]"
              style={{ backgroundColor: dark ? "#1e3a5f" : "#c7d2fe" }}
            />
          </div>
        )

        const presetDefs: Array<{
          key: PresetKey
          label: string
          desc: string
          isNew?: boolean
          isTablet?: boolean
          thumbnail: React.ReactNode
        }> = [
          {
            key: "appscreens",
            label: "Appscreens Style",
            desc: "White bg · bold purple left headline · phone bottom-left",
            isNew: true,
            thumbnail: (
              <div className="relative w-full h-24 overflow-hidden rounded-t-xl bg-white">
                {/* Sparkle decoration */}
                <span
                  className="absolute text-purple-300 font-black select-none"
                  style={{ top: 6, left: 90, fontSize: 14, lineHeight: 1 }}
                >
                  ✦
                </span>
                <span
                  className="absolute text-purple-200 font-black select-none"
                  style={{ top: 3, left: 76, fontSize: 8, lineHeight: 1 }}
                >
                  ✦
                </span>
                {/* Left headline text bars */}
                <div className="absolute flex flex-col gap-1" style={{ top: 10, left: 10 }}>
                  <div
                    className="rounded-sm"
                    style={{ width: 54, height: 7, backgroundColor: "#6d28d9" }}
                  />
                  <div
                    className="rounded-sm"
                    style={{ width: 46, height: 7, backgroundColor: "#6d28d9" }}
                  />
                  <div
                    className="rounded-sm"
                    style={{ width: 50, height: 7, backgroundColor: "#6d28d9" }}
                  />
                  <div
                    className="mt-1 rounded-sm"
                    style={{ width: 38, height: 4, backgroundColor: "#a78bfa" }}
                  />
                </div>
                {/* Phone bottom-left */}
                <div className="absolute" style={{ bottom: 0, left: 10 }}>
                  <MiniPhone dark={false} />
                </div>
                {/* Right fade area */}
                <div
                  className="absolute inset-y-0 right-0 w-8"
                  style={{
                    background: "linear-gradient(to right, transparent, rgba(240,240,255,0.6))",
                  }}
                />
              </div>
            ),
          },
          {
            key: "classic",
            label: "Split Screen Classic",
            desc: "Dark bg · centered device · bold white header",
            thumbnail: (
              <div className="relative w-full h-24 overflow-hidden rounded-t-xl bg-zinc-950">
                {/* Centered top text bars */}
                <div
                  className="absolute flex flex-col gap-1 items-center"
                  style={{ top: 10, left: "50%", transform: "translateX(-50%)" }}
                >
                  <div
                    className="rounded-sm"
                    style={{ width: 60, height: 6, backgroundColor: "rgba(255,255,255,0.85)" }}
                  />
                  <div
                    className="rounded-sm"
                    style={{ width: 44, height: 4, backgroundColor: "rgba(161,161,170,0.6)" }}
                  />
                </div>
                {/* Centered phone */}
                <div
                  className="absolute"
                  style={{ bottom: 0, left: "50%", transform: "translateX(-50%)" }}
                >
                  <MiniPhone dark />
                </div>
              </div>
            ),
          },
          {
            key: "banner",
            label: "Marketing Banner",
            desc: "Gradient bg · centered device · feature badge",
            thumbnail: (
              <div
                className="relative w-full h-24 overflow-hidden rounded-t-xl"
                style={{
                  background: "linear-gradient(160deg, #7c3aed 0%, #4f46e5 55%, #0ea5e9 100%)",
                }}
              >
                {/* Phone top-center */}
                <div
                  className="absolute"
                  style={{ top: 4, left: "50%", transform: "translateX(-50%)" }}
                >
                  <MiniPhone dark />
                </div>
                {/* Bottom badge strip */}
                <div
                  className="absolute flex flex-col gap-0.5 items-center"
                  style={{ bottom: 8, left: "50%", transform: "translateX(-50%)" }}
                >
                  <div
                    className="rounded-full"
                    style={{ width: 50, height: 4, backgroundColor: "#fde68a" }}
                  />
                  <div
                    className="rounded-full"
                    style={{ width: 40, height: 3, backgroundColor: "rgba(255,255,255,0.6)" }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "minimal",
            label: "Showcase Minimal",
            desc: "Light bg · elegant dark text · centered device",
            thumbnail: (
              <div className="relative w-full h-24 overflow-hidden rounded-t-xl bg-slate-50">
                {/* Centered top text */}
                <div
                  className="absolute flex flex-col gap-1 items-center"
                  style={{ top: 10, left: "50%", transform: "translateX(-50%)" }}
                >
                  <div
                    className="rounded-sm"
                    style={{ width: 62, height: 6, backgroundColor: "#0f172a" }}
                  />
                  <div
                    className="rounded-sm"
                    style={{ width: 48, height: 4, backgroundColor: "#64748b" }}
                  />
                </div>
                {/* Centered phone */}
                <div
                  className="absolute"
                  style={{ bottom: 0, left: "50%", transform: "translateX(-50%)" }}
                >
                  <MiniPhone dark={false} />
                </div>
              </div>
            ),
          },
          {
            key: "neon",
            label: "Neon Glow",
            desc: "Dark bg · neon purple headline · centered device",
            isNew: true,
            thumbnail: (
              <div className="relative w-full h-24 overflow-hidden rounded-t-xl bg-zinc-950">
                {/* Subtle glow blob */}
                <div
                  className="absolute rounded-full blur-xl opacity-30"
                  style={{
                    width: 60,
                    height: 30,
                    top: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#a855f7",
                  }}
                />
                {/* Neon text bars */}
                <div
                  className="absolute flex flex-col gap-1 items-center"
                  style={{ top: 8, left: "50%", transform: "translateX(-50%)" }}
                >
                  <div
                    className="rounded-sm"
                    style={{ width: 64, height: 7, backgroundColor: "#c084fc" }}
                  />
                  <div
                    className="rounded-sm"
                    style={{ width: 52, height: 7, backgroundColor: "#c084fc" }}
                  />
                  <div
                    className="mt-0.5 rounded-sm"
                    style={{ width: 46, height: 4, backgroundColor: "#a78bfa" }}
                  />
                </div>
                {/* Centered phone */}
                <div
                  className="absolute"
                  style={{ bottom: 0, left: "50%", transform: "translateX(-50%)" }}
                >
                  <MiniPhone dark />
                </div>
              </div>
            ),
          },
          {
            key: "light",
            label: "App Showcase Light",
            desc: "Sky blue bg · bold header · iPhone frame",
            thumbnail: (
              <div
                className="relative w-full h-24 overflow-hidden rounded-t-xl"
                style={{ backgroundColor: "#cae8fb" }}
              >
                {/* Centered text */}
                <div
                  className="absolute flex flex-col gap-1 items-center"
                  style={{ top: 10, left: "50%", transform: "translateX(-50%)" }}
                >
                  <div
                    className="rounded-sm"
                    style={{ width: 60, height: 6, backgroundColor: "#0f172a" }}
                  />
                  <div
                    className="rounded-sm"
                    style={{ width: 44, height: 4, backgroundColor: "rgba(15,23,42,0.4)" }}
                  />
                </div>
                {/* Centered phone */}
                <div
                  className="absolute"
                  style={{ bottom: 0, left: "50%", transform: "translateX(-50%)" }}
                >
                  <MiniPhone dark={false} />
                </div>
              </div>
            ),
          },
          // ── Tablet Presets ────────────────────────────────────────────
          {
            key: "ipad",
            label: "iPad Pro Layout",
            desc: "2048×2732 · indigo gradient bg · bold centered headline",
            isTablet: true,
            thumbnail: (
              <div
                className="relative w-full h-24 overflow-hidden rounded-t-xl"
                style={{
                  background: "linear-gradient(160deg, #f8fafc 0%, #e0e7ff 100%)",
                }}
              >
                {/* Centered text bars */}
                <div
                  className="absolute flex flex-col gap-1 items-center"
                  style={{ top: 8, left: "50%", transform: "translateX(-50%)" }}
                >
                  <div
                    className="rounded-sm"
                    style={{ width: 70, height: 6, backgroundColor: "#1e1b4b" }}
                  />
                  <div
                    className="rounded-sm"
                    style={{ width: 52, height: 4, backgroundColor: "#4338ca" }}
                  />
                </div>
                {/* Centered tablet frame */}
                <div
                  className="absolute"
                  style={{ bottom: 6, left: "50%", transform: "translateX(-50%)" }}
                >
                  <MiniTablet dark={false} />
                </div>
              </div>
            ),
          },
          {
            key: "android_tablet",
            label: "Android Tablet Layout",
            desc: "1600×2560 · Play Store ready · dark navy gradient",
            isTablet: true,
            thumbnail: (
              <div
                className="relative w-full h-24 overflow-hidden rounded-t-xl"
                style={{
                  background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #0c4a6e 100%)",
                }}
              >
                {/* Centered text bars */}
                <div
                  className="absolute flex flex-col gap-1 items-center"
                  style={{ top: 8, left: "50%", transform: "translateX(-50%)" }}
                >
                  <div
                    className="rounded-sm"
                    style={{ width: 68, height: 6, backgroundColor: "rgba(255,255,255,0.9)" }}
                  />
                  <div
                    className="rounded-sm"
                    style={{ width: 50, height: 4, backgroundColor: "#7dd3fc" }}
                  />
                </div>
                {/* Centered tablet frame */}
                <div
                  className="absolute"
                  style={{ bottom: 6, left: "50%", transform: "translateX(-50%)" }}
                >
                  <MiniTablet dark />
                </div>
              </div>
            ),
          },
        ]

        const phonePresets = presetDefs.filter((p) => !p.isTablet)
        const tabletPresets = presetDefs.filter((p) => p.isTablet)

        const PresetCard = (p: (typeof presetDefs)[number]) => (
          <button
            key={p.key}
            onClick={() => applyPreset(p.key)}
            className="group text-left rounded-xl border border-zinc-800/60 bg-zinc-900/20 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer transition-all duration-200 overflow-hidden hover:shadow-lg hover:shadow-purple-500/5"
          >
            {p.thumbnail}
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-zinc-800/40">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors truncate">
                    {p.label}
                  </span>
                  {p.isNew && (
                    <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/25">
                      New
                    </span>
                  )}
                  {p.isTablet && (
                    <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25">
                      Tablet
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-zinc-600 group-hover:text-zinc-500 leading-relaxed block truncate">
                  {p.desc}
                </span>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="shrink-0 text-zinc-700 group-hover:text-purple-400 transition-colors"
              >
                <path
                  d="M3 7h8M8 4l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        )

        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Layout Presets</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                Click a preset to populate the canvas with a starter layout.
              </p>
            </div>

            {/* Phone layouts */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                  📱 Phone
                </span>
                <div className="flex-1 h-px bg-zinc-800/60" />
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {phonePresets.map((p) => (
                  <React.Fragment key={p.key}>{PresetCard(p)}</React.Fragment>
                ))}
              </div>
            </div>

            {/* Tablet layouts */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                  🪟 Tablet
                </span>
                <div className="flex-1 h-px bg-zinc-800/60" />
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {tabletPresets.map((p) => (
                  <React.Fragment key={p.key}>{PresetCard(p)}</React.Fragment>
                ))}
              </div>
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
