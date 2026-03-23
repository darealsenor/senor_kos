import type { Zone } from '@/types'
import { useLocale } from '@/hooks/useLocale'

interface ZonesTableProps {
  zones: Zone[]
  selectedZoneId?: string | number
  onSelect: (zone: Zone) => void
  onDelete: (zone: Zone) => void
}

export const ZonesTable = ({ zones, selectedZoneId, onSelect, onDelete }: ZonesTableProps) => {
  const { t } = useLocale()
  if (zones.length === 0) {
    return (
      <p className="text-sm text-white/50 py-4">{t('no_zones')}</p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {zones.map((zone) => (
        <div
          key={String(zone.id)}
          onClick={() => onSelect(zone)}
          className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
            selectedZoneId === zone.id ? 'bg-rz-primary/20 border border-rz-primary/50' : 'bg-white/5 hover:bg-white/10 border border-transparent'
          }`}
        >
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{zone.name}</span>
            <span className="text-xs text-white/50">
              [{zone.id}] {zone.type} • r:{zone.radius}m
              {zone.type === 'permanent' && zone.enabled === false && (
                <span className="text-red-400/80 ml-1">(disabled)</span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(zone)
            }}
            className="px-2 py-1 text-xs font-bold uppercase text-white/70 hover:text-rz-primary border border-white/20 hover:border-rz-primary/50 rounded transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      ))}
    </div>
  )
}
