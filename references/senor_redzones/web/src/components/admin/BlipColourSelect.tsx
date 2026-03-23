const BLIP_COLOURS: { value: number; label: string }[] = [
  { value: 0, label: 'White' },
  { value: 1, label: 'Red' },
  { value: 2, label: 'Green' },
  { value: 3, label: 'Blue' },
  { value: 4, label: 'Yellow' },
  { value: 5, label: 'Orange' },
  { value: 6, label: 'Purple' },
  { value: 7, label: 'Pink' },
]

interface BlipColourSelectProps {
  value: number
  onChange: (value: number) => void
}

export const BlipColourSelect = ({ value, onChange }: BlipColourSelectProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm text-white/80 font-medium">Blip colour</label>
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
    >
      {BLIP_COLOURS.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-black text-white">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
)
