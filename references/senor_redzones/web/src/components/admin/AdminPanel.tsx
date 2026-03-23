import { useEffect, useState, useCallback } from 'react'
import { useAtom } from 'jotai'
import { adminZonesAtom } from '@/store/admin.state'
import { fetchNui } from '@/utils/fetchNui'
import { isEnvBrowser } from '@/utils/misc'
import { useLocale } from '@/hooks/useLocale'
import { MOCK_ZONES } from '@/data/mockZones'
import { ZoneMap } from './Map/Map'
import { Watermark } from '../Watermark'
import { ZonesTable } from './ZonesTable'
import { ZoneForm } from './ZoneForm'
import { ConfirmDialog } from './ConfirmDialog'
import { ErrorDialog } from './ErrorDialog'
import type { Zone, CreateZoneInput, Vector3, ZonePreset, AdminFormDefaults } from '@/types'
import { toMapCoords } from './Map/map.constants'

interface AdminPanelProps {
  initialZones?: Zone[]
  loadoutItems: Array<{ name: string; label: string }>
  defaults?: AdminFormDefaults
  spawnPlacementActive?: boolean
  onClose: () => void
}

export const AdminPanel = ({ initialZones, loadoutItems, defaults, spawnPlacementActive, onClose }: AdminPanelProps) => {
  const { t } = useLocale()
  const [zones, setZones] = useAtom(adminZonesAtom)
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [formCoords, setFormCoords] = useState<Vector3 | undefined>(undefined)
  const [initialNameForNewZone, setInitialNameForNewZone] = useState<string>('')
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined)
  const [presets, setPresets] = useState<ZonePreset[]>([])
  const [previewRadius, setPreviewRadius] = useState<number>(defaults?.zoneRadius ?? 50)
  const [activeTab, setActiveTab] = useState<'zones' | 'editor'>('zones')

  const loadPresets = useCallback(async () => {
    if (isEnvBrowser()) return
    const result = await fetchNui<{ success: boolean; presets?: ZonePreset[] }>('redzone:getPresets')
    if (result?.success && result.presets) setPresets(result.presets)
  }, [])

  const loadZones = useCallback(async () => {
    if (isEnvBrowser()) {
      setZones(MOCK_ZONES)
      return
    }
    const result = await fetchNui<{ success: boolean; zones?: Zone[] }>('redzone:getZones')
    if (result?.success && result.zones) {
      setZones(result.zones)
    }
  }, [setZones])

  useEffect(() => {
    if (isEnvBrowser()) {
      loadZones()
    } else {
      loadPresets()
      if (initialZones && initialZones.length > 0) {
        setZones(initialZones)
      } else {
        loadZones()
      }
      fetchNui<{ success: boolean; coords?: Vector3; street?: string }>('redzone:getPlayerLocation').then((loc) => {
        if (loc?.success && loc.coords) {
          setFormCoords(loc.coords)
          setInitialNameForNewZone(loc.street ?? '')
          setMapCenter(toMapCoords(loc.coords.x, loc.coords.y))
        }
      })
    }
  }, [initialZones, loadZones, loadPresets, setZones])

  useEffect(() => {
    const r = defaults?.zoneRadius ?? 50
    setPreviewRadius(typeof r === 'number' ? r : 50)
  }, [defaults?.zoneRadius])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleMapClick = async (x: number, y: number) => {
    setMapCenter(toMapCoords(x, y))
    if (selectedZone) setSelectedZone(null)
    if (isEnvBrowser()) {
      setFormCoords({ x, y, z: 0 })
      return
    }
    const res = await fetchNui<{ success: boolean; z?: number }>('redzone:getGroundZ', { x, y })
    const z = res?.success && typeof res.z === 'number' ? res.z : 0
    setFormCoords({ x, y, z })
  }

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone)
    setFormCoords(undefined)
    setMapCenter(toMapCoords(zone.coords.x, zone.coords.y))
    setActiveTab('editor')
  }

  const handleCreate = async (data: Partial<CreateZoneInput> & { id?: string | number }) => {
    if (isEnvBrowser()) {
      const newZone: Zone = {
        ...data,
        id: `temp-${Date.now()}`,
        name: data.name!,
        coords: data.coords!,
        radius: data.radius!,
        type: data.type ?? 'temporary',
        bucket: data.bucket ?? 0,
        durationType: data.durationType,
        duration: data.duration ?? 0,
        loadout: data.loadout ?? [],
        killstreaks: data.killstreaks ?? {},
        spawnPoints: data.spawnPoints ?? [],
        enabled: data.enabled ?? true,
        autoRevive: data.autoRevive ?? true,
        blipName: data.blipName,
        blipColour: data.blipColour ?? 1,
        markerColour: data.markerColour,
      }
      setZones((prev) => [...prev, newZone])
      setSelectedZone(null)
      setFormCoords(undefined)
      return
    }
    const result = await fetchNui<{ success: boolean; zone?: Zone; error?: string }>('redzone:createZone', data)
    if (result?.success) {
      await loadZones()
      setSelectedZone(null)
      setFormCoords(undefined)
    } else {
      setErrorMessage(result?.error ?? t('create_failed'))
    }
  }

  const handleUpdate = async (data: Partial<CreateZoneInput> & { id?: string | number }) => {
    if (!data.id) return
    if (isEnvBrowser()) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === data.id
            ? { ...z, ...data, coords: data.coords ?? z.coords, name: data.name ?? z.name, radius: data.radius ?? z.radius, enabled: data.enabled ?? z.enabled }
            : z
        )
      )
      setSelectedZone(null)
      return
    }
    const result = await fetchNui<{ success: boolean; zone?: Zone; error?: string }>('redzone:updateZone', data)
    if (result?.success) {
      await loadZones()
      setSelectedZone(null)
    } else {
      setErrorMessage(result?.error ?? t('update_failed'))
    }
  }

  const handleDeleteClick = (zone: Zone) => {
    setZoneToDelete(zone)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    const zone = zoneToDelete
    if (!zone) return
    if (isEnvBrowser()) {
      setZones((prev) => prev.filter((z) => z.id !== zone.id))
      if (selectedZone?.id === zone.id) setSelectedZone(null)
      setZoneToDelete(null)
      setDeleteDialogOpen(false)
      return
    }
    const result = await fetchNui<{ success: boolean; error?: string }>('redzone:deleteZone', { id: zone.id })
    if (result?.success) {
      await loadZones()
      if (selectedZone?.id === zone.id) setSelectedZone(null)
      setZoneToDelete(null)
      setDeleteDialogOpen(false)
    } else {
      setErrorMessage(result?.error ?? t('delete_failed'))
    }
  }

  const handleFormSubmit = (data: Partial<CreateZoneInput> & { id?: string | number }) => {
    if (data.id) {
      handleUpdate(data)
    } else {
      handleCreate(data)
    }
  }

  const handleNewZone = async () => {
    setSelectedZone(null)
    setActiveTab('editor')
    if (!isEnvBrowser()) {
      const loc = await fetchNui<{ success: boolean; coords?: Vector3; street?: string }>('redzone:getPlayerLocation')
      if (loc?.success && loc.coords) {
        setFormCoords(loc.coords)
        setInitialNameForNewZone(loc.street ?? '')
        setMapCenter(toMapCoords(loc.coords.x, loc.coords.y))
      } else {
        setFormCoords(undefined)
        setInitialNameForNewZone('')
      }
    } else {
      setFormCoords(undefined)
      setInitialNameForNewZone('')
    }
  }

  return (
    <>
    <ConfirmDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      title={t('delete_zone')}
      description={zoneToDelete ? t('delete_zone_confirm', zoneToDelete.name) : undefined}
      confirmLabel={t('delete')}
      cancelLabel={t('cancel')}
      onConfirm={handleDeleteConfirm}
      variant="danger"
    />
    <ErrorDialog
      open={!!errorMessage}
      onOpenChange={(open) => !open && setErrorMessage(null)}
      message={errorMessage ?? ''}
    />
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity duration-200 ${spawnPlacementActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="w-full max-w-6xl h-[90vh] flex flex-col bg-rz-background-dark border border-rz-primary/30 rounded overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-rz-primary/20">
          <h1 className="text-lg font-bold uppercase tracking-wider text-white">
            {t('redzone')} <span className="text-rz-primary">{t('admin')}</span>
          </h1>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/60 border border-white/20">ESC</kbd>
            <span className="text-[10px] text-white/50 uppercase">{t('close')}</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-[45%_55%] min-h-0 overflow-hidden">
          <div className="flex flex-col min-h-0 p-4 border-r border-rz-primary/10">
            <div className="flex items-center gap-2 mb-3 border-b border-rz-primary/20 pb-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('zones')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded ${
                  activeTab === 'zones'
                    ? 'bg-rz-primary text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {t('zones')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded ${
                  activeTab === 'editor'
                    ? 'bg-rz-primary text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {selectedZone ? t('edit_zone') : t('new_zone')}
              </button>
            </div>
            <div className="flex-shrink-0 mb-3">
              <button
                type="button"
                onClick={handleNewZone}
                className="text-xs font-bold uppercase text-rz-primary hover:underline"
              >
                + {t('new_zone')}
              </button>
            </div>
            {activeTab === 'zones' && (
              <div className="flex-1 min-h-0 overflow-auto">
                <ZonesTable
                  zones={zones}
                  selectedZoneId={selectedZone?.id}
                  onSelect={handleZoneClick}
                  onDelete={handleDeleteClick}
                />
              </div>
            )}
            {activeTab === 'editor' && (
              <div className="flex-1 min-h-0 overflow-y-auto">
              <ZoneForm
                key={selectedZone ? `zone-${selectedZone.id}` : 'zone-new'}
                zone={selectedZone}
                coords={formCoords}
                initialName={initialNameForNewZone}
                loadoutItems={loadoutItems}
                presets={presets}
                defaults={defaults}
                onRadiusChange={setPreviewRadius}
                onPresetsChange={loadPresets}
                onCoordsChange={setFormCoords}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setSelectedZone(null)
                  setFormCoords(undefined)
                  setInitialNameForNewZone('')
                }}
              />
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col min-h-0 flex-1">
            <div className="flex-1 min-h-0 flex flex-col">
              <ZoneMap
                zones={zones}
                selectedCoords={formCoords}
                selectedZoneId={selectedZone?.id}
                center={mapCenter}
                createPreviewRadius={!selectedZone && formCoords ? previewRadius : undefined}
                onMapClick={handleMapClick}
                onZoneClick={handleZoneClick}
              />
            </div>
            <div className="flex-shrink-0 pt-2">
              <Watermark />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
