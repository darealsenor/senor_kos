import type { ZonePreset } from '@/types'
import { useLocale } from '@/hooks/useLocale'
import { SavePresetDialog } from './SavePresetDialog'

interface PresetSelectProps {
  presets: ZonePreset[]
  saveDialogOpen: boolean
  onSaveDialogOpenChange: (open: boolean) => void
  onLoad: (preset: ZonePreset) => void
  onSave: (name: string) => Promise<boolean>
}

export const PresetSelect = ({
  presets,
  saveDialogOpen,
  onSaveDialogOpenChange,
  onLoad,
  onSave,
}: PresetSelectProps) => {
  const { t } = useLocale()
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-white/80 font-medium">{t('presets')}</label>
      <div className="flex gap-2">
        <select
          value=""
          onChange={(e) => {
            const id = e.target.value
            if (!id) return
            const p = presets.find((x) => String(x.id) === id)
            if (p) onLoad(p)
            e.target.value = ''
          }}
          className="flex-1 bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
        >
          <option value="" className="bg-black text-white">
            {t('load_preset')}
          </option>
          {presets.map((p) => (
            <option key={p.id} value={p.id} className="bg-black text-white">
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onSaveDialogOpenChange(true)}
          className="px-3 py-2 bg-rz-primary/20 border border-rz-primary/40 hover:bg-rz-primary/30 rounded text-white text-xs font-medium uppercase"
        >
          {t('save_as_preset')}
        </button>
      </div>
      <SavePresetDialog
        open={saveDialogOpen}
        onOpenChange={onSaveDialogOpenChange}
        onSave={onSave}
      />
    </div>
  )
}
