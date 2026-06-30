import { BrandKit, BrandAsset } from "@/types/brand-kit"

const KEY = "snapstore_brand_kit"

const DEFAULT_KIT: BrandKit = {
  primaryColor: "#7c3aed",
  secondaryColor: "#4f46e5",
  accentColor: "#0ea5e9",
  fontFamily: "Inter, sans-serif",
  logo: undefined,
  icons: [],
  updatedAt: new Date().toISOString(),
}

// Resize + re-encode an image to stay well under localStorage quota.
// maxSide: longest edge in pixels. quality: 0–1 for lossy formats.
export async function compressImage(
  dataUrl: string,
  maxSide = 512,
  quality = 0.75
): Promise<string> {
  if (typeof window === "undefined") return dataUrl
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      // Prefer WebP (smaller), fall back to JPEG for browsers without it
      const webp = canvas.toDataURL("image/webp", quality)
      const jpeg = canvas.toDataURL("image/jpeg", quality)
      // Use whichever is smaller, but never larger than the original
      const candidates = [webp, jpeg].filter((d) => d !== "data:,")
      const best = candidates.reduce((a, b) => (a.length < b.length ? a : b), dataUrl)
      resolve(best)
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function read(): BrandKit {
  if (typeof window === "undefined") return { ...DEFAULT_KIT }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_KIT }
    return { ...DEFAULT_KIT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_KIT }
  }
}

function write(kit: BrandKit): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...kit, updatedAt: new Date().toISOString() }))
  } catch (e) {
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)) {
      throw new Error("Storage quota exceeded. Remove some icons or your logo to free up space.")
    }
    throw e
  }
}

export const BrandKitRepository = {
  get(): BrandKit {
    return read()
  },

  update(partial: Partial<BrandKit>): BrandKit {
    const current = read()
    const next = { ...current, ...partial }
    write(next)
    return next
  },

  // Async: compresses image before persisting
  async addIcon(asset: Omit<BrandAsset, "id" | "createdAt">): Promise<BrandKit> {
    const current = read()
    const src = await compressImage(asset.src, 256, 0.75)
    const icon: BrandAsset = {
      ...asset,
      src,
      id: `icon_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
    }
    const next = { ...current, icons: [icon, ...current.icons] }
    write(next)
    return next
  },

  removeIcon(id: string): BrandKit {
    const current = read()
    const next = { ...current, icons: current.icons.filter((i) => i.id !== id) }
    write(next)
    return next
  },

  // Async: compresses logo before persisting
  async setLogo(
    asset: Omit<BrandAsset, "id" | "createdAt" | "type"> | undefined
  ): Promise<BrandKit> {
    const current = read()
    let logo: BrandAsset | undefined
    if (asset) {
      const src = await compressImage(asset.src, 512, 0.82)
      logo = { ...asset, src, id: "logo", createdAt: new Date().toISOString(), type: "logo" }
    }
    const next = { ...current, logo }
    write(next)
    return next
  },

  reset(): BrandKit {
    write({ ...DEFAULT_KIT })
    return { ...DEFAULT_KIT }
  },
}
