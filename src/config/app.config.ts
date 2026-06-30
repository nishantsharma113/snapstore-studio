/**
 * @module config/app.config
 * Application-wide configuration and metadata.
 * Import this instead of hardcoding app name/version/links throughout the codebase.
 */

export const APP_CONFIG = {
  name: "SnapStore Studio",
  shortName: "SnapStore",
  version: "0.1.0",
  description:
    "Create beautiful, professional App Store and Google Play screenshots with powerful canvas tools, device frames, and instant high-res exports.",
  tagline: "Design stunning app screenshots in minutes.",

  /** Contact & support */
  supportEmail: "support@snapstorestudio.com",

  /** Social & external links */
  links: {
    github: "https://github.com/your-org/snapstore-studio",
    twitter: "https://twitter.com/snapstorestudio",
    docs: "https://docs.snapstorestudio.com",
  },

  /** Feature flags — flip to enable/disable features across the app */
  features: {
    aiGeneration: false, // Phase 10
    teamCollaboration: false, // Phase 11
    billing: false, // Phase 12
    adminPanel: false, // Phase 13
    brandKit: false, // Phase 9
  },

  /** Pagination defaults */
  pagination: {
    projectsPerPage: 12,
    templatesPerPage: 24,
  },

  /** Export constraints */
  export: {
    maxScale: 4,
    supportedFormats: ["png", "jpeg"] as const,
  },
} as const

export type AppConfig = typeof APP_CONFIG
