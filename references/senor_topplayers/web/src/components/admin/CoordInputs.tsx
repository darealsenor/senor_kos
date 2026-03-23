import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchNui } from '@/utils/fetchNui'
import { useLocale } from '@/hooks/useLocale'
import type { Vector4 } from '@/types/admin'

interface CoordInputsProps {
  coords: Vector4
  onCoordsChange: (c: Vector4) => void
  invalid?: boolean
  getPlacementPayload?: () => Record<string, unknown> | null
}

export function CoordInputs({ coords, onCoordsChange, invalid, getPlacementPayload }: CoordInputsProps) {
  const { t } = useLocale()
  const set = (key: keyof Vector4, value: number) => {
    onCoordsChange({ ...coords, [key]: value })
  }

  const handleUseMyCoords = async () => {
    const result = await fetchNui<Vector4>('senor_topplayers:getPlayerCoords')
    if (result?.x != null) onCoordsChange(result)
  }

  const handleSelfPlacement = async () => {
    if (getPlacementPayload) {
      const payload = getPlacementPayload()
      if (payload === null) return
      await fetchNui('senor_topplayers:startPlacement', payload)
    } else {
      await fetchNui('senor_topplayers:startPlacement', {})
    }
  }

  const inputClass = `text-xs focus-visible:ring-primary ${invalid ? 'border-destructive focus-visible:ring-destructive' : ''}`
  return (
    <div className="space-y-2">
      <Label className={invalid ? 'text-destructive' : ''}>{t('coords')}</Label>
      <div className="flex flex-wrap items-center gap-1">
        <Input
          type="number"
          step="any"
          className={`w-16 ${inputClass}`}
          placeholder="X"
          value={coords.x === 0 ? '' : coords.x}
          onChange={(e) => set('x', parseFloat(e.target.value) || 0)}
        />
        <Input
          type="number"
          step="any"
          className={`w-16 ${inputClass}`}
          placeholder="Y"
          value={coords.y === 0 ? '' : coords.y}
          onChange={(e) => set('y', parseFloat(e.target.value) || 0)}
        />
        <Input
          type="number"
          step="any"
          className={`w-16 ${inputClass}`}
          placeholder="Z"
          value={coords.z === 0 ? '' : coords.z}
          onChange={(e) => set('z', parseFloat(e.target.value) || 0)}
        />
        <Input
          type="number"
          step="any"
          className={`w-14 ${inputClass}`}
          placeholder="H"
          value={coords.w === 0 ? '' : coords.w}
          onChange={(e) => set('w', parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Button type="button" variant="outline" size="sm" className="w-full hover:border-primary hover:bg-primary/10" onClick={handleUseMyCoords}>
          {t('use_my_coords')}
        </Button>
        <Button type="button" variant="outline" size="sm" className="w-full hover:border-primary hover:bg-primary/10" onClick={handleSelfPlacement}>
          {t('self_placement')}
        </Button>
      </div>
    </div>
  )
}
