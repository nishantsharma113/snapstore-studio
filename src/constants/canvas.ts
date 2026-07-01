/**
 * @module constants/canvas
 * Canvas size presets for common app store and device dimensions.
 * All values are in pixels at @1x (actual pixel dimensions for export).
 *
 * Usage:
 *   const preset = CANVAS_PRESETS.find(p => p.id === "ios_app_store")
 *   setCanvasDimensions(preset.width, preset.height)
 */

export interface CanvasPreset {
  id: string
  name: string
  category: "ios" | "android" | "tablet" | "web" | "social"
  width: number
  height: number
  description: string
  badge?: string
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  // iOS App Store
  {
    id: "ios_app_store_65",
    name: 'iPhone 6.5"',
    category: "ios",
    width: 1242,
    height: 2688,
    description: "App Store — iPhone 14 Plus, 13 Pro Max, 12 Pro Max",
    badge: "App Store",
  },
  {
    id: "ios_app_store_55",
    name: 'iPhone 5.5"',
    category: "ios",
    width: 1242,
    height: 2208,
    description: "App Store — iPhone 8 Plus, 7 Plus, 6s Plus",
    badge: "App Store",
  },
  {
    id: "ios_ipad_pro_129",
    name: 'iPad Pro 12.9"',
    category: "tablet",
    width: 2048,
    height: 2732,
    description: "App Store — iPad Pro 12.9 inch",
    badge: "iPad",
  },
  {
    id: "ios_ipad_pro_110",
    name: 'iPad Pro 11"',
    category: "tablet",
    width: 1668,
    height: 2388,
    description: "App Store — iPad Pro 11 inch",
    badge: "iPad",
  },

  // Google Play Store
  {
    id: "android_phone",
    name: "Android Phone",
    category: "android",
    width: 1080,
    height: 1920,
    description: "Google Play Store — standard Android phone",
    badge: "Play Store",
  },
  {
    id: "android_tablet_7",
    name: 'Android Tablet 7"',
    category: "tablet",
    width: 1200,
    height: 1920,
    description: "Google Play Store — 7 inch tablet",
    badge: "Play Store",
  },
  {
    id: "android_tablet_10",
    name: 'Android Tablet 10"',
    category: "tablet",
    width: 1920,
    height: 1200,
    description: "Google Play Store — 10 inch tablet (landscape)",
    badge: "Play Store",
  },

  // Social Media
  {
    id: "social_instagram_post",
    name: "Instagram Post",
    category: "social",
    width: 1080,
    height: 1080,
    description: "Square format for Instagram feed",
    badge: "Social",
  },
  {
    id: "social_instagram_story",
    name: "Instagram Story",
    category: "social",
    width: 1080,
    height: 1920,
    description: "Vertical format for Stories and Reels",
    badge: "Social",
  },
  {
    id: "social_twitter_card",
    name: "Twitter / X Card",
    category: "social",
    width: 1200,
    height: 628,
    description: "Horizontal card for Twitter/X posts",
    badge: "Social",
  },
]

/** Default canvas dimensions (iPhone 6.5" App Store) */
export const DEFAULT_CANVAS_WIDTH = 1242
export const DEFAULT_CANVAS_HEIGHT = 2688

/** Canvas zoom limits */
export const MIN_ZOOM = 0.05
export const MAX_ZOOM = 3.0
export const DEFAULT_ZOOM = 0.2

/** Layer defaults */
export const DEFAULT_LAYER_OPACITY = 1
export const DEFAULT_LAYER_ROTATION = 0
