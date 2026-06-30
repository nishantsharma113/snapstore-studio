export interface BrandAsset {
  id: string
  name: string
  src: string // base64 data URL
  type: "logo" | "icon" | "asset"
  createdAt: string
}

export interface BrandKit {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  logo?: BrandAsset
  icons: BrandAsset[]
  updatedAt: string
}

export const BRAND_FONT_OPTIONS = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Nunito", value: "Nunito, sans-serif" },
  { label: "Open Sans", value: "Open Sans, sans-serif" },
  { label: "Lato", value: "Lato, sans-serif" },
  { label: "Raleway", value: "Raleway, sans-serif" },
  { label: "Playfair Display", value: "Playfair Display, serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "DM Sans", value: "DM Sans, sans-serif" },
  { label: "Space Grotesk", value: "Space Grotesk, sans-serif" },
] as const
