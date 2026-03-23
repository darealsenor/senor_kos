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
import { fetchNui } from '@/utils/fetchNui'
import { MapPin } from 'lucide-react'
import { useNuiEvent } from '@/hooks/useNuiEvent'
import { useAtomValue } from 'jotai'
import { propListAtom } from '@/store/admin.state'
import { useLocale } from '@/hooks/useLocale'
import type { Ped, Prop, Vector4, CreatePropInput } from '@/types/admin'
import { isCoordsValid } from '@/types/admin'

const DEFAULT_COORDS: Vector4 = { x: 0, y: 0, z: 0, w: 0 }

interface PropFormProps {
  prop: Prop | null
  onSave: (result?: { peds?: Ped[]; props?: Prop[] }) => void
  onCancel: () => void
}

export function PropForm({ prop: selectedProp, onSave, onCancel }: PropFormProps) {
  const { t } = useLocale()
  const propList = useAtomValue(propListAtom)
  const [coords, setCoords] = useState<Vector4>(DEFAULT_COORDS)
  const [propName, setPropName] = useState<string>('')
  const [label, setLabel] = useState<string>('')
  const [enabled, setEnabled] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useNuiEvent<Vector4>('placementResult', (data) => {
    if (data?.x != null) setCoords(data)
  })

  useEffect(() => {
    if (selectedProp) {
      setCoords(selectedProp.coords)
      setPropName(selectedProp.prop ?? '')
      setLabel(selectedProp.label ?? '')
      setEnabled(selectedProp.enabled)
    } else {
      setCoords(DEFAULT_COORDS)
      setPropName('')
      setLabel('')
      setEnabled(true)
    }
  }, [selectedProp])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!isCoordsValid(coords)) {
      setError(t('error_invalid_coords'))
      return
    }
    setSaving(true)
    const payload: CreatePropInput & { id?: number } = {
      coords,
      prop: propName || null,
      label: label || null,
      enabled,
    }
    if (selectedProp) payload.id = selectedProp.id
    const result = await fetchNui<{ success: boolean; peds?: Ped[]; props?: Prop[]; error?: string }>(
      'senor_topplayers:saveProp',
      payload
    )
    setSaving(false)
    if (result?.success) onSave(result)
    else if (result?.error) setError(t('error_' + result.error))
  }

  const options = propList

  const getPlacementPayload = (): Record<string, unknown> | null => {
    if (!propName || propName === '') {
      setError(t('error_select_prop_first'))
      return null
    }
    setError(null)
    return { propModel: propName }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      {selectedProp && (
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
      <div className="space-y-1">
        <Label>{t('prop_model')}</Label>
        <Select value={propName || '__none__'} onValueChange={(v) => { setPropName(v === '__none__' ? '' : v); setError(null) }}>
          <SelectTrigger className="h-8 hover:border-primary/50 focus:ring-primary">
            <SelectValue placeholder={t('select_prop')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{t('none')}</SelectItem>
            {options.map((p) => (
              <SelectItem key={p.model} value={p.model}>
                {String(p.label ?? p.model)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CoordInputs
        coords={coords}
        onCoordsChange={setCoords}
        invalid={!isCoordsValid(coords)}
        getPlacementPayload={getPlacementPayload}
      />
      <div className="space-y-1">
        <Label>{t('label')}</Label>
        <Input
          className="h-8 focus-visible:ring-primary"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('label')}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch id="prop-enabled" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="prop-enabled" className="text-xs">{t('enabled')}</Label>
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
