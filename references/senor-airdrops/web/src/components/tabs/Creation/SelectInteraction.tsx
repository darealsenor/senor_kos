import React from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IInput, OpenMenuData, Pickup } from '@/types'
import { useLocale } from '@/providers/LocaleProvider'

interface SelectInteractionProps {
  config: OpenMenuData
  input: IInput
  setInput: React.Dispatch<React.SetStateAction<IInput>>
}

export const SelectInteraction: React.FC<SelectInteractionProps> = ({ config, input, setInput }) => {
  const interactionOptions = config.interaction ?? {}
  const { t } = useLocale()

  const handleSelect = (value: string) => {
    setInput((prev) => ({
      ...prev,
      interaction: value as keyof typeof interactionOptions,
    }))
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="interaction">{t('ui_select_pickup_type')}</Label>
      <Select onValueChange={handleSelect} value={input.interaction}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder={t('ui_choose_pickup_type')} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(interactionOptions).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 