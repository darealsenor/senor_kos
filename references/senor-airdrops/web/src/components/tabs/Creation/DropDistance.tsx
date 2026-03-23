import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { IInput } from '@/types'
import { useLocale } from '@/providers/LocaleProvider'

interface DropDistanceProps {
  input: IInput
  setInput: React.Dispatch<React.SetStateAction<IInput>>
}

export const DropDistance: React.FC<DropDistanceProps> = ({ input, setInput }) => {
  const { t } = useLocale()
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="distance">{t('ui_distance')}</Label>
    <Input
      id="distance"
      type="number"
      value={input.distance}
      onChange={(e) => setInput((prev) => ({ ...prev, distance: Number(e.target.value) }))}
      className="w-[200px]"
      min={50}
      max={300}
      step={10}
    />
  </div>
  )
} 