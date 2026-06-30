export interface Layer {
  id: string
  name: string
  type: "text" | "shape" | "image" | "device"
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  isLocked: boolean
  isVisible: boolean

  // Specific layer configurations
  textProps?: {
    text: string
    fontSize: number
    fontFamily: string
    fontStyle: "normal" | "bold" | "italic"
    fill: string
    align: "left" | "center" | "right"
    letterSpacing?: number
    lineHeight?: number
    strokeColor?: string
    strokeWidth?: number
  }
  shapeProps?: {
    shapeType: "rect" | "circle" | "triangle" | "star" | "hexagon"
    fill: string
    stroke: string
    strokeWidth: number
    cornerRadius?: number
  }
  imageProps?: {
    src: string
    brightness?: number // -1 to 1, 0 = normal
    contrast?: number // -1 to 1, 0 = normal
    saturate?: number // -1 to 1, 0 = normal
  }
  blendMode?: string
  deviceProps?: {
    frameType: string // iphone_16, iphone_15, samsung_s24, google_pixel, ipad_pro, android_tablet
    screenshotUrl?: string
  }
  shadowProps?: {
    enabled: boolean
    color: string
    blur: number
    offsetX: number
    offsetY: number
    opacity: number
  }
}

export interface CanvasBackground {
  type: "solid" | "gradient" | "image" | "blur" | "pattern" | "noise" | "glass"
  color?: string
  gradient?: string
  imageUrl?: string
  blur?: number
  opacity?: number
}

export interface Page {
  id: string
  name: string
  layers: Layer[]
  background: CanvasBackground
}

export interface CanvasData {
  width: number
  height: number
  layers?: Layer[] // Optional for backward compatibility with single-page designs
  background?: CanvasBackground // Optional for backward compatibility with single-page designs
  pages?: Page[] // New multi-page structure
  currentPageId?: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  canvas_data: CanvasData
  thumbnail_url?: string
  is_archived: boolean
  created_at: string
  updated_at: string
}
