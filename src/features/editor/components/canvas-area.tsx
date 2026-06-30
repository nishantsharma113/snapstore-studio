"use client"

import * as React from "react"
import { useEditorStore } from "@/store/editorStore"
import { Page, Layer as StoreLayer, CanvasBackground } from "@/types/project"
import {
  Stage,
  Layer as KonvaLayer,
  Rect,
  Circle,
  Text,
  Image as KonvaImage,
  Transformer,
  Group,
  Line,
  Star,
  RegularPolygon,
} from "react-konva"
import Konva from "konva"

const SNAP_THRESHOLD_PX = 6 // screen pixels

interface GuideLines {
  vLines: number[]
  hLines: number[]
}

// Inline image component — handles cross-origin, load/error, and CSS image filters
const CanvasImage = ({
  src,
  width,
  height,
  imageFilters,
  ...props
}: {
  src: string
  width: number
  height: number
  imageFilters?: { brightness?: number; contrast?: number; saturate?: number }
  [key: string]: unknown
}) => {
  const [image, setImage] = React.useState<HTMLImageElement | HTMLCanvasElement | null>(null)
  const [failed, setFailed] = React.useState(false)
  const { brightness = 0, contrast = 0, saturate = 0 } = imageFilters || {}

  React.useEffect(() => {
    if (!src) return
    setFailed(false)
    setImage(null)
    const img = new window.Image()
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous"
    img.src = src
    img.onload = () => {
      if (!brightness && !contrast && !saturate) {
        setImage(img)
        return
      }
      const offscreen = document.createElement("canvas")
      offscreen.width = img.naturalWidth
      offscreen.height = img.naturalHeight
      const ctx = offscreen.getContext("2d")
      if (!ctx) {
        setImage(img)
        return
      }
      const parts: string[] = []
      if (brightness) parts.push(`brightness(${(1 + brightness) * 100}%)`)
      if (contrast) parts.push(`contrast(${(1 + contrast) * 100}%)`)
      if (saturate) parts.push(`saturate(${(1 + saturate) * 100}%)`)
      ctx.filter = parts.join(" ")
      ctx.drawImage(img, 0, 0)
      setImage(offscreen as unknown as HTMLImageElement)
    }
    img.onerror = () => setFailed(true)
     
  }, [src, brightness, contrast, saturate])

  if (!image || failed) {
    return (
      <Rect
        width={width}
        height={height}
        fill="#27272a"
        stroke="#3f3f46"
        strokeWidth={2}
        dash={[8, 6]}
        opacity={0.6}
        {...props}
      />
    )
  }

  return <KonvaImage image={image as HTMLImageElement} width={width} height={height} {...props} />
}

// Off-screen canvas grain texture for "noise" backgrounds
const NoiseBackground = ({
  width,
  height,
  color,
}: {
  width: number
  height: number
  color: string
}) => {
  const [grainImg, setGrainImg] = React.useState<HTMLCanvasElement | null>(null)
  React.useEffect(() => {
    const size = 512
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const imgData = ctx.createImageData(size, size)
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255)
      imgData.data[i] = v
      imgData.data[i + 1] = v
      imgData.data[i + 2] = v
      imgData.data[i + 3] = Math.floor(Math.random() * 45)
    }
    ctx.putImageData(imgData, 0, 0)
    setGrainImg(canvas)
  }, [])
  return (
    <Group name="canvas-bg">
      <Rect width={width} height={height} fill={color || "#09090b"} />
      {grainImg && (
        <KonvaImage
          image={grainImg as unknown as HTMLImageElement}
          width={width}
          height={height}
          opacity={0.3}
        />
      )}
    </Group>
  )
}

export function CanvasArea() {
  const {
    canvasWidth,
    canvasHeight,
    pages,
    currentPageId,
    setCurrentPageId,
    selectedIds,
    setSelectedIds,
    updateLayer,
    zoom,
    panX,
    panY,
    setZoom,
    setPan,
    setExportCallback,
    setThumbnailCallback,
    copyLayerStyle,
    pasteLayerStyle,
  } = useEditorStore()

  const stageRef = React.useRef<Konva.Stage>(null)
  const transformerRef = React.useRef<Konva.Transformer>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const [stageSize, setStageSize] = React.useState({ width: 800, height: 600 })
  const [guides, setGuides] = React.useState<GuideLines>({ vLines: [], hLines: [] })

  // Space+drag pan refs
  const isSpaceHeldRef = React.useRef(false)
  const isPanningRef = React.useRef(false)
  const lastPanPosRef = React.useRef({ x: 0, y: 0 })
  const [panCursor, setPanCursor] = React.useState<"default" | "grab" | "grabbing">("default")

  const gap = 80
  const totalWidth = pages.length * canvasWidth + (pages.length - 1) * gap

  // --- Resize observer ---
  React.useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: Math.max(200, window.innerWidth - 320 - 256),
        height: Math.max(200, window.innerHeight - 56),
      })
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // --- Space key → pan mode ---
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      )
        return
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault()
        isSpaceHeldRef.current = true
        setPanCursor("grab")
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpaceHeldRef.current = false
        isPanningRef.current = false
        setPanCursor("default")
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  // --- Ctrl+Scroll wheel zoom ---
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const scaleBy = 1.08
      const { zoom: current } = useEditorStore.getState()
      const next = e.deltaY < 0 ? Math.min(current * scaleBy, 3) : Math.max(current / scaleBy, 0.05)
      setZoom(next)
    }
    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [setZoom])

  // --- Clear guides on page switch ---
  React.useEffect(() => {
    setGuides({ vLines: [], hLines: [] })
  }, [currentPageId])

  // --- Export callback ---
  React.useEffect(() => {
    setExportCallback(async (format, scale, target) => {
      const stage = stageRef.current
      if (!stage) return

      const runExport = async (pageIndex: number, pageName: string) => {
        const oldScaleX = stage.scaleX()
        const oldScaleY = stage.scaleY()
        const oldX = stage.x()
        const oldY = stage.y()

        stage.scaleX(1)
        stage.scaleY(1)
        stage.x(0)
        stage.y(0)

        // For transparent PNG: hide all background nodes before capture
        const isTransparent = format === "transparent"
        let bgNodes: Konva.Node[] = []
        if (isTransparent) {
          bgNodes = stage.find(".canvas-bg") as Konva.Node[]
          bgNodes.forEach((n) => n.hide())
        }

        stage.batchDraw()

        const x = pageIndex * (canvasWidth + gap)

        if (format === "pdf") {
          const { default: jsPDF } = await import("jspdf")
          const dataUrl = stage.toDataURL({
            x,
            y: 0,
            width: canvasWidth,
            height: canvasHeight,
            pixelRatio: scale,
            mimeType: "image/png",
          })
          const pdf = new jsPDF({
            orientation: canvasWidth > canvasHeight ? "landscape" : "portrait",
            unit: "px",
            format: [canvasWidth * scale, canvasHeight * scale],
            hotfixes: ["px_scaling"],
          })
          pdf.addImage(dataUrl, "PNG", 0, 0, canvasWidth * scale, canvasHeight * scale)
          pdf.save(`${pageName.toLowerCase().replace(/\s+/g, "_")}_${scale}x.pdf`)
        } else {
          const mimeType = format === "jpeg" ? "image/jpeg" : "image/png"
          const ext = format === "transparent" ? "png" : format
          const suffix = format === "transparent" ? `${scale}x_transparent` : `${scale}x`
          const dataUrl = stage.toDataURL({
            x,
            y: 0,
            width: canvasWidth,
            height: canvasHeight,
            pixelRatio: scale,
            mimeType,
          })
          const link = document.createElement("a")
          link.download = `${pageName.toLowerCase().replace(/\s+/g, "_")}_${suffix}.${ext}`
          link.href = dataUrl
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

        // Restore background and stage transform
        if (isTransparent) bgNodes.forEach((n) => n.show())
        stage.scaleX(oldScaleX)
        stage.scaleY(oldScaleY)
        stage.x(oldX)
        stage.y(oldY)
        stage.batchDraw()
      }

      if (target === "active") {
        const activeIndex = pages.findIndex((p) => p.id === currentPageId)
        if (activeIndex !== -1) await runExport(activeIndex, pages[activeIndex].name)
      } else {
        for (let i = 0; i < pages.length; i++) {
          await runExport(i, pages[i].name)
          await new Promise((resolve) => setTimeout(resolve, 350))
        }
      }
    })
    return () => setExportCallback(null)
  }, [setExportCallback, pages, currentPageId, canvasWidth, canvasHeight])

  // --- Thumbnail callback (used by autosave to capture a preview) ---
  React.useEffect(() => {
    setThumbnailCallback(() => {
      const stage = stageRef.current
      if (!stage) return null
      const activeIndex = pages.findIndex((p) => p.id === currentPageId)
      if (activeIndex === -1) return null

      const oldScaleX = stage.scaleX()
      const oldScaleY = stage.scaleY()
      const oldX = stage.x()
      const oldY = stage.y()

      stage.scaleX(1)
      stage.scaleY(1)
      stage.x(0)
      stage.y(0)
      stage.batchDraw()

      try {
        const targetWidth = 240
        return stage.toDataURL({
          x: activeIndex * (canvasWidth + gap),
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          pixelRatio: targetWidth / canvasWidth,
          mimeType: "image/jpeg",
        })
      } catch {
        return null
      } finally {
        stage.scaleX(oldScaleX)
        stage.scaleY(oldScaleY)
        stage.x(oldX)
        stage.y(oldY)
        stage.batchDraw()
      }
    })
    return () => setThumbnailCallback(null)
  }, [setThumbnailCallback, pages, currentPageId, canvasWidth, canvasHeight])

  // --- Sync transformer to selected nodes ---
  React.useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return
    const transformer = transformerRef.current

    if (selectedIds.length === 0) {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
      return
    }

    const nodes = selectedIds
      .map((id) => stageRef.current!.findOne(`#${id}`))
      .filter((n): n is Konva.Node => !!n)

    transformer.nodes(nodes)
    transformer.getLayer()?.batchDraw()
  }, [selectedIds, pages])

  // --- Snap computation ---
  const computeSnap = React.useCallback(
    (node: Konva.Node): { x: number | null; y: number | null; guides: GuideLines } => {
      const threshold = SNAP_THRESHOLD_PX / zoom

      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      const nodeLeft = node.x()
      const nodeTop = node.y()
      const nodeRight = nodeLeft + node.width() * scaleX
      const nodeBottom = nodeTop + node.height() * scaleY
      const nodeCenterX = (nodeLeft + nodeRight) / 2
      const nodeCenterY = (nodeTop + nodeBottom) / 2

      // Snap targets: canvas edges & center + sibling layers
      const xTargets: number[] = [0, canvasWidth / 2, canvasWidth]
      const yTargets: number[] = [0, canvasHeight / 2, canvasHeight]

      const { pages: ps, currentPageId: pid } = useEditorStore.getState()
      const activePage = ps.find((p) => p.id === pid)
      if (activePage) {
        activePage.layers
          .filter((l) => l.id !== node.id() && l.isVisible)
          .forEach((l) => {
            xTargets.push(l.x, l.x + l.width / 2, l.x + l.width)
            yTargets.push(l.y, l.y + l.height / 2, l.y + l.height)
          })
      }

      const nodeXEdges = [nodeLeft, nodeCenterX, nodeRight]
      let bestDx: number | null = null
      const vLines: number[] = []

      for (const target of xTargets) {
        for (const edge of nodeXEdges) {
          const dx = target - edge
          if (Math.abs(dx) < threshold) {
            if (bestDx === null || Math.abs(dx) < Math.abs(bestDx)) {
              bestDx = dx
              vLines.length = 0
              vLines.push(target)
            } else if (Math.abs(dx) === Math.abs(bestDx)) {
              vLines.push(target)
            }
          }
        }
      }

      const nodeYEdges = [nodeTop, nodeCenterY, nodeBottom]
      let bestDy: number | null = null
      const hLines: number[] = []

      for (const target of yTargets) {
        for (const edge of nodeYEdges) {
          const dy = target - edge
          if (Math.abs(dy) < threshold) {
            if (bestDy === null || Math.abs(dy) < Math.abs(bestDy)) {
              bestDy = dy
              hLines.length = 0
              hLines.push(target)
            } else if (Math.abs(dy) === Math.abs(bestDy)) {
              hLines.push(target)
            }
          }
        }
      }

      return {
        x: bestDx !== null ? nodeLeft + bestDx : null,
        y: bestDy !== null ? nodeTop + bestDy : null,
        guides: { vLines, hLines },
      }
    },
    [zoom, canvasWidth, canvasHeight]
  )

  // --- Drag handlers ---
  const handleDragMove = React.useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target
      const snap = computeSnap(node)
      if (snap.x !== null) node.x(snap.x)
      if (snap.y !== null) node.y(snap.y)
      setGuides(snap.guides)
    },
    [computeSnap]
  )

  const handleDragEnd = React.useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target
      updateLayer(node.id(), { x: node.x(), y: node.y() })
      setGuides({ vLines: [], hLines: [] })
    },
    [updateLayer]
  )

  const handleTransformEnd = React.useCallback(
    (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      node.scaleX(1)
      node.scaleY(1)
      updateLayer(node.id(), {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      })
    },
    [updateLayer]
  )

  // --- Stage background click → deselect ---
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (isSpaceHeldRef.current) return
    if (e.target === e.target.getStage() || e.target.name() === "stage-bg") {
      setSelectedIds([])
    }
  }

  // --- Container mouse handlers for space+drag pan ---
  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSpaceHeldRef.current) return
    isPanningRef.current = true
    lastPanPosRef.current = { x: e.clientX, y: e.clientY }
    setPanCursor("grabbing")
    e.preventDefault()
  }

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return
    const dx = e.clientX - lastPanPosRef.current.x
    const dy = e.clientY - lastPanPosRef.current.y
    lastPanPosRef.current = { x: e.clientX, y: e.clientY }
    const { panX: px, panY: py } = useEditorStore.getState()
    setPan(px + dx, py + dy)
  }

  const handleContainerMouseUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false
      setPanCursor(isSpaceHeldRef.current ? "grab" : "default")
    }
  }

  // --- Render helpers ---
  const renderBackground = (bg: CanvasBackground) => {
    if (bg.type === "solid") {
      return (
        <Rect
          name="canvas-bg"
          width={canvasWidth}
          height={canvasHeight}
          fill={bg.color || "#09090b"}
        />
      )
    }

    if (bg.type === "gradient") {
      let stops: (string | number)[] = [0, "#7c3aed", 1, "#4f46e5"]
      if (bg.gradient?.includes("#ec4899")) stops = [0, "#ec4899", 0.5, "#f43f5e", 1, "#f59e0b"]
      else if (bg.gradient?.includes("#059669"))
        stops = [0, "#059669", 0.5, "#10b981", 1, "#6ee7b7"]
      else if (bg.gradient?.includes("#1e293b")) stops = [0, "#1e293b", 1, "#0f172a"]

      return (
        <Rect
          name="canvas-bg"
          width={canvasWidth}
          height={canvasHeight}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: canvasHeight }}
          fillLinearGradientColorStops={stops}
        />
      )
    }

    if (bg.type === "image" && bg.imageUrl) {
      return (
        <CanvasImage
          name="canvas-bg"
          x={0}
          y={0}
          src={bg.imageUrl}
          width={canvasWidth}
          height={canvasHeight}
        />
      )
    }

    if (bg.type === "blur" && bg.imageUrl) {
      return (
        <Group name="canvas-bg">
          <CanvasImage
            x={0}
            y={0}
            src={bg.imageUrl}
            width={canvasWidth}
            height={canvasHeight}
            opacity={0.5}
          />
          <Rect
            width={canvasWidth}
            height={canvasHeight}
            fill={bg.color || "#09090b"}
            opacity={0.55}
          />
        </Group>
      )
    }

    if (bg.type === "glass") {
      return (
        <Group name="canvas-bg">
          <Rect width={canvasWidth} height={canvasHeight} fill={bg.color || "#09090b"} />
          <Rect
            width={canvasWidth}
            height={canvasHeight}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: canvasWidth, y: canvasHeight }}
            fillLinearGradientColorStops={[
              0,
              "rgba(255,255,255,0.07)",
              1,
              "rgba(255,255,255,0.02)",
            ]}
          />
        </Group>
      )
    }

    if (bg.type === "pattern") {
      const dotSpacing = 60
      const dots: React.ReactElement[] = []
      for (let x = 0; x < canvasWidth; x += dotSpacing) {
        for (let y = 0; y < canvasHeight; y += dotSpacing) {
          dots.push(
            <Circle key={`d-${x}-${y}`} x={x} y={y} radius={2} fill="rgba(255,255,255,0.12)" />
          )
        }
      }
      return (
        <Group name="canvas-bg">
          <Rect width={canvasWidth} height={canvasHeight} fill={bg.color || "#09090b"} />
          {dots}
        </Group>
      )
    }

    if (bg.type === "noise") {
      return (
        <NoiseBackground width={canvasWidth} height={canvasHeight} color={bg.color || "#09090b"} />
      )
    }

    return (
      <Rect
        name="canvas-bg"
        width={canvasWidth}
        height={canvasHeight}
        fill={bg.color || "#09090b"}
      />
    )
  }

  const renderLayerElement = (l: StoreLayer, pageId: string) => {
    if (!l.isVisible) return null

    const shadowAttribs = l.shadowProps?.enabled
      ? {
          shadowColor: l.shadowProps.color,
          shadowBlur: l.shadowProps.blur,
          shadowOffsetX: l.shadowProps.offsetX,
          shadowOffsetY: l.shadowProps.offsetY,
          shadowOpacity: l.shadowProps.opacity,
        }
      : {}

    const commonProps = {
      id: l.id,
      x: l.x,
      y: l.y,
      rotation: l.rotation,
      opacity: l.opacity,
      draggable: !l.isLocked,
      globalCompositeOperation: (l.blendMode || "source-over") as GlobalCompositeOperation,
      onClick: () => {
        setSelectedIds([l.id])
        setCurrentPageId(pageId)
      },
      onTap: () => {
        setSelectedIds([l.id])
        setCurrentPageId(pageId)
      },
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
      ...shadowAttribs,
    }

    switch (l.type) {
      case "text":
        if (!l.textProps) return null
        return (
          <Text
            key={l.id}
            {...commonProps}
            text={l.textProps.text}
            fontSize={l.textProps.fontSize}
            fontFamily={l.textProps.fontFamily}
            fontStyle={l.textProps.fontStyle}
            fill={l.textProps.fill}
            align={l.textProps.align}
            width={l.width}
            height={l.height}
            letterSpacing={l.textProps.letterSpacing ?? 0}
            lineHeight={l.textProps.lineHeight ?? 1}
            stroke={l.textProps.strokeColor || ""}
            strokeWidth={l.textProps.strokeWidth ?? 0}
          />
        )

      case "shape": {
        if (!l.shapeProps) return null
        if (l.shapeProps.shapeType === "circle") {
          return (
            <Circle
              key={l.id}
              {...commonProps}
              radius={l.width / 2}
              fill={l.shapeProps.fill}
              stroke={l.shapeProps.stroke}
              strokeWidth={l.shapeProps.strokeWidth}
            />
          )
        }
        if (l.shapeProps.shapeType === "triangle") {
          return (
            <Line
              key={l.id}
              {...commonProps}
              points={[l.width / 2, 0, l.width, l.height, 0, l.height]}
              closed
              fill={l.shapeProps.fill}
              stroke={l.shapeProps.stroke}
              strokeWidth={l.shapeProps.strokeWidth}
            />
          )
        }
        if (l.shapeProps.shapeType === "star") {
          return (
            <Star
              key={l.id}
              {...commonProps}
              numPoints={5}
              outerRadius={l.width / 2}
              innerRadius={l.width * 0.2}
              fill={l.shapeProps.fill}
              stroke={l.shapeProps.stroke}
              strokeWidth={l.shapeProps.strokeWidth}
            />
          )
        }
        if (l.shapeProps.shapeType === "hexagon") {
          return (
            <RegularPolygon
              key={l.id}
              {...commonProps}
              sides={6}
              radius={l.width / 2}
              fill={l.shapeProps.fill}
              stroke={l.shapeProps.stroke}
              strokeWidth={l.shapeProps.strokeWidth}
            />
          )
        }
        return (
          <Rect
            key={l.id}
            {...commonProps}
            width={l.width}
            height={l.height}
            fill={l.shapeProps.fill}
            stroke={l.shapeProps.stroke}
            strokeWidth={l.shapeProps.strokeWidth}
            cornerRadius={l.shapeProps.cornerRadius ?? 0}
          />
        )
      }

      case "image":
        if (!l.imageProps?.src) return null
        return (
          <CanvasImage
            key={l.id}
            {...commonProps}
            src={l.imageProps.src}
            width={l.width}
            height={l.height}
            imageFilters={{
              brightness: l.imageProps.brightness,
              contrast: l.imageProps.contrast,
              saturate: l.imageProps.saturate,
            }}
          />
        )

      case "device": {
        if (!l.deviceProps) return null
        const { frameType, screenshotUrl } = l.deviceProps
        const w = l.width
        const h = l.height

        const screenPlaceholder = !screenshotUrl ? (
          <Text
            x={w * 0.05}
            y={h * 0.5 - h * 0.04}
            width={w * 0.9}
            text="Drop screenshot here"
            fontSize={w * 0.038}
            fontFamily="Inter"
            fill="#3a3a3c"
            align="center"
          />
        ) : null

        if (frameType === "iphone_16") {
          const sx = w * 0.037
          const sy = w * 0.037
          const sw = w * 0.926
          const sh = h - w * 0.074
          return (
            <Group key={l.id} {...commonProps}>
              <Rect
                width={w}
                height={h}
                fill="#1c1c1e"
                cornerRadius={w * 0.115}
                stroke="#5a5a5c"
                strokeWidth={w * 0.012}
              />
              <Rect x={sx} y={sy} width={sw} height={sh} fill="#000" cornerRadius={w * 0.085} />
              {screenshotUrl && (
                <CanvasImage
                  x={sx}
                  y={sy}
                  width={sw}
                  height={sh}
                  src={screenshotUrl}
                  cornerRadius={w * 0.085}
                />
              )}
              {screenPlaceholder}
              {/* Dynamic Island */}
              <Rect
                x={w * 0.36}
                y={w * 0.055}
                width={w * 0.28}
                height={w * 0.047}
                fill="#000"
                cornerRadius={w * 0.023}
              />
              {/* Action button */}
              <Rect
                x={-w * 0.014}
                y={h * 0.195}
                width={w * 0.014}
                height={h * 0.038}
                fill="#48484a"
                cornerRadius={w * 0.006}
              />
              {/* Volume up / down */}
              <Rect
                x={-w * 0.014}
                y={h * 0.255}
                width={w * 0.014}
                height={h * 0.068}
                fill="#48484a"
                cornerRadius={w * 0.006}
              />
              <Rect
                x={-w * 0.014}
                y={h * 0.335}
                width={w * 0.014}
                height={h * 0.068}
                fill="#48484a"
                cornerRadius={w * 0.006}
              />
              {/* Power/side button */}
              <Rect
                x={w}
                y={h * 0.275}
                width={w * 0.014}
                height={h * 0.115}
                fill="#48484a"
                cornerRadius={w * 0.006}
              />
            </Group>
          )
        }

        if (frameType === "iphone_15") {
          const sx = w * 0.035
          const sy = w * 0.035
          const sw = w * 0.93
          const sh = h - w * 0.07
          return (
            <Group key={l.id} {...commonProps}>
              <Rect
                width={w}
                height={h}
                fill="#1a1a1a"
                cornerRadius={w * 0.11}
                stroke="#444"
                strokeWidth={w * 0.011}
              />
              <Rect x={sx} y={sy} width={sw} height={sh} fill="#000" cornerRadius={w * 0.08} />
              {screenshotUrl && (
                <CanvasImage
                  x={sx}
                  y={sy}
                  width={sw}
                  height={sh}
                  src={screenshotUrl}
                  cornerRadius={w * 0.08}
                />
              )}
              {screenPlaceholder}
              {/* Notch */}
              <Rect
                x={w * 0.3}
                y={w * 0.042}
                width={w * 0.4}
                height={w * 0.05}
                fill="#000"
                cornerRadius={w * 0.025}
              />
              <Rect
                x={-w * 0.013}
                y={h * 0.2}
                width={w * 0.013}
                height={h * 0.036}
                fill="#444"
                cornerRadius={w * 0.006}
              />
              <Rect
                x={-w * 0.013}
                y={h * 0.26}
                width={w * 0.013}
                height={h * 0.065}
                fill="#444"
                cornerRadius={w * 0.006}
              />
              <Rect
                x={-w * 0.013}
                y={h * 0.34}
                width={w * 0.013}
                height={h * 0.065}
                fill="#444"
                cornerRadius={w * 0.006}
              />
              <Rect
                x={w}
                y={h * 0.28}
                width={w * 0.013}
                height={h * 0.11}
                fill="#444"
                cornerRadius={w * 0.006}
              />
            </Group>
          )
        }

        if (frameType === "samsung_s24") {
          const sx = w * 0.028
          const sy = w * 0.025
          const sw = w * 0.944
          const sh = h - w * 0.05
          return (
            <Group key={l.id} {...commonProps}>
              <Rect
                width={w}
                height={h}
                fill="#111"
                cornerRadius={w * 0.08}
                stroke="#2a2a2a"
                strokeWidth={w * 0.01}
              />
              <Rect x={sx} y={sy} width={sw} height={sh} fill="#0a0a0a" cornerRadius={w * 0.065} />
              {screenshotUrl && (
                <CanvasImage
                  x={sx}
                  y={sy}
                  width={sw}
                  height={sh}
                  src={screenshotUrl}
                  cornerRadius={w * 0.065}
                />
              )}
              {screenPlaceholder}
              {/* Punch-hole camera */}
              <Circle x={w * 0.5} y={w * 0.072} radius={w * 0.028} fill="#000" />
              <Rect
                x={w}
                y={h * 0.23}
                width={w * 0.013}
                height={h * 0.055}
                fill="#2a2a2a"
                cornerRadius={w * 0.005}
              />
              <Rect
                x={w}
                y={h * 0.295}
                width={w * 0.013}
                height={h * 0.055}
                fill="#2a2a2a"
                cornerRadius={w * 0.005}
              />
              <Rect
                x={-w * 0.013}
                y={h * 0.29}
                width={w * 0.013}
                height={h * 0.07}
                fill="#2a2a2a"
                cornerRadius={w * 0.005}
              />
            </Group>
          )
        }

        if (frameType === "google_pixel") {
          const sx = w * 0.04
          const sy = w * 0.04
          const sw = w * 0.92
          const sh = h - w * 0.08
          return (
            <Group key={l.id} {...commonProps}>
              <Rect
                width={w}
                height={h}
                fill="#1a1a1a"
                cornerRadius={w * 0.09}
                stroke="#383838"
                strokeWidth={w * 0.011}
              />
              <Rect x={sx} y={sy} width={sw} height={sh} fill="#0d0d0d" cornerRadius={w * 0.075} />
              {screenshotUrl && (
                <CanvasImage
                  x={sx}
                  y={sy}
                  width={sw}
                  height={sh}
                  src={screenshotUrl}
                  cornerRadius={w * 0.075}
                />
              )}
              {screenPlaceholder}
              {/* Punch-hole camera */}
              <Circle x={w * 0.5} y={w * 0.085} radius={w * 0.026} fill="#000" />
              <Rect
                x={w}
                y={h * 0.27}
                width={w * 0.013}
                height={h * 0.075}
                fill="#383838"
                cornerRadius={w * 0.005}
              />
              <Rect
                x={w}
                y={h * 0.355}
                width={w * 0.013}
                height={h * 0.055}
                fill="#383838"
                cornerRadius={w * 0.005}
              />
              <Rect
                x={w}
                y={h * 0.42}
                width={w * 0.013}
                height={h * 0.055}
                fill="#383838"
                cornerRadius={w * 0.005}
              />
            </Group>
          )
        }

        if (frameType === "ipad_pro") {
          const sx = w * 0.025
          const sy = w * 0.025
          const sw = w * 0.95
          const sh = h - w * 0.05
          return (
            <Group key={l.id} {...commonProps}>
              <Rect
                width={w}
                height={h}
                fill="#1c1c1e"
                cornerRadius={w * 0.055}
                stroke="#4a4a4c"
                strokeWidth={w * 0.009}
              />
              <Rect x={sx} y={sy} width={sw} height={sh} fill="#000" cornerRadius={w * 0.04} />
              {screenshotUrl && (
                <CanvasImage
                  x={sx}
                  y={sy}
                  width={sw}
                  height={sh}
                  src={screenshotUrl}
                  cornerRadius={w * 0.04}
                />
              )}
              {screenPlaceholder}
              {/* Front camera top center */}
              <Circle x={w * 0.5} y={w * 0.037} radius={w * 0.018} fill="#000" />
              <Rect
                x={w}
                y={h * 0.22}
                width={w * 0.01}
                height={h * 0.04}
                fill="#4a4a4c"
                cornerRadius={w * 0.004}
              />
              <Rect
                x={w}
                y={h * 0.28}
                width={w * 0.01}
                height={h * 0.04}
                fill="#4a4a4c"
                cornerRadius={w * 0.004}
              />
              {/* Power button top */}
              <Rect
                x={w * 0.68}
                y={-w * 0.009}
                width={w * 0.12}
                height={w * 0.009}
                fill="#4a4a4c"
                cornerRadius={w * 0.004}
              />
            </Group>
          )
        }

        if (frameType === "android_tablet") {
          const sx = w * 0.025
          const sy = w * 0.025
          const sw = w * 0.95
          const sh = h - w * 0.05
          return (
            <Group key={l.id} {...commonProps}>
              <Rect
                width={w}
                height={h}
                fill="#151515"
                cornerRadius={w * 0.05}
                stroke="#303030"
                strokeWidth={w * 0.008}
              />
              <Rect x={sx} y={sy} width={sw} height={sh} fill="#0d0d0d" cornerRadius={w * 0.03} />
              {screenshotUrl && (
                <CanvasImage
                  x={sx}
                  y={sy}
                  width={sw}
                  height={sh}
                  src={screenshotUrl}
                  cornerRadius={w * 0.03}
                />
              )}
              {screenPlaceholder}
              <Circle x={w * 0.5} y={w * 0.04} radius={w * 0.02} fill="#000" />
              <Rect
                x={w}
                y={h * 0.25}
                width={w * 0.009}
                height={h * 0.05}
                fill="#303030"
                cornerRadius={w * 0.003}
              />
              <Rect
                x={w}
                y={h * 0.32}
                width={w * 0.009}
                height={h * 0.05}
                fill="#303030"
                cornerRadius={w * 0.003}
              />
            </Group>
          )
        }

        // Generic fallback
        return (
          <Group key={l.id} {...commonProps}>
            <Rect
              width={w}
              height={h}
              fill="#18181b"
              cornerRadius={w * 0.08}
              stroke="#3f3f46"
              strokeWidth={6}
            />
            <Rect
              x={12}
              y={12}
              width={w - 24}
              height={h - 24}
              fill={screenshotUrl ? "transparent" : "#09090b"}
              cornerRadius={w * 0.06}
            />
            {screenshotUrl ? (
              <CanvasImage
                x={12}
                y={12}
                width={w - 24}
                height={h - 24}
                src={screenshotUrl}
                cornerRadius={w * 0.06}
              />
            ) : (
              <Text
                x={12}
                y={h / 2 - 40}
                width={w - 24}
                text="Drop a screenshot here"
                fontSize={w * 0.045}
                fontFamily="Inter"
                fill="#52525b"
                align="center"
              />
            )}
            <Rect
              x={w / 2 - w * 0.1}
              y={18}
              width={w * 0.2}
              height={w * 0.04}
              fill="#09090b"
              cornerRadius={w * 0.02}
            />
          </Group>
        )
      }
    }
  }

  const renderPage = (page: Page, index: number) => {
    const pageX = index * (canvasWidth + gap)
    const isActive = page.id === currentPageId

    return (
      <Group key={page.id} x={pageX} y={0}>
        <Text
          text={page.name.toUpperCase()}
          x={0}
          y={-60}
          width={canvasWidth}
          align="center"
          fontSize={34}
          fontFamily="Inter"
          fontStyle="bold"
          fill={isActive ? "#a855f7" : "#52525b"}
        />
        <Rect
          width={canvasWidth}
          height={canvasHeight}
          stroke={isActive ? "#a855f7" : "#27272a"}
          strokeWidth={isActive ? 8 : 4}
          cornerRadius={16}
          shadowColor="#000000"
          shadowBlur={30}
          shadowOpacity={0.4}
          shadowOffset={{ x: 0, y: 15 }}
          onClick={() => setCurrentPageId(page.id)}
          onTouchStart={() => setCurrentPageId(page.id)}
        />
        <Group clip={{ x: 0, y: 0, width: canvasWidth, height: canvasHeight }}>
          {renderBackground(page.background)}
          {page.layers.map((l) => renderLayerElement(l, page.id))}
        </Group>
      </Group>
    )
  }

  // Snap guide lines drawn on top of all pages in stage coordinates
  const renderGuides = () => {
    if (guides.vLines.length === 0 && guides.hLines.length === 0) return null

    const activeIdx = pages.findIndex((p) => p.id === currentPageId)
    if (activeIdx === -1) return null

    const offsetX = activeIdx * (canvasWidth + gap)
    const strokeWidth = 1 / zoom
    const dash = [6 / zoom, 3 / zoom]

    return (
      <>
        {guides.vLines.map((x, i) => (
          <Line
            key={`vg-${i}`}
            points={[offsetX + x, -500, offsetX + x, canvasHeight + 500]}
            stroke="#a855f7"
            strokeWidth={strokeWidth}
            dash={dash}
            listening={false}
          />
        ))}
        {guides.hLines.map((y, i) => (
          <Line
            key={`hg-${i}`}
            points={[offsetX - 500, y, offsetX + canvasWidth + 500, y]}
            stroke="#a855f7"
            strokeWidth={strokeWidth}
            dash={dash}
            listening={false}
          />
        ))}
      </>
    )
  }

  const cursorStyle =
    panCursor === "grabbing" ? "grabbing" : panCursor === "grab" ? "grab" : "default"

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full bg-zinc-900 overflow-hidden relative flex items-center justify-center"
      style={{ cursor: cursorStyle }}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleContainerMouseMove}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseUp}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panX + stageSize.width / 2 - (totalWidth * zoom) / 2}
        y={panY + stageSize.height / 2 - (canvasHeight * zoom) / 2}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
      >
        <KonvaLayer>
          {/* Transparent hit area covering the whole stage for deselect-on-click */}
          <Rect
            name="stage-bg"
            x={-stageSize.width * 10}
            y={-stageSize.height * 10}
            width={stageSize.width * 20 + totalWidth}
            height={stageSize.height * 20 + canvasHeight}
            fill="transparent"
          />

          {pages.map((p, idx) => renderPage(p, idx))}

          {/* Snap alignment guides — rendered above all pages */}
          {renderGuides()}

          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox
              return newBox
            }}
            keepRatio={false}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
              "top-center",
              "bottom-center",
              "left-center",
              "right-center",
            ]}
          />
        </KonvaLayer>
      </Stage>
    </div>
  )
}
