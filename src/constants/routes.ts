/**
 * @module constants/routes
 * Typed route constants — use these instead of hardcoded strings
 * to catch route renames at compile time.
 *
 * Usage:
 *   router.push(ROUTES.DASHBOARD)
 *   <Link href={ROUTES.EDITOR}>Open Editor</Link>
 */

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  EDITOR: "/editor",

  // Auth routes
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },

  // Future routes (Phase 2+)
  TEMPLATES: "/templates",
  ASSETS: "/assets",
  PROFILE: "/profile",
  SETTINGS: "/settings",

  // Admin routes (Phase 13)
  ADMIN: {
    ROOT: "/admin",
    USERS: "/admin/users",
    ANALYTICS: "/admin/analytics",
  },
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
