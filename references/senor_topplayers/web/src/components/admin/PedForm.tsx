import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CoordInputs } from './CoordInputs'
import { TextPlaceholderInput, DEFAULT_TEMPLATE } from './TextPlaceholderInput'
import { fetchNui } from '@/utils/fetchNui'
import { useNuiEvent } from '@/hooks/useNuiEvent'
import type { Ped, Prop, Vector4, CreatePedInput, SearchPlayerResult } from '@/types/admin'
import { isCoordsValid } from '@/types/admin'
import { ALLOWED_STAT_CATEGORIES, DEFAULT_STAT_CATEGORY } from '@/types/admin'
import { useLocale } from '@/hooks/useLocale'
import { useAtomValue } from 'jotai'
import { animPresetsAtom } from '@/store/admin.state'
import { MapPin, Search, UserX } from 'lucide-react'

const DEFAULT_COORDS: Vector4 = { x: 0, y: 0, z: 0, w: 0 }

interface PedFormProps {
  ped: Ped | null
  onSave: (result?: { peds?: Ped[]; props?: Prop[] }) => void
  onCancel: () => void
}

type SpawnByMode = 'rank' | 'player'

export function PedForm({ ped, onSave, onCancel }: PedFormProps) {
  const { t } = useLocale()
  const [coords, setCoords] = useState<Vector4>(DEFAULT_COORDS)
  const [category, setCategory] = useState<string>(DEFAULT_STAT_CATEGORY)
  const [categoryRanking, setCategoryRanking] = useState(1)
  const [text, setText] = useState<string>('')
  const [label, setLabel] = useState<string>('')
  const [spawnByMode, setSpawnByMode] = useState<SpawnByMode>('rank')
  const [selectedPlayer, setSelectedPlayer] = useState<SearchPlayerResult | null>(null)
  const [playerSearchQuery, setPlayerSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchPlayerResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchedOnce, setSearchedOnce] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [selectedAnimPresetId, setSelectedAnimPresetId] = useState<string>('none')
  const [saving, setSaving] = useState(false)
  const animPresets = useAtomValue(animPresetsAtom)
  const [error, setError] = useState<string | null>(null)

  useNuiEvent<Vector4>('placementResult', (data) => {
    if (data?.x != null) setCoords(data)
  })

  useEffect(() => {
    if (ped) {
      setCoords(ped.coords)
      setCategory(ped.category)
      setCategoryRanking(ped.categoryRanking)
      setText(ped.text ?? '')
      setLabel(ped.label ?? '')
      setEnabled(ped.enabled)
      if (ped.animation?.dict && ped.animation?.anim) {
        const match = animPresets.find((p) => p.dict === ped.animation!.dict && p.anim === ped.animation!.anim)
        setSelectedAnimPresetId(match?.id ?? 'none')
      } else {
        setSelectedAnimPresetId('none')
      }
      if (ped.identifier) {
        setSpawnByMode('player')
        setSelectedPlayer({ identifier: ped.identifier, rp_name: null, steam_name: null })
      } else {
        setSpawnByMode('rank')
        setSelectedPlayer(null)
      }
    } else {
      setCoords(DEFAULT_COORDS)
      setCategory(DEFAULT_STAT_CATEGORY)
      setCategoryRanking(1)
      setText(DEFAULT_TEMPLATE)
      setLabel('')
      setSpawnByMode('rank')
      setSelectedPlayer(null)
      setSearchResults([])
      setSearchedOnce(false)
      setEnabled(true)
      setSelectedAnimPresetId('none')
    }
  }, [ped, animPresets])

  const handleSearchPlayers = async () => {
    const q = playerSearchQuery.trim()
    if (!q) return
    setSearching(true)
    setSearchResults([])
    setSearchedOnce(true)
    const list = await fetchNui<SearchPlayerResult[]>('senor_topplayers:searchPlayers', { query: q })
    setSearchResults(Array.isArray(list) ? list : [])
    setSearching(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isCoordsValid(coords)) {
      setError(t('error_invalid_coords'))
      return
    }
    setSaving(true)
    const payload: CreatePedInput & { id?: number } = {
      coords,
      category,
      categoryRanking,
      text: text || null,
      label: label || null,
      identifier: spawnByMode === 'player' && selectedPlayer ? selectedPlayer.identifier : null,
      enabled,
      animation: (() => {
        if (selectedAnimPresetId === 'none' || !selectedAnimPresetId) return null
        const preset = animPresets.find((p) => p.id === selectedAnimPresetId)
        if (!preset || !preset.dict || !preset.anim) return null
        return { dict: preset.dict, anim: preset.anim, flag: preset.flag ?? 1 }
      })(),
    }
    if (ped) payload.id = ped.id
    const result = await fetchNui<{ success: boolean; peds?: Ped[]; props?: Prop[]; error?: string }>(
      'senor_topplayers:savePed',
      payload
    )
    setSaving(false)
    if (result?.success) onSave(result)
    else if (result?.error) setError(t('error_' + result.error))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      {ped && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full hover:border-primary hover:bg-primary/10"
          onClick={() => fetchNui('senor_topplayers:teleportTo', { coords })}
        >
          <MapPin className="h-3.5 w-3.5 mr-1.5" />
          {t('teleport_to')}
        </Button>
      )}
      <CoordInputs coords={coords} onCoordsChange={setCoords} invalid={!isCoordsValid(coords)} />
      <div className="space-y-1">
        <Label>{t('label')}</Label>
        <Input
          className="h-8 focus-visible:ring-primary"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('label')}
        />
      </div>
      <div className="space-y-1">
        <Label>{t('spawn_by')}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={spawnByMode === 'rank' ? 'secondary' : 'outline'}
            size="sm"
            className="flex-1 text-xs hover:border-primary hover:bg-primary/10"
            onClick={() => { setSpawnByMode('rank'); setSelectedPlayer(null); setSearchResults([]); setSearchedOnce(false) }}
          >
            {t('by_rank')}
          </Button>
          <Button
            type="button"
            variant={spawnByMode === 'player' ? 'secondary' : 'outline'}
            size="sm"
            className="flex-1 text-xs hover:border-primary hover:bg-primary/10"
            onClick={() => setSpawnByMode('player')}
          >
            {t('by_player')}
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <Label>{t('category')}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 hover:border-primary/50 focus:ring-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALLOWED_STAT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {spawnByMode === 'rank' && (
        <div className="space-y-1">
          <Label>{t('rank')}</Label>
          <Input
            type="number"
            min={1}
            className="h-8 focus-visible:ring-primary"
            value={categoryRanking}
            onChange={(e) => setCategoryRanking(Math.max(1, parseInt(e.target.value, 10) || 1))}
          />
        </div>
      )}
      {spawnByMode === 'player' && (
        <div className="space-y-1">
          <Label>{t('search_player')}</Label>
          <div className="flex gap-1">
            <Input
              className="h-8 flex-1 focus-visible:ring-primary"
              value={playerSearchQuery}
              onChange={(e) => setPlayerSearchQuery(e.target.value)}
              placeholder={t('search_player_placeholder')}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchPlayers())}
            />
            <Button type="button" variant="outline" size="sm" className="h-8 hover:border-primary hover:bg-primary/10" onClick={handleSearchPlayers} disabled={searching}>
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>
          {selectedPlayer && (
            <div className="flex items-center justify-between rounded border border-border bg-muted/20 px-2 py-1.5 text-xs">
              <span className="truncate">
                {selectedPlayer.rp_name || selectedPlayer.steam_name || selectedPlayer.identifier}
              </span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setSelectedPlayer(null)} aria-label={t('clear')}>
                <UserX className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="max-h-32 space-y-0.5 overflow-y-auto rounded border border-border p-1">
              {searchResults.map((r) => (
                <button
                  key={r.identifier}
                  type="button"
                  className="w-full rounded px-2 py-1 text-left text-xs hover:bg-primary/10"
                  onClick={() => { setSelectedPlayer(r); setSearchResults([]) }}
                >
                  {r.rp_name || r.steam_name || r.identifier}
                </button>
              ))}
            </div>
          )}
          {searchedOnce && searchResults.length === 0 && !searching && !selectedPlayer && (
            <p className="text-xs text-muted-foreground">{t('no_players_found')}</p>
          )}
        </div>
      )}
      <div className="space-y-1">
        <Label>{t('text')}</Label>
        <TextPlaceholderInput value={text} onChange={setText} category={category} id="ped-text" />
        <p className="text-[10px] text-muted-foreground">{t('text_color_hint')}</p>
      </div>
      <div className="space-y-1">
        <Label>{t('animation')}</Label>
        <Select value={selectedAnimPresetId || 'none'} onValueChange={setSelectedAnimPresetId}>
          <SelectTrigger className="h-8 text-xs hover:border-primary/50 focus:ring-primary">
            <SelectValue placeholder={t('animation')} />
          </SelectTrigger>
          <SelectContent>
            {(animPresets.length ? animPresets : [{ id: 'none', label: 'None', dict: '', anim: '', flag: 1 }]).map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="ped-enabled" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="ped-enabled" className="text-xs">{t('enabled')}</Label>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-1 pt-1">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? t('saving') : t('save')}
        </Button>
        <Button type="button" variant="outline" size="sm" className="hover:border-primary hover:bg-primary/10" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  )
}
