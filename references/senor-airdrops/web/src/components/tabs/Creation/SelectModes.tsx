import React from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { IInput, OpenMenuData, AirdropSettings } from '@/types'
import { useLocale } from '@/providers/LocaleProvider'

interface SelectModesProps {
  config: OpenMenuData
  input: IInput
  setInput: React.Dispatch<React.SetStateAction<IInput>>
}

export const SelectModes: React.FC<SelectModesProps> = ({ config, input, setInput }) => {
  const availableModes = config.settings ?? {}
  const selectedModes = input.settings ?? {}
  const { t } = useLocale()

  const toggleMode = (mode: AirdropSettings) => {
    const isActive = selectedModes[mode] !== undefined
    setInput((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [mode]: isActive ? undefined : availableModes[mode],
      },
    }))
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{t('ui_select_airdrop_settings')}</Label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(availableModes).map(([key, label]) => {
          const isSelected = selectedModes[key as AirdropSettings] !== undefined
          return (
            <Badge
              key={key}
              variant="outline"
              onClick={() => toggleMode(key as AirdropSettings)}
              className={`cursor-pointer border px-3 py-1 rounded-full transition-colors transform hover:scale-105 ring-1 ring-transparent hover:ring-white ${
                isSelected ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {label}
            </Badge>
          )
        })}
      </div>
    </div>
  )
} 