import { useState, useEffect } from 'react'
import type { Zone, CreateZoneInput, Vector3, ZonePreset, SpawnPoint, AdminFormDefaults } from '@/types'
import { DEFAULTS } from '@/data/defaults'
import { isEnvBrowser } from '@/utils/misc'
import { fetchNui } from '@/utils/fetchNui'
import { useLocale } from '@/hooks/useLocale'
import { CoordSelector } from './CoordSelector'
import { BlipColourSelect } from './BlipColourSelect'
import { MarkerColourSelect } from './MarkerColourSelect'
import { LoadoutSelect } from './LoadoutSelect'
import { KillstreakSelect } from './KillstreakSelect'
import { PresetSelect } from './PresetSelect'

interface ZoneFormProps {
  zone?: Zone | null
  coords?: Vector3
  initialName?: string
  loadoutItems: Array<{ name: string; label: string }>
  presets: ZonePreset[]
  defaults?: AdminFormDefaults
  onRadiusChange?: (radius: number) => void
  onPresetsChange?: () => void
  onCoordsChange?: (coords: Vector3) => void
  onSubmit: (data: Partial<CreateZoneInput> & { id?: string | number }) => void
  onCancel: () => void
}

const DEFAULT_COORDS: Vector3 = { x: 0, y: 0, z: 0 }

function toMarkerArr(mc: Zone['markerColour']): [number, number, number, number] {
  if (!mc) return DEFAULTS.markerColour
  return Array.isArray(mc) ? (mc as [number, number, number, number]) : [mc.r, mc.g, mc.b, mc.a]
}

export const ZoneForm = ({ zone, coords, initialName, loadoutItems, presets, defaults, onRadiusChange, onPresetsChange, onCoordsChange, onSubmit, onCancel }: ZoneFormProps) => {
  const { t } = useLocale()
  const isEdit = !!zone
  const [name, setName] = useState(zone?.name ?? initialName ?? '')
  const [radius, setRadius] = useState(zone?.radius ?? defaults?.zoneRadius ?? DEFAULTS.zoneRadius)
  const [type, setType] = useState<'permanent' | 'temporary'>(zone?.type ?? 'permanent')
  const [enabled, setEnabled] = useState(zone?.type === 'permanent' ? (zone?.enabled !== false) : true)
  const [bucket, setBucket] = useState(zone?.bucket ?? 0)
  const [durationType, setDurationType] = useState<'time' | 'kills' | ''>(zone?.durationType ?? '')
  const [duration, setDuration] = useState(zone?.duration ?? defaults?.durationKills ?? DEFAULTS.durationKills)
  const [blipName, setBlipName] = useState(zone?.blipName ?? zone?.name ?? '')
  const [blipColour, setBlipColour] = useState(zone?.blipColour ?? defaults?.blipColour ?? DEFAULTS.blipColour)
  const [markerColour, setMarkerColour] = useState<[number, number, number, number]>(() => {
    if (zone?.markerColour) return toMarkerArr(zone.markerColour)
    if (defaults?.markerColour?.length === 4) return defaults.markerColour as [number, number, number, number]
    return DEFAULTS.markerColour
  })
  const [loadout, setLoadout] = useState<Zone['loadout']>(zone?.loadout ?? [])
  const [killstreaks, setKillstreaks] = useState<Zone['killstreaks']>(zone?.killstreaks ?? {})
  const [spawnPoints, setSpawnPoints] = useState<SpawnPoint[]>(zone?.spawnPoints ?? [])
  const [autoRevive, setAutoRevive] = useState(zone?.autoRevive !== false)
  const [localCoords, setLocalCoords] = useState<Vector3>(coords ?? zone?.coords ?? DEFAULT_COORDS)
  const [savePresetOpen, setSavePresetOpen] = useState(false)

  useEffect(() => {
    if (coords) setLocalCoords(coords)
  }, [coords])

  useEffect(() => {
    if (!zone && initialName != null) setName(initialName)
  }, [zone, initialName])

  useEffect(() => {
    if (zone) {
      setName(zone.name)
      setRadius(zone.radius)
      setType(zone.type)
      setEnabled(zone.type === 'permanent' ? (zone.enabled !== false) : true)
      setBucket(zone.bucket)
      setDurationType(zone.durationType ?? '')
      setDuration(zone.duration ?? 0)
      setBlipName(zone.blipName ?? zone.name)
      setBlipColour(zone.blipColour ?? DEFAULTS.blipColour)
      setMarkerColour(toMarkerArr(zone.markerColour))
      setLoadout(zone.loadout ?? [])
      setKillstreaks(zone.killstreaks ?? {})
      setSpawnPoints(zone.spawnPoints ?? [])
      setAutoRevive(zone.autoRevive !== false)
      setLocalCoords(zone.coords)
    }
  }, [zone])

  useEffect(() => {
    if (!isEdit) setBlipName(name)
  }, [isEdit, name])

  useEffect(() => {
    onRadiusChange?.(Number(radius) || 0)
  }, [radius, onRadiusChange])

  const handleCoordsChange = (c: Vector3) => {
    setLocalCoords(c)
    onCoordsChange?.(c)
  }

  const handleLoadPreset = (p: ZonePreset) => {
    const d = p.data
    if (d.bucket != null) setBucket(d.bucket)
    if (d.durationType != null) setDurationType(d.durationType)
    if (d.duration != null) setDuration(d.duration)
    if (d.loadout != null) setLoadout(d.loadout)
    if (d.killstreaks != null) setKillstreaks(d.killstreaks)
    if (d.spawnPoints != null) setSpawnPoints(d.spawnPoints)
    if (d.autoRevive != null) setAutoRevive(d.autoRevive)
    if (d.blipColour != null) setBlipColour(d.blipColour)
    if (d.markerColour != null) {
      const mc = d.markerColour
      setMarkerColour(Array.isArray(mc) ? (mc as [number, number, number, number]) : [mc.r, mc.g, mc.b, mc.a ?? 120])
    }
  }

  const handleSavePreset = async (presetName: string): Promise<boolean> => {
    if (isEnvBrowser()) return false
    const result = await fetchNui<{ success: boolean; error?: string }>('redzone:createPreset', {
      name: presetName,
      bucket: Number(bucket) || 0,
      durationType: durationType || undefined,
      duration: Number(duration) || 0,
      loadout,
      killstreaks,
      spawnPoints,
      autoRevive,
      blipColour,
      markerColour,
    })
    if (result?.success) {
      onPresetsChange?.()
      return true
    }
    return false
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    const r = Number(radius)
    if (r < 10 || r > 500) return
    const payload: Partial<CreateZoneInput> & { id?: string | number } = {
      name: name.trim(),
      coords: localCoords,
      radius: r,
      type,
      bucket: Number(bucket) || 0,
      loadout,
      killstreaks,
      spawnPoints,
      autoRevive,
      blipName: blipName.trim() || undefined,
      blipColour,
      markerColour,
    }
    if (type === 'permanent') {
      payload.enabled = enabled
    }
    if (durationType && duration > 0) {
      payload.durationType = durationType as 'time' | 'kills'
      payload.duration = Number(duration)
    }
    if (isEdit) payload.id = zone!.id
    onSubmit(payload)
  }

  return (
    <div className="flex flex-col gap-5 p-4 bg-black/40 rounded border border-rz-primary/20">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-rz-primary">
          {isEdit ? t('edit_zone') : t('new_zone')}
        </h3>
        <PresetSelect
          presets={presets}
          saveDialogOpen={savePresetOpen}
          onSaveDialogOpenChange={setSavePresetOpen}
          onLoad={handleLoadPreset}
          onSave={handleSavePreset}
        />
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          {t('section_required_basics')}
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/80">{t('name_required')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              const v = e.target.value
              setName(v)
              if (!isEdit) setBlipName(v)
            }}
            placeholder={t('zone_name_placeholder')}
            className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
          />
        </div>
        <CoordSelector coords={localCoords} onCoordsChange={handleCoordsChange} />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/80">{t('radius')}</label>
            <input
              type="number"
              min={10}
              max={500}
              step={10}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value) || 50)}
              className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/80">{t('type')}</label>
            <select
              value={type}
              onChange={(e) => {
                const v = e.target.value as 'permanent' | 'temporary'
                setType(v)
                if (v === 'temporary') setEnabled(true)
              }}
              className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
            >
              <option value="permanent" className="bg-black text-white">{t('permanent')}</option>
              <option value="temporary" className="bg-black text-white">{t('temporary')}</option>
            </select>
          </div>
        </div>
        {type === 'permanent' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-rz-primary/50 bg-black/40 text-rz-primary focus:ring-rz-primary focus:ring-offset-0 accent-[var(--rz-primary)]"
            />
            <label htmlFor="enabled" className="text-sm text-white/80">{t('enabled')}</label>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          {t('section_match_rules')}
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/80">{t('bucket')}</label>
          <input
            type="number"
            min={0}
            value={bucket}
            onChange={(e) => setBucket(Number(e.target.value) || 0)}
            className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/80">{t('duration_type')}</label>
            <select
              value={durationType}
              onChange={(e) => setDurationType(e.target.value as 'time' | 'kills' | '')}
              className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
            >
              <option value="" className="bg-black text-white">{t('duration_type_none')}</option>
              <option value="time" className="bg-black text-white">{t('duration_type_time')}</option>
              <option value="kills" className="bg-black text-white">{t('duration_type_kills')}</option>
            </select>
          </div>
          {durationType && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white/80">{t('duration')}</label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 0)}
                className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoRevive"
            checked={autoRevive}
            onChange={(e) => setAutoRevive(e.target.checked)}
            className="h-4 w-4 rounded border-rz-primary/50 bg-black/40 text-rz-primary focus:ring-rz-primary focus:ring-offset-0 accent-[var(--rz-primary)]"
          />
          <label htmlFor="autoRevive" className="text-sm text-white/80">{t('auto_revive')}</label>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-white/80">
                {t('spawn_points')}
              </span>
              <span className="text-[11px] text-white/40">
                {t('spawn_points_hint')}
              </span>
            </div>
            <span className="text-[11px] text-white/50 font-semibold">
              {spawnPoints.length}
            </span>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (isEnvBrowser()) return
              const result = await fetchNui<{ cancelled?: boolean; spawnPoints?: SpawnPoint[] }>(
                'redzone:startSpawnPointPlacement',
                { spawnPoints }
              )
              if (result && !result.cancelled && result.spawnPoints) {
                setSpawnPoints(result.spawnPoints)
              }
            }}
            className="text-sm py-2 px-3 border border-rz-primary/40 hover:bg-rz-primary/20 text-white rounded transition-colors"
          >
            {t('place_spawn_points')}
          </button>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {spawnPoints.map((sp, i) => (
              <div key={i} className="flex items-center gap-2 bg-black/30 rounded px-2 py-1.5 border border-rz-primary/20">
                <span className="text-xs text-white/70 flex-1 truncate">
                  #{i + 1} · {sp.x.toFixed(1)}, {sp.y.toFixed(1)}, {sp.z.toFixed(1)}
                  {sp.heading != null ? ` · ${sp.heading}°` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (isEnvBrowser()) return
                    fetchNui('redzone:teleportTo', { x: sp.x, y: sp.y, z: sp.z, heading: sp.heading ?? 0 })
                  }}
                  className="text-white/40 hover:text-white/80 text-xs uppercase"
                >
                  {t('tp')}
                </button>
                <button
                  type="button"
                  onClick={() => setSpawnPoints((prev) => prev.filter((_, j) => j !== i))}
                  className="text-white/60 hover:text-rz-primary text-xs uppercase"
                >
                  {t('remove')}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              if (isEnvBrowser()) return
              const res = await fetchNui<{ success: boolean; coords?: Vector3 }>('redzone:getPlayerCoords')
              if (res?.success && res.coords) {
                setSpawnPoints((prev) => [...prev, { x: res.coords!.x, y: res.coords!.y, z: res.coords!.z }])
              }
            }}
            className="text-sm py-2 px-3 border border-rz-primary/40 hover:bg-rz-primary/20 text-white rounded transition-colors"
          >
            {t('add_spawn_at_position')}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          {t('section_presentation')}
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/80">{t('blip_name')}</label>
          <input
            type="text"
            value={blipName}
            onChange={(e) => setBlipName(e.target.value)}
            placeholder={t('blip_name_placeholder')}
            className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
          />
        </div>
        <BlipColourSelect value={blipColour} onChange={setBlipColour} />
        <MarkerColourSelect value={markerColour} onChange={setMarkerColour} />
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          {t('section_advanced')}
        </p>
        <LoadoutSelect loadoutItems={loadoutItems} value={loadout} onChange={setLoadout} />
        <KillstreakSelect
          killstreaks={killstreaks}
          loadoutItems={loadoutItems}
          onChange={setKillstreaks}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-rz-primary hover:bg-rz-primary/80 text-white font-bold text-sm uppercase tracking-wider rounded transition-colors"
        >
          {isEdit ? t('save') : t('create')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-rz-primary/40 hover:bg-rz-primary/20 text-white text-sm uppercase tracking-wider rounded transition-colors"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}
