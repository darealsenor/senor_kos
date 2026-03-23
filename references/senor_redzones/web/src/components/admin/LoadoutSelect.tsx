import { useState, useMemo, useEffect, useRef } from 'react'
import type { Zone } from '@/types'

export interface LoadoutItem {
  name: string
  label: string
}

interface LoadoutSelectProps {
  loadoutItems: LoadoutItem[]
  value: Zone['loadout']
  onChange: (loadout: Zone['loadout']) => void
}

function toLoadoutArray(loadout: Zone['loadout']): { name: string; amount: number }[] {
  if (Array.isArray(loadout)) {
    return loadout.map((e) => ({
      name: typeof e === 'string' ? e : e.name,
      amount: typeof e === 'object' && e.amount != null ? e.amount : 1,
    }))
  }
  if (loadout && typeof loadout === 'object') {
    return Object.entries(loadout).map(([name, amount]) => ({ name, amount: Number(amount) || 1 }))
  }
  return []
}

export const LoadoutSelect = ({ loadoutItems, value, onChange }: LoadoutSelectProps) => {
  const items = toLoadoutArray(value)
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [dropdownOpen])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return loadoutItems
    const q = search.toLowerCase()
    return loadoutItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.label && i.label.toLowerCase().includes(q))
    )
  }, [loadoutItems, search])

  const addItem = (name: string) => {
    const arr = [...items]
    const existing = arr.find((e) => e.name === name)
    if (existing) {
      existing.amount += 1
    } else {
      arr.push({ name, amount: 1 })
    }
    onChange(arr)
    setSearch('')
    setDropdownOpen(false)
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const setAmount = (index: number, amount: number) => {
    const a = Math.max(1, Math.min(999, amount))
    onChange(items.map((e, i) => (i === index ? { ...e, amount: a } : e)))
  }

  const getLabel = (name: string) => loadoutItems.find((i) => i.name === name)?.label ?? name

  if (loadoutItems.length === 0) return null

  return (
    <div className="flex flex-col gap-2" ref={dropdownRef}>
      <label className="text-sm text-white/80 font-medium">Loadout (items given on entry)</label>
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setDropdownOpen(true)
            }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Search items..."
            className="flex-1 bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-3 py-2 bg-rz-primary/20 border border-rz-primary/40 hover:bg-rz-primary/30 rounded text-white text-sm font-medium uppercase tracking-wider"
          >
            Add
          </button>
        </div>
        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-rz-background-dark border border-rz-primary/30 rounded z-10">
            {filteredItems.length === 0 ? (
              <p className="px-3 py-4 text-sm text-white/50">
                {search.trim() ? 'No items found' : 'Type to search...'}
              </p>
            ) : (
              filteredItems.map((i) => (
                <button
                  key={i.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addItem(i.name)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-rz-primary/20 border-b border-rz-primary/10 last:border-0"
                >
                  {i.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {items.length > 0 && (
        <ul className="flex flex-col gap-1 max-h-32 overflow-y-auto">
          {items.map((e, i) => (
            <li
              key={`${e.name}-${i}`}
              className="flex items-center justify-between gap-2 py-1 px-2 bg-black/30 rounded border border-rz-primary/10"
            >
              <span className="text-sm text-white/90 truncate flex-1">{getLabel(e.name)}</span>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={e.amount}
                  onChange={(ev) => setAmount(i, Number(ev.target.value) || 1)}
                  className="w-14 bg-black/40 border border-rz-primary/30 rounded px-2 py-1 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
