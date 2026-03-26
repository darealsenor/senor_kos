import { useEffect, useState } from 'react'

/**
 * Debounce a changing value by `delay` milliseconds.
 * @param value The input value to debounce.
 * @param delay Debounce delay in ms.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(t)
  }, [value, delay])

  return debouncedValue
}

