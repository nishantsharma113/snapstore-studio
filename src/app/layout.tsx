import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: {
    default: "SnapStore Studio — App Store Screenshot Designer",
    template: "%s | SnapStore Studio",
  },
  description:
    "Create beautiful, professional Apple App Store and Google Play Store screenshots. Custom backgrounds, modern device frames, text styling, and instant high-res exports.",
  keywords: [
    "app store screenshots",
    "google play screenshots",
    "screenshot designer",
    "mobile app marketing",
  ],
  authors: [{ name: "SnapStore Studio" }],
  creator: "SnapStore Studio",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "SnapStore Studio — App Store Screenshot Designer",
    description:
      "Design beautiful app store screenshots that convert. Custom templates, device frames, and instant 4K exports.",
    type: "website",
    locale: "en_US",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
