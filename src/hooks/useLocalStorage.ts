"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * @hook useLocalStorage
 * Type-safe localStorage hook that syncs React state with localStorage.
 * Handles SSR (server-side rendering) gracefully.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage<"dark" | "light">("theme", "dark")
 * const [sidebarCollapsed, setSidebar] = useLocalStorage("sidebar-collapsed", false)
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Read from localStorage or fall back to initialValue
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading "${key}":`, error)
      return initialValue
    }
  }, [key, initialValue])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  // Persist to localStorage on value change
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") {
        console.warn(`[useLocalStorage] Attempted to set "${key}" on server`)
        return
      }
      try {
        const newValue = value instanceof Function ? value(storedValue) : value
        window.localStorage.setItem(key, JSON.stringify(newValue))
        setStoredValue(newValue)
        // Dispatch storage event so other tabs can sync
        window.dispatchEvent(new Event("local-storage"))
      } catch (error) {
        console.warn(`[useLocalStorage] Error setting "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue())
    }
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("local-storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("local-storage", handleStorageChange)
    }
  }, [readValue])

  return [storedValue, setValue] as const
}
