import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'senor_topplayers:admin_pos'

interface Position {
  x: number
  y: number
}

const DEFAULT_POSITION: Position = { x: -1, y: -1 }

function clampPosition(x: number, y: number, w: number, h: number): Position {
  return {
    x: Math.max(0, Math.min(window.innerWidth - w, x)),
    y: Math.max(0, Math.min(window.innerHeight - h, y)),
  }
}

function loadPosition(): Position | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed != null &&
      typeof parsed === 'object' &&
      'x' in parsed &&
      'y' in parsed &&
      typeof (parsed as Position).x === 'number' &&
      typeof (parsed as Position).y === 'number'
    ) {
      return parsed as Position
    }
    return null
  } catch {
    return null
  }
}

function savePosition(pos: Position) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
  } catch {
    // ignore
  }
}

function clearPosition() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

const LOCK_KEY = 'senor_topplayers:admin_locked'

function loadLocked(): boolean {
  try {
    const raw = localStorage.getItem(LOCK_KEY)
    if (raw === null) return true
    return raw === 'true'
  } catch {
    return true
  }
}

function saveLocked(locked: boolean) {
  try {
    localStorage.setItem(LOCK_KEY, String(locked))
  } catch {
    // ignore
  }
}

export function useDraggable(enabled: boolean) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION)
  const [locked, setLocked] = useState<boolean>(() => loadLocked())
  const dragging = useRef(false)
  const dragOffset = useRef<Position>({ x: 0, y: 0 })
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const saved = loadPosition()
    if (saved) {
      const el = panelRef.current
      const w = el?.offsetWidth ?? 300
      const h = el?.offsetHeight ?? 400
      setPosition(clampPosition(saved.x, saved.y, w, h))
    } else {
      setPosition(DEFAULT_POSITION)
    }
  }, [])

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled || locked) return
      if ((e.target as HTMLElement).closest('button')) return
      e.preventDefault()
      const el = panelRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      dragging.current = true
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    },
    [enabled, locked]
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const el = panelRef.current
      if (!el) return
      const w = el.offsetWidth
      const h = el.offsetHeight
      const next = clampPosition(
        e.clientX - dragOffset.current.x,
        e.clientY - dragOffset.current.y,
        w,
        h
      )
      setPosition(next)
    }

    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      const el = panelRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const pos = { x: rect.left, y: rect.top }
      savePosition(pos)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const toggleLock = useCallback(() => {
    setLocked((prev) => {
      const next = !prev
      saveLocked(next)
      return next
    })
  }, [])

  const resetPosition = useCallback(() => {
    clearPosition()
    setPosition(DEFAULT_POSITION)
  }, [])

  const isDefault = position.x === DEFAULT_POSITION.x && position.y === DEFAULT_POSITION.y

  const style: React.CSSProperties = isDefault
    ? {}
    : { left: position.x, top: position.y, transform: 'none', right: 'auto' }

  return { panelRef, style, locked, toggleLock, resetPosition, onMouseDown, isDefault }
}
