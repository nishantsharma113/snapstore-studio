"use client"

import * as React from "react"
import { useEditorStore } from "@/store/editorStore"
import { Layer } from "@/types/project"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Upload,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
} from "lucide-react"
import { AlignMode } from "@/store/editorStore"

export function RightSidebar() {
  const {
    layers,
    selectedIds,
    updateLayer,
    deleteLayer,
    alignLayers,
    distributeLayers,
    copyLayerStyle,
    pasteLayerStyle,
    styleClipboard,
  } = useEditorStore()

  // Get first selected layer
  const activeLayer = React.useMemo(() => {
    if (selectedIds.length === 0) return null
    return layers.find((l) => l.id === selectedIds[0]) || null
  }, [layers, selectedIds])

  if (!activeLayer) {
    return (
      <div className="w-72 border-l border-zinc-900 bg-zinc-950/40 p-5 flex flex-col justify-center items-center text-center select-none">
        <span className="text-zinc-600 text-xs font-semibold uppercase tracking-wider mb-2">
          Properties
        </span>
        <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">
          Select an element on the canvas workspace to inspect its properties.
        </p>
      </div>
    )
  }

  // Multi-select: show alignment panel instead of single-layer properties
  if (selectedIds.length > 1) {
    const alignButtons: { mode: AlignMode; Icon: React.ElementType; label: string }[] = [
      { mode: "left", Icon: AlignHorizontalJustifyStart, label: "Left" },
      { mode: "center-h", Icon: AlignHorizontalJustifyCenter, label: "Center" },
      { mode: "right", Icon: AlignHorizontalJustifyEnd, label: "Right" },
      { mode: "top", Icon: AlignVerticalJustifyStart, label: "Top" },
      { mode: "center-v", Icon: AlignVerticalJustifyCenter, label: "Middle" },
      { mode: "bottom", Icon: AlignVerticalJustifyEnd, label: "Bottom" },
    ]
    return (
      <div className="w-72 border-l border-zinc-900 bg-zinc-950/40 p-5 overflow-y-auto space-y-6 select-none">
        <div className="border-b border-zinc-900 pb-3">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            {selectedIds.length} Layers Selected
          </span>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
            Align
          </span>
          <div className="grid grid-cols-3 gap-2">
            {alignButtons.map(({ mode, Icon, label }) => (
              <button
                key={mode}
                onClick={() => alignLayers(mode)}
                title={label}
                className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg border border-zinc-900 bg-zinc-950/20 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-800 cursor-pointer transition-all"
              >
                <Icon className="h-4 w-4" />
                <span className="text-[9px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedIds.length >= 3 && (
          <div className="space-y-3 pt-2 border-t border-zinc-900/60">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
              Distribute
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => distributeLayers("h")}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg border border-zinc-900 bg-zinc-950/20 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-800 cursor-pointer transition-all"
              >
                <AlignHorizontalDistributeCenter className="h-4 w-4" />
                <span className="text-[9px] font-semibold">Horizontal</span>
              </button>
              <button
                onClick={() => distributeLayers("v")}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg border border-zinc-900 bg-zinc-950/20 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-800 cursor-pointer transition-all"
              >
                <AlignVerticalDistributeCenter className="h-4 w-4" />
                <span className="text-[9px] font-semibold">Vertical</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleDimensionChange = (key: keyof Layer, val: number) => {
    updateLayer(activeLayer.id, { [key]: val })
  }

  const handleTextPropChange = (key: string, val: string | number) => {
    if (!activeLayer.textProps) return
    updateLayer(activeLayer.id, {
      textProps: {
        ...activeLayer.textProps,
        [key]: val,
      },
    })
  }

  const handleShapePropChange = (key: string, val: string | number) => {
    if (!activeLayer.shapeProps) return
    updateLayer(activeLayer.id, {
      shapeProps: {
        ...activeLayer.shapeProps,
        [key]: val,
      },
    })
  }

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeLayer.deviceProps) return

    const frameType = activeLayer.deviceProps.frameType

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        updateLayer(activeLayer.id, {
          deviceProps: {
            frameType,
            screenshotUrl: result,
          },
        })
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="w-72 border-l border-zinc-900 bg-zinc-950/40 p-5 overflow-y-auto space-y-6 select-none">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Properties</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => copyLayerStyle(activeLayer.id)}
            title="Copy style (Ctrl+Shift+C)"
            className="p-1.5 rounded border border-zinc-900 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 cursor-pointer transition-colors text-[9px] font-bold"
          >
            Copy Style
          </button>
          {styleClipboard && (
            <button
              onClick={() => pasteLayerStyle(activeLayer.id)}
              title="Paste style (Ctrl+Shift+V)"
              className="p-1.5 rounded border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 cursor-pointer transition-colors text-[9px] font-bold"
            >
              Paste Style
            </button>
          )}
          <button
            onClick={() => deleteLayer(activeLayer.id)}
            className="p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer transition-colors ml-1"
            aria-label="Delete Layer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Layer Core Metadata */}
      <div className="space-y-1">
        <Label htmlFor="layer-name">Layer Name</Label>
        <Input
          id="layer-name"
          type="text"
          value={activeLayer.name}
          onChange={(e) => updateLayer(activeLayer.id, { name: e.target.value })}
          className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
        />
      </div>

      {/* Lock, Hide Toggles */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => updateLayer(activeLayer.id, { isLocked: !activeLayer.isLocked })}
          className={`flex items-center justify-center gap-1.5 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
            activeLayer.isLocked
              ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
              : "bg-zinc-950/20 border-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          {activeLayer.isLocked ? (
            <>
              <Lock className="h-3.5 w-3.5" /> Locked
            </>
          ) : (
            <>
              <Unlock className="h-3.5 w-3.5" /> Unlocked
            </>
          )}
        </button>
        <button
          onClick={() => updateLayer(activeLayer.id, { isVisible: !activeLayer.isVisible })}
          className={`flex items-center justify-center gap-1.5 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
            !activeLayer.isVisible
              ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
              : "bg-zinc-950/20 border-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          {activeLayer.isVisible ? (
            <>
              <Eye className="h-3.5 w-3.5" /> Visible
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" /> Hidden
            </>
          )}
        </button>
      </div>

      {/* Position & Size */}
      <div className="space-y-3 pt-2 border-t border-zinc-900/60">
        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
          Transform
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="prop-x" className="text-zinc-500 text-[10px]">
              X Position
            </Label>
            <Input
              id="prop-x"
              type="number"
              value={Math.round(activeLayer.x)}
              onChange={(e) => handleDimensionChange("x", Number(e.target.value))}
              className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prop-y" className="text-zinc-500 text-[10px]">
              Y Position
            </Label>
            <Input
              id="prop-y"
              type="number"
              value={Math.round(activeLayer.y)}
              onChange={(e) => handleDimensionChange("y", Number(e.target.value))}
              className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prop-w" className="text-zinc-500 text-[10px]">
              Width (px)
            </Label>
            <Input
              id="prop-w"
              type="number"
              value={Math.round(activeLayer.width)}
              onChange={(e) => handleDimensionChange("width", Number(e.target.value))}
              className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prop-h" className="text-zinc-500 text-[10px]">
              Height (px)
            </Label>
            <Input
              id="prop-h"
              type="number"
              value={Math.round(activeLayer.height)}
              onChange={(e) => handleDimensionChange("height", Number(e.target.value))}
              className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
            />
          </div>
        </div>

        {/* Rotation */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold text-zinc-400">
            <Label htmlFor="prop-rot">Rotation</Label>
            <span>{Math.round(activeLayer.rotation)}°</span>
          </div>
          <input
            id="prop-rot"
            type="range"
            min="0"
            max="360"
            value={activeLayer.rotation}
            onChange={(e) => handleDimensionChange("rotation", Number(e.target.value))}
            className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-zinc-400">
            <Label htmlFor="prop-op">Opacity</Label>
            <span>{Math.round(activeLayer.opacity * 100)}%</span>
          </div>
          <input
            id="prop-op"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={activeLayer.opacity}
            onChange={(e) => handleDimensionChange("opacity", Number(e.target.value))}
            className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>

      {/* Blend Mode */}
      <div className="space-y-2 pt-2 border-t border-zinc-900/60">
        <Label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
          Blend Mode
        </Label>
        <select
          value={activeLayer.blendMode || "source-over"}
          onChange={(e) => updateLayer(activeLayer.id, { blendMode: e.target.value })}
          className="w-full bg-zinc-900/40 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
        >
          <option value="source-over">Normal</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="overlay">Overlay</option>
          <option value="darken">Darken</option>
          <option value="lighten">Lighten</option>
          <option value="color-dodge">Color Dodge</option>
          <option value="color-burn">Color Burn</option>
          <option value="hard-light">Hard Light</option>
          <option value="soft-light">Soft Light</option>
          <option value="difference">Difference</option>
          <option value="exclusion">Exclusion</option>
        </select>
      </div>

      {/* Shadow Properties */}
      {activeLayer.type !== "device" && (
        <div className="space-y-3 pt-3 border-t border-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
              Shadow
            </span>
            <button
              onClick={() =>
                updateLayer(activeLayer.id, {
                  shadowProps: {
                    color: "#000000",
                    blur: 20,
                    offsetX: 0,
                    offsetY: 10,
                    opacity: 0.5,
                    ...(activeLayer.shadowProps || {}),
                    enabled: !activeLayer.shadowProps?.enabled,
                  },
                })
              }
              className={`text-[10px] px-2 py-0.5 rounded border cursor-pointer font-semibold transition-colors ${
                activeLayer.shadowProps?.enabled
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                  : "bg-zinc-950/20 border-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {activeLayer.shadowProps?.enabled ? "On" : "Off"}
            </button>
          </div>

          {activeLayer.shadowProps?.enabled && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Shadow Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={activeLayer.shadowProps.color}
                    onChange={(e) =>
                      updateLayer(activeLayer.id, {
                        shadowProps: { ...activeLayer.shadowProps!, color: e.target.value },
                      })
                    }
                    className="h-8 w-10 border border-zinc-800 bg-transparent rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={activeLayer.shadowProps.color}
                    onChange={(e) =>
                      updateLayer(activeLayer.id, {
                        shadowProps: { ...activeLayer.shadowProps!, color: e.target.value },
                      })
                    }
                    className="flex-1 bg-zinc-900/20 border-zinc-800 text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <Label>Blur</Label>
                  <span>{activeLayer.shadowProps.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={activeLayer.shadowProps.blur}
                  onChange={(e) =>
                    updateLayer(activeLayer.id, {
                      shadowProps: { ...activeLayer.shadowProps!, blur: Number(e.target.value) },
                    })
                  }
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="shadow-ox" className="text-zinc-500 text-[10px]">
                    Offset X
                  </Label>
                  <Input
                    id="shadow-ox"
                    type="number"
                    value={activeLayer.shadowProps.offsetX}
                    onChange={(e) =>
                      updateLayer(activeLayer.id, {
                        shadowProps: {
                          ...activeLayer.shadowProps!,
                          offsetX: Number(e.target.value),
                        },
                      })
                    }
                    className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shadow-oy" className="text-zinc-500 text-[10px]">
                    Offset Y
                  </Label>
                  <Input
                    id="shadow-oy"
                    type="number"
                    value={activeLayer.shadowProps.offsetY}
                    onChange={(e) =>
                      updateLayer(activeLayer.id, {
                        shadowProps: {
                          ...activeLayer.shadowProps!,
                          offsetY: Number(e.target.value),
                        },
                      })
                    }
                    className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <Label>Shadow Opacity</Label>
                  <span>{Math.round((activeLayer.shadowProps.opacity ?? 0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={activeLayer.shadowProps.opacity}
                  onChange={(e) =>
                    updateLayer(activeLayer.id, {
                      shadowProps: { ...activeLayer.shadowProps!, opacity: Number(e.target.value) },
                    })
                  }
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contextual Properties: Text */}
      {activeLayer.type === "text" && activeLayer.textProps && (
        <div className="space-y-4 pt-4 border-t border-zinc-900/60">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
            Text Settings
          </span>

          {/* Edit Text Content */}
          <div className="space-y-1">
            <Label htmlFor="text-content">Content</Label>
            <Input
              id="text-content"
              type="text"
              value={activeLayer.textProps.text}
              onChange={(e) => handleTextPropChange("text", e.target.value)}
              className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
            />
          </div>

          {/* Font Family */}
          <div className="space-y-1">
            <Label htmlFor="text-font">Font Family</Label>
            <select
              id="text-font"
              value={activeLayer.textProps.fontFamily}
              onChange={(e) => handleTextPropChange("fontFamily", e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              {[
                "Inter",
                "Arial",
                "Helvetica",
                "Verdana",
                "Trebuchet MS",
                "Georgia",
                "Times New Roman",
                "Palatino",
                "Garamond",
                "Courier New",
                "Lucida Console",
                "Impact",
                "Comic Sans MS",
              ].map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font size */}
          <div className="space-y-1">
            <Label htmlFor="text-size">Font Size (px)</Label>
            <Input
              id="text-size"
              type="number"
              value={activeLayer.textProps.fontSize}
              onChange={(e) => handleTextPropChange("fontSize", Number(e.target.value))}
              className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
            />
          </div>

          {/* Letter Spacing & Line Height */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="text-ls" className="text-zinc-500 text-[10px]">
                Letter Spacing
              </Label>
              <Input
                id="text-ls"
                type="number"
                step="0.5"
                value={activeLayer.textProps.letterSpacing ?? 0}
                onChange={(e) => handleTextPropChange("letterSpacing", Number(e.target.value))}
                className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="text-lh" className="text-zinc-500 text-[10px]">
                Line Height
              </Label>
              <Input
                id="text-lh"
                type="number"
                step="0.1"
                min="0.5"
                max="5"
                value={activeLayer.textProps.lineHeight ?? 1}
                onChange={(e) => handleTextPropChange("lineHeight", Number(e.target.value))}
                className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
              />
            </div>
          </div>

          {/* Font Color */}
          <div className="space-y-1">
            <Label htmlFor="text-color">Font Color</Label>
            <div className="flex gap-2">
              <input
                id="text-color"
                type="color"
                value={activeLayer.textProps.fill}
                onChange={(e) => handleTextPropChange("fill", e.target.value)}
                className="h-8 w-10 border border-zinc-800 bg-transparent rounded cursor-pointer"
              />
              <Input
                type="text"
                value={activeLayer.textProps.fill}
                onChange={(e) => handleTextPropChange("fill", e.target.value)}
                className="flex-1 bg-zinc-900/20 border-zinc-800 text-xs h-8"
              />
            </div>
          </div>

          {/* Text Stroke */}
          <div className="space-y-1">
            <Label>Stroke / Outline</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={activeLayer.textProps.strokeColor || "#000000"}
                onChange={(e) => handleTextPropChange("strokeColor", e.target.value)}
                className="h-8 w-10 border border-zinc-800 bg-transparent rounded cursor-pointer"
              />
              <Input
                type="number"
                min="0"
                max="20"
                step="0.5"
                placeholder="Width"
                value={activeLayer.textProps.strokeWidth ?? 0}
                onChange={(e) => handleTextPropChange("strokeWidth", Number(e.target.value))}
                className="flex-1 bg-zinc-900/20 border-zinc-800 text-xs h-8"
              />
            </div>
            <p className="text-[9px] text-zinc-600">Color + width (0 = no stroke)</p>
          </div>

          {/* Align & Style toggles */}
          <div className="space-y-1.5">
            <Label>Formatting</Label>
            <div className="flex gap-2">
              {/* Bold */}
              <button
                onClick={() =>
                  handleTextPropChange(
                    "fontStyle",
                    activeLayer.textProps?.fontStyle === "bold" ? "normal" : "bold"
                  )
                }
                className={`p-1.5 rounded border border-zinc-900 cursor-pointer ${
                  activeLayer.textProps.fontStyle === "bold"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Bold className="h-4 w-4" />
              </button>
              {/* Italic */}
              <button
                onClick={() =>
                  handleTextPropChange(
                    "fontStyle",
                    activeLayer.textProps?.fontStyle === "italic" ? "normal" : "italic"
                  )
                }
                className={`p-1.5 rounded border border-zinc-900 cursor-pointer ${
                  activeLayer.textProps.fontStyle === "italic"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Italic className="h-4 w-4" />
              </button>
              <div className="w-[1px] bg-zinc-900 mx-1" />
              {/* Alignments */}
              {[
                { id: "left", icon: AlignLeft },
                { id: "center", icon: AlignCenter },
                { id: "right", icon: AlignRight },
              ].map((align) => {
                const AlignIcon = align.icon
                const isSelected = activeLayer.textProps?.align === align.id
                return (
                  <button
                    key={align.id}
                    onClick={() => handleTextPropChange("align", align.id)}
                    className={`p-1.5 rounded border border-zinc-900 cursor-pointer ${
                      isSelected
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <AlignIcon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Contextual Properties: Shape */}
      {activeLayer.type === "shape" && activeLayer.shapeProps && (
        <div className="space-y-4 pt-4 border-t border-zinc-900/60">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
            Shape Settings
          </span>

          {/* Fill Color */}
          <div className="space-y-1">
            <Label htmlFor="shape-fill">Fill Color</Label>
            <div className="flex gap-2">
              <input
                id="shape-fill"
                type="color"
                value={activeLayer.shapeProps.fill}
                onChange={(e) => handleShapePropChange("fill", e.target.value)}
                className="h-8 w-10 border border-zinc-800 bg-transparent rounded cursor-pointer"
              />
              <Input
                type="text"
                value={activeLayer.shapeProps.fill}
                onChange={(e) => handleShapePropChange("fill", e.target.value)}
                className="flex-1 bg-zinc-900/20 border-zinc-800 text-xs h-8"
              />
            </div>
          </div>

          {/* Stroke Color */}
          <div className="space-y-1">
            <Label htmlFor="shape-stroke">Stroke Color</Label>
            <div className="flex gap-2">
              <input
                id="shape-stroke"
                type="color"
                value={activeLayer.shapeProps.stroke}
                onChange={(e) => handleShapePropChange("stroke", e.target.value)}
                className="h-8 w-10 border border-zinc-800 bg-transparent rounded cursor-pointer"
              />
              <Input
                type="text"
                value={activeLayer.shapeProps.stroke}
                onChange={(e) => handleShapePropChange("stroke", e.target.value)}
                className="flex-1 bg-zinc-900/20 border-zinc-800 text-xs h-8"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div className="space-y-1">
            <Label htmlFor="shape-stroke-w">Stroke Width (px)</Label>
            <Input
              id="shape-stroke-w"
              type="number"
              value={activeLayer.shapeProps.strokeWidth}
              onChange={(e) => handleShapePropChange("strokeWidth", Number(e.target.value))}
              className="bg-zinc-900/20 border-zinc-800 text-xs h-8"
            />
          </div>

          {/* Corner Radius — rect only */}
          {activeLayer.shapeProps.shapeType === "rect" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-400">
                <Label>Corner Radius</Label>
                <span>{activeLayer.shapeProps.cornerRadius ?? 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={activeLayer.shapeProps.cornerRadius ?? 0}
                onChange={(e) => handleShapePropChange("cornerRadius", Number(e.target.value))}
                className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Contextual Properties: Device Mockups */}
      {activeLayer.type === "device" && activeLayer.deviceProps && (
        <div className="space-y-4 pt-4 border-t border-zinc-900/60">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
            Mockup Settings
          </span>
          <div className="space-y-2">
            <Label>App Screenshot</Label>
            <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl p-4 bg-zinc-950/20 hover:border-zinc-700/80 cursor-pointer transition-colors">
              <Upload className="h-5 w-5 text-zinc-500 mb-1" />
              <span className="text-[10px] text-zinc-400 font-semibold">Load Screen Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Contextual Properties: Image Adjustments */}
      {activeLayer.type === "image" && activeLayer.imageProps && (
        <div className="space-y-4 pt-4 border-t border-zinc-900/60">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
            Image Adjustments
          </span>

          {[
            { key: "brightness", label: "Brightness", min: -1, max: 1, step: 0.05 },
            { key: "contrast", label: "Contrast", min: -1, max: 1, step: 0.05 },
            { key: "saturate", label: "Saturation", min: -1, max: 1, step: 0.05 },
          ].map(({ key, label, min, max, step }) => {
            const val = (activeLayer.imageProps?.[key as "brightness" | "contrast" | "saturate"] ??
              0) as number
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <Label>{label}</Label>
                  <span>
                    {val > 0 ? "+" : ""}
                    {Math.round(val * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={val}
                  onChange={(e) =>
                    updateLayer(activeLayer.id, {
                      imageProps: { ...activeLayer.imageProps!, [key]: Number(e.target.value) },
                    })
                  }
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            )
          })}

          {activeLayer.imageProps.brightness ||
          activeLayer.imageProps.contrast ||
          activeLayer.imageProps.saturate ? (
            <button
              onClick={() =>
                updateLayer(activeLayer.id, {
                  imageProps: {
                    ...activeLayer.imageProps!,
                    brightness: 0,
                    contrast: 0,
                    saturate: 0,
                  },
                })
              }
              className="text-[10px] text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
            >
              Reset adjustments
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
