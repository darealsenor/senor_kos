import { useState, useMemo, useEffect, useRef } from 'react'
import type { LoadoutItem } from './LoadoutSelect'

interface ItemSearchInputProps {
  loadoutItems: LoadoutItem[]
  value: string
  onChange: (itemName: string) => void
  placeholder?: string
  className?: string
}

export const ItemSearchInput = ({
  loadoutItems,
  value,
  onChange,
  placeholder = 'Search items...',
  className = '',
}: ItemSearchInputProps) => {
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
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

  const selectedLabel = value ? loadoutItems.find((i) => i.name === value)?.label ?? value : ''

  if (loadoutItems.length === 0) return null

  return (
    <div ref={ref} className={`relative ${className}`}>
      <input
        type="text"
        value={dropdownOpen ? search : selectedLabel}
        onChange={(e) => {
          setSearch(e.target.value)
          setDropdownOpen(true)
          if (!dropdownOpen) onChange('')
        }}
        onFocus={() => setDropdownOpen(true)}
        placeholder={placeholder}
        className="w-full bg-black/40 border border-rz-primary/30 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-rz-primary placeholder:text-white/40"
      />
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
                  onChange(i.name)
                  setSearch('')
                  setDropdownOpen(false)
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
  )
}
