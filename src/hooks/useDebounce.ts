"use client"

import { useEffect, useState } from "react"

/**
 * @hook useDebounce
 * Returns a debounced version of `value` that only updates after `delay` ms
 * of no changes. Ideal for search inputs and autosave triggers.
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 300)
 * useEffect(() => {
 *   performSearch(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
