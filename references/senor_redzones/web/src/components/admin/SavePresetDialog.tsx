import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/useLocale'

interface SavePresetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => Promise<boolean>
}

export const SavePresetDialog = ({ open, onOpenChange, onSave }: SavePresetDialogProps) => {
  const { t } = useLocale()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const ok = await onSave(name.trim())
    setSaving(false)
    if (ok) {
      setName('')
      onOpenChange(false)
    } else {
      setError(t('save_preset_failed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('save_preset_title')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-white/70">
          {t('save_preset_description')}
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          placeholder={t('save_preset_placeholder')}
          className="bg-black/40 border border-rz-primary/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-rz-primary w-full"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-rz-primary/40 bg-black/40 text-white hover:bg-rz-primary/20"
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="bg-rz-primary hover:bg-rz-primary/80 text-white"
          >
            {saving ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
