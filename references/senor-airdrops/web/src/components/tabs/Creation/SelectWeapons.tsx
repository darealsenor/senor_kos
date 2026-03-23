import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IInput, OpenMenuData, AirdropWeapons } from '@/types'
import { useLocale } from '@/providers/LocaleProvider'

interface SelectWeaponsProps {
  config: OpenMenuData
  input: IInput
  setInput: React.Dispatch<React.SetStateAction<IInput>>
}

export const SelectWeapons: React.FC<SelectWeaponsProps> = ({ config, input, setInput }) => {
  const weaponEntries = Object.entries(config.weapons ?? {})
  const { t } = useLocale()

  const handleSelect = (value: AirdropWeapons) => {
    setInput((prev) => ({
      ...prev,
      weapons: value,
    }))
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="weapons">{t('ui_select_weapons')}</Label>
      <Select onValueChange={handleSelect} value={input.weapons}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder={t('ui_choose_weapon_type')} />
        </SelectTrigger>
        <SelectContent>
          {weaponEntries.map(([key, label]) => (
            <SelectItem key={key} value={key as AirdropWeapons}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 