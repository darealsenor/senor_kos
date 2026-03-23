import type { MarkerColour } from '@/types'

const MARKER_COLOURS: { value: [number, number, number, number]; label: string }[] = [
  { value: [255, 42, 24, 120], label: 'Red (default)' },
  { value: [255, 87, 34, 120], label: 'Orange' },
  { value: [255, 193, 7, 120], label: 'Amber' },
  { value: [76, 175, 80, 120], label: 'Green' },
  { value: [33, 150, 243, 120], label: 'Blue' },
  { value: [156, 39, 176, 120], label: 'Purple' },
  { value: [233, 30, 99, 120], label: 'Pink' },
  { value: [255, 255, 255, 120], label: 'White' },
  { value: [33, 33, 33, 120], label: 'Dark' },
]

function toKey(v: [number, number, number, number]): string {
  return v.join(',')
}

function parseKey(k: string): [number, number, number, number] | null {
  const parts = k.split(',')
  if (parts.length !== 4) return null
  const n = parts.map((p) => parseInt(p, 10))
  if (n.some(isNaN)) return null
  return n as [number, number, number, number]
}

interface MarkerColourSelectProps {
  value: MarkerColour | [number, number, number, number]
  onChange: (value: [number, number, number, number]) => void
}

export const MarkerColourSelect = ({ value, onChange }: MarkerColourSelectProps) => {
  const arr = Array.isArray(value) ? value : [value.r, value.g, value.b, value.a]
  const currentKey = arr.join(',')

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-white/80 font-medium">Marker colour</label>
      <select
        value={
          MARKER_COLOURS.find((c) => toKey(c.value) === currentKey)
            ? currentKey
            : MARKER_COLOURS[0].value.join(',')
        }
        onChange={(e) => {
          const parsed = parseKey(e.target.value)
          if (parsed) onChange(parsed)
        }}
        className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
      >
        {MARKER_COLOURS.map((opt) => (
          <option key={toKey(opt.value)} value={toKey(opt.value)} className="bg-black text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
