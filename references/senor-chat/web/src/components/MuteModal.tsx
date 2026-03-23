import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { fetchNui } from '../utils/fetchNui'
import { useNuiEvent } from '../hooks/useNuiEvent'
import useSettingsStore from '../store/settingsStore'
import useMuteModalStore from '../store/muteModalStore'
import { useLocale } from '../providers/LocaleProvider'
import './MuteModal.css'

interface MuteModalProps {
  action?: 'mute' | 'unmute'
  targetId?: number
}

interface MuteModalComponentProps {
  muteConfig?: {
    minTimeMinutes?: number
    maxTimeMinutes?: number
    reasons?: (string | { value: string; localeKey?: string })[]
  } | null
}

const MuteModal: React.FC<MuteModalComponentProps> = ({ muteConfig: muteConfigProp }) => {
  const { settings } = useSettingsStore()
  const { open, action, targetId: storeTargetId, openModal, closeModal } = useMuteModalStore()
  const { t } = useLocale()
  const [targetId, setTargetId] = React.useState<number | undefined>(undefined)
  const [durationMinutes, setDurationMinutes] = React.useState<number>(5)
  const [reason, setReason] = React.useState<string>('')
  const [selectedReason, setSelectedReason] = React.useState<string>('')
  const [customReason, setCustomReason] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  const muteConfig = muteConfigProp || {
    minTimeMinutes: 1,
    maxTimeMinutes: 1440,
    reasons: []
  }

  useNuiEvent('openMuteModal', (data: MuteModalProps) => {
    if (data) {
      openModal(data.action || 'mute', data.targetId)
      setTargetId(data.targetId)
      setDurationMinutes(5)
      setReason('')
      setSelectedReason('')
      setCustomReason('')
    }
  })
  
  React.useEffect(() => {
    if (open && storeTargetId) {
      setTargetId(storeTargetId)
      setDurationMinutes(5)
      setReason('')
      setSelectedReason('')
      setCustomReason('')
    }
  }, [open, storeTargetId])

  const minTime = muteConfig.minTimeMinutes || 1
  const maxTime = muteConfig.maxTimeMinutes || 1440
  const reasons = muteConfig.reasons || []

  const handleSubmit = async () => {
    if (!targetId) {
      return
    }

    if (action === 'unmute') {
      setLoading(true)
      try {
        await fetchNui('unmuteUser', {
          targetId
        })
        closeModal()
        fetchNui('hideInput')
      } catch (error) {
        console.error('Failed to unmute user:', error)
      } finally {
        setLoading(false)
      }
      return
    }

    if (!durationMinutes) {
      return
    }

    if (durationMinutes < minTime || durationMinutes > maxTime) {
      return
    }

    const finalReason = selectedReason === 'Custom' ? customReason : (selectedReason || reason || 'No reason provided')

    setLoading(true)
    try {
      await fetchNui('muteUser', {
        targetId,
        durationMinutes,
        reason: finalReason
      })
      closeModal()
      fetchNui('hideInput')
    } catch (error) {
      console.error('Failed to submit mute:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    closeModal()
    setDurationMinutes(5)
    setReason('')
    setSelectedReason('')
    setCustomReason('')
    fetchNui('hideInput')
  }

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        closeModal()
      }
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="MuteModalOverlay" />
        <Dialog.Content className="MuteModalContent" style={{ '--main-color': settings.mainColor?.color || '#0D77D9' } as React.CSSProperties}>
          <Dialog.Title className="MuteModalTitle">
            {action === 'unmute' ? t('ui_unmute_user') : t('ui_mute_user')}
          </Dialog.Title>
          
          {action === 'unmute' ? (
            <div className="MuteModalForm">
              <div className="MuteModalField">
                <label className="MuteModalLabel">{t('ui_user_id')}</label>
                <input
                  type="number"
                  className="MuteModalInput"
                  value={targetId || ''}
                  onChange={(e) => setTargetId(parseInt(e.target.value) || undefined)}
                  placeholder={t('ui_enter_user_id')}
                  min="1"
                />
              </div>
              <div className="MuteModalField">
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: 0 }}>
                  {t('ui_are_you_sure_unmute')}
                </p>
              </div>
            </div>
          ) : (
            <div className="MuteModalForm">
              <div className="MuteModalField">
                <label className="MuteModalLabel">{t('ui_user_id')}</label>
                <input
                  type="number"
                  className="MuteModalInput"
                  value={targetId || ''}
                  onChange={(e) => setTargetId(parseInt(e.target.value) || undefined)}
                  placeholder={t('ui_enter_user_id')}
                  min="1"
                />
              </div>

              <div className="MuteModalField">
                <label className="MuteModalLabel">
                  {t('ui_duration_minutes')} - {t('ui_min')}: {minTime}, {t('ui_max')}: {maxTime}
                </label>
                <input
                  type="number"
                  className="MuteModalInput"
                  value={durationMinutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    if (value >= minTime && value <= maxTime) {
                      setDurationMinutes(value)
                    }
                  }}
                  min={minTime}
                  max={maxTime}
                />
              </div>

              {reasons.length > 0 && (
                <div className="MuteModalField">
                  <label className="MuteModalLabel">{t('ui_reason')}</label>
                  <select
                    className="MuteModalSelect"
                    value={selectedReason}
                    onChange={(e) => {
                      setSelectedReason(e.target.value)
                      if (e.target.value !== 'Custom') {
                        setReason(e.target.value)
                      }
                    }}
                  >
                    <option value="">{t('ui_select_reason')}</option>
                    {reasons.map((r) => {
                      const reasonValue = typeof r === 'string' ? r : r.value
                      const reasonText = typeof r === 'string' ? r : (r.localeKey ? t(r.localeKey) : r.value)
                      return (
                        <option key={reasonValue} value={reasonValue}>
                          {reasonText}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              {selectedReason === 'Custom' && (
                <div className="MuteModalField">
                  <label className="MuteModalLabel">{t('ui_custom_reason')}</label>
                  <input
                    type="text"
                    className="MuteModalInput"
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value)
                      setReason(e.target.value)
                    }}
                    placeholder={t('ui_enter_custom_reason')}
                  />
                </div>
              )}

              {reasons.length === 0 && (
                <div className="MuteModalField">
                  <label className="MuteModalLabel">{t('ui_reason')}</label>
                  <input
                    type="text"
                    className="MuteModalInput"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t('ui_enter_reason')}
                  />
                </div>
              )}
            </div>
          )}

          <div className="MuteModalActions">
            <button
              className="MuteModalButton MuteModalButtonCancel"
              onClick={handleCancel}
              disabled={loading}
            >
              {t('ui_cancel')}
            </button>
            <button
              className="MuteModalButton MuteModalButtonSubmit"
              onClick={handleSubmit}
              disabled={loading || !targetId || (action !== 'unmute' && (durationMinutes < minTime || durationMinutes > maxTime))}
            >
              {loading ? t('ui_submitting') : action === 'unmute' ? t('ui_unmute') : t('ui_mute')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default MuteModal

