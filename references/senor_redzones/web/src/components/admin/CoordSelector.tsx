import { fetchNui } from '@/utils/fetchNui'
import { isEnvBrowser } from '@/utils/misc'
import type { Vector3 } from '@/types'

interface CoordSelectorProps {
  coords: Vector3
  onCoordsChange: (coords: Vector3) => void
}

export const CoordSelector = ({ coords, onCoordsChange }: CoordSelectorProps) => {
  const handleUseCurrentPosition = async () => {
    if (isEnvBrowser()) {
      onCoordsChange({ x: 200, y: -900, z: 30 })
      return
    }
    const result = await fetchNui<{ success: boolean; coords?: Vector3 }>('redzone:getPlayerCoords')
    if (result?.success && result.coords) {
      onCoordsChange(result.coords)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-white/80 font-medium">Coordinates</p>
      <p className="text-xs text-white/50 font-mono">
        {coords.x.toFixed(2)}, {coords.y.toFixed(2)}, {coords.z.toFixed(2)}
      </p>
      <button
        type="button"
        onClick={handleUseCurrentPosition}
        className="px-3 py-2 text-xs font-bold uppercase tracking-wider border border-rz-primary/40 hover:bg-rz-primary/20 transition-colors rounded text-white"
      >
        Use my position
      </button>
    </div>
  )
}
