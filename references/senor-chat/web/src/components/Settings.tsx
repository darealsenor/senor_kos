import * as React from 'react'
import { Label, Switch } from 'radix-ui'

import './Settings.css'
import playerStore from '../store/PlayerStore'
import ChatTags from './ChatTags'
import ChatColors from './ChatColors'
import useSettingsStore from '../store/settingsStore'
import inputStore from '../store/inputStore'
import { useLocale } from '../providers/LocaleProvider'

const Settings: React.FC = () => {
  const { editMode, setEditMode, tags, colors } = playerStore()
  const { settings, setSettings, resetSettings, presetDefaults } = useSettingsStore()
  const { inputRef } = inputStore()
  const { t } = useLocale()
  

  // Escape key handling moved to VisibilityProvider.tsx for centralized key management

  const handleSave = () => {
    try {
      setEditMode(false)
      if (inputRef) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 100)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  React.useEffect(() => {
    if (!editMode && inputRef) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [editMode, inputRef])

  const handleResetSettings = () => {
    try {
      resetSettings()
    } catch (error) {
      console.error('Error resetting settings:', error)
    }
  }


  const handleNewMessage = (e: boolean) => {
    try {
      setSettings({ showChatOnNewMessage: e })
    } catch (error) {
      console.error('Error updating new message setting:', error)
    }
  }

  const handleSoundOnType = (e: boolean) => {
    try {
      setSettings({ soundOnType: e })
    } catch (error) {
      console.error('Error updating sound on type setting:', error)
    }
  }


  return (
    <>
      {editMode && (
        <div className="SettingsOverlay" onClick={() => setEditMode(false)} />
      )}
      <div className={`SettingsPanel ${editMode ? 'SettingsPanel--open' : ''}`}>
          <div className="SettingsPanel__header">
            <h2 className="SettingsPanel__title">{t('ui_chat_settings')}</h2>
            <button 
              className="SettingsPanel__close" 
              onClick={() => setEditMode(false)}
              aria-label={t('ui_close_settings')}
            >
              ×
            </button>
          </div>
          
          <div className="SettingsPanel__content">
            <div className="SettingsPanel__section">
              <h3 className="SettingsPanel__section-title">{t('ui_general')}</h3>
              

              <div className="SettingsPanel__setting">
                <Label.Root className="SettingsPanel__label" htmlFor="showChatOnNewMessage">
                  {t('ui_show_chat_new_message')}
                </Label.Root>
                <Switch.Root
                  className="SwitchRoot"
                  id="showChatOnNewMessage"
                  checked={settings.showChatOnNewMessage}
                  onCheckedChange={handleNewMessage}
                >
                  <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
              </div>

              <div className="SettingsPanel__setting">
                <Label.Root className="SettingsPanel__label" htmlFor="soundOnType">
                  {t('ui_sound_on_type')}
                </Label.Root>
                <Switch.Root
                  className="SwitchRoot"
                  id="soundOnType"
                  checked={settings.soundOnType}
                  onCheckedChange={handleSoundOnType}
                >
                  <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
              </div>

              {presetDefaults?.profilePictures !== false && (
                <div className="SettingsPanel__setting">
                  <Label.Root className="SettingsPanel__label" htmlFor="profilePictures">
                    {t('ui_profile_pictures')}
                  </Label.Root>
                  <Switch.Root
                    className="SwitchRoot"
                    id="profilePictures"
                    checked={settings.profilePictures}
                    onCheckedChange={(e) => setSettings({ profilePictures: e })}
                  >
                    <Switch.Thumb className="SwitchThumb" />
                  </Switch.Root>
                </div>
              )}

              <div className="SettingsPanel__setting">
                <Label.Root className="SettingsPanel__label" htmlFor="channels">
                  {t('ui_channels')}
                </Label.Root>
                <Switch.Root
                  className="SwitchRoot"
                  id="channels"
                  checked={settings.channels}
                  onCheckedChange={(e) => setSettings({ channels: e })}
                >
                  <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
              </div>

              {settings.channels && (
                <div className="SettingsPanel__setting SettingsPanel_setting-column">
                  <Label.Root className="SettingsPanel__label">{t('ui_channels_mode')}</Label.Root>
                  <div className="SettingsPanel__size-options">
                    {[
                      { value: 'outside', label: t('ui_outside') },
                      { value: 'inline', label: t('ui_inline') }
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        className={`SettingsPanel__size-button ${settings.channelsMode === mode.value ? 'SettingsPanel__size-button--active' : ''}`}
                        onClick={() => setSettings({ channelsMode: mode.value as 'outside' | 'inline' })}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="SettingsPanel__setting">
                <Label.Root className="SettingsPanel__label" htmlFor="chatTags">
                  {t('ui_chat_tags')}
                </Label.Root>
                <Switch.Root
                  className="SwitchRoot"
                  id="chatTags"
                  checked={settings.chatTags}
                  onCheckedChange={(e) => setSettings({ chatTags: e })}
                >
                  <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
              </div>

              <div className="SettingsPanel__setting">
                <Label.Root className="SettingsPanel__label" htmlFor="chatColors">
                  {t('ui_chat_colors')}
                </Label.Root>
                <Switch.Root
                  className="SwitchRoot"
                  id="chatColors"
                  checked={settings.chatColors}
                  onCheckedChange={(e) => setSettings({ chatColors: e })}
                >
                  <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
              </div>

              <div className="SettingsPanel__setting SettingsPanel_setting-column">
                <Label.Root className="SettingsPanel__label">{t('ui_position')}</Label.Root>
                <div className="SettingsPanel__position-grid">
                  {[
                    { pos: 'left-top', label: t('ui_left_top') },
                    { pos: 'center-top', label: t('ui_center_top') },
                    { pos: 'right-top', label: t('ui_right_top') },
                    { pos: 'left-center', label: t('ui_left_center') },
                    { pos: 'center-center', label: '', empty: true },
                    { pos: 'right-center', label: t('ui_right_center') },
                    { pos: 'left-bottom', label: t('ui_left_bottom') },
                    { pos: 'center-bottom', label: t('ui_center_bottom') },
                    { pos: 'right-bottom', label: t('ui_right_bottom') },
                  ].map((item) => (
                    item.empty ? (
                      <div key={item.pos} className="SettingsPanel__position-empty" />
                    ) : (
                      <button
                        key={item.pos}
                        className={`SettingsPanel__position-button ${settings.chatLocation === item.pos ? 'SettingsPanel__position-button--active' : ''}`}
                        onClick={() => setSettings({ chatLocation: item.pos })}
                      >
                        {item.label}
                      </button>
                    )
                  ))}
                </div>
              </div>

              <div className="SettingsPanel__setting SettingsPanel_setting-column">
                <Label.Root className="SettingsPanel__label">{t('ui_size')}</Label.Root>
                <div className="SettingsPanel__size-options">
                  {[
                    { value: 'small', label: t('ui_small') },
                    { value: 'medium', label: t('ui_medium') },
                    { value: 'large', label: t('ui_large') }
                  ].map((size) => (
                    <button
                      key={size.value}
                      className={`SettingsPanel__size-button ${settings.chatSize === size.value ? 'SettingsPanel__size-button--active' : ''}`}
                      onClick={() => setSettings({ chatSize: size.value })}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="SettingsPanel__setting SettingsPanel_setting-column">
                <Label.Root className="SettingsPanel__label">{t('ui_main_color')}</Label.Root>
                <div className="SettingsPanel__color-palette">
                  {settings.colorPalette && Array.isArray(settings.colorPalette) ? (
                    settings.colorPalette.map((color) => (
                      <button
                        key={color.id}
                        className={`SettingsPanel__color-button ${settings.mainColor?.id === color.id ? 'SettingsPanel__color-button--active' : ''}`}
                        style={{ backgroundColor: color.color }}
                        onClick={() => setSettings({ mainColor: color })}
                        title={color.name}
                      />
                    ))
                  ) : (
                    <div className="SettingsPanel__placeholder">{t('ui_no_color_palette')}</div>
                  )}
                </div>
              </div>

              <div className="SettingsPanel__appearance">
                <div className="SettingsPanel__appearance-item">
                  <Label.Root className="SettingsPanel__label" htmlFor="chatTagsSelect">
                    {t('ui_select_chat_tags')}
                  </Label.Root>
                  {tags.playerTags && tags.playerTags.length > 0 ? (
                    <ChatTags />
                  ) : (
                    <div className="SettingsPanel__placeholder">{t('ui_no_tags_available')}</div>
                  )}
                </div>

                <div className="SettingsPanel__appearance-item">
                  <Label.Root className="SettingsPanel__label" htmlFor="chatColorsSelect">
                    {t('ui_select_chat_colors')}
                  </Label.Root>
                  {colors.playerColors && colors.playerColors.length > 0 ? (
                    <ChatColors />
                  ) : (
                    <div className="SettingsPanel__placeholder">{t('ui_no_colors_available')}</div>
                  )}
                </div>
              </div>


            </div>

            <div className="SettingsPanel__actions">
              <button className="Button Button--secondary" onClick={handleResetSettings}>
                {t('ui_reset_settings')}
              </button>
              <button className="Button Button--primary" onClick={handleSave}>
                {t('ui_save_settings')}
              </button>
            </div>
          </div>
        </div>
    </>
  )
}

export default Settings
