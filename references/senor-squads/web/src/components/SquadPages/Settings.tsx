import React, { useEffect } from 'react'
import Content from '../Content'
import ToggleButton from '../ToggleButton'
import { useLocales } from '../../providers/LocaleProvider'
import BackButton from '../BackButton'
import useSettingsStore from '../../stores/settingsSlice'
import usePlayerStore from '../../stores/playerSlice'
import BlipColorPicker from '../BlipColorPicker'
import { EditIcon, MinusIcon, PlusIcon } from '../icons'
import { HudColorPicker } from '../HudColorPicker'
import Button from '../Button'

const Settings = () => {
  const { locale } = useLocales()
  const {
    hudOpen,
    toggleHud,
    hudHealthColor,
    setHudHealthColor,
    hudArmorColor,
    setHudArmorColor,
    showNameTags,
    toggleNameTags,
    showBlips,
    toggleBlips,
    blipsColor,
    setBlipsColor,
    editHud,
    toggleEditHud,
    hudLtr,
    setHudLtr,
    resetSettings,
    chatNotifications,
    toggleChatNotifications,
    hudMaxDisplayMode,
    setHudMaxDisplayMode,
    hudMaxDisplayValue,
    setHudMaxDisplayValue,
    hudMinimized,
    toggleHudMinimized,
    showRadioIcon,
    toggleShowRadioIcon,
  } = useSettingsStore()

  const { mySquad, setMySquad } = usePlayerStore()

  const handleEditHudPosition = () => {
    if (!mySquad) {
      setMySquad({
        players: {
          [1]: {
            name: 'senor fake player',
            serverId: 1,
            owner: true,
            image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
            talking: true,
            health: 100,
            armor: 45,
            entity: 0,
            network: 0,
            coords: { x: 0, y: 0, z: 0 },
          },
          [2]: {
            name: 'MOVE THE HUD',
            serverId: 2,
            owner: false,
            image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
            talking: false,
            health: 22,
            armor: 100,
            entity: 0,
            network: 0,
            coords: { x: 0, y: 0, z: 0 },
          },
        },
        name: 'TEST',
        image: 'https://wallpapers.com/images/hd/confused-patrick-random-pfp-x63wp9vs43cem64s.jpg',
        maxplayers: 4,
      })
    }

    toggleEditHud(!editHud)
  }

  useEffect(() => {
    if (mySquad?.name === 'TEST' && !editHud) {
      setMySquad(null)
    }
  }, [editHud, toggleEditHud, mySquad?.name, setMySquad])

  return (
    <div className="flex flex-col gap-1">
      <BackButton title={locale.ui_settings} />

      <div className="flex flex-col gap-[2px]">
        <Content className="flex justify-between items-center rounded-t-lg">
          <div className="flex flex-col items-start text-left">
            <span className="text-white font-gilroy font-semibold text-base">{locale.ui_hud_toggle}</span>
          </div>
          <ToggleButton active={hudOpen} onClick={() => toggleHud(!hudOpen)} />
        </Content>

        <HudColorPicker label={locale.ui_hud_health} color={hudHealthColor} onChange={setHudHealthColor} />
        <HudColorPicker label={locale.ui_hud_armor} color={hudArmorColor} onChange={setHudArmorColor} className="rounded-b-lg" />
      </div>

      <Content className="flex items-center justify-between rounded-md">
        <div className="flex flex-col items-start text-left">
          <span className="text-white font-gilroy font-semibold text-base">Hud Direction</span>
          <span className="text-white text-opacity-40 font-medium text-xs">LTR/RTL Direction</span>
        </div>
        <ToggleButton active={hudLtr} onClick={() => setHudLtr(!hudLtr)} />
      </Content>

      <Content className="flex items-center justify-between rounded-md">
        <div className="flex flex-col items-start text-left">
          <span className="text-white font-gilroy font-semibold text-base">{locale.ui_tags}</span>
          <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_tags_label}</span>
        </div>
        <ToggleButton active={showNameTags} onClick={() => toggleNameTags(!showNameTags)} />
      </Content>

      <div className="flex flex-col gap-[2px]">
        <Content className="flex items-center justify-between rounded-t-lg">
          <div className="flex flex-col items-start text-left">
            <span className="text-white font-gilroy font-semibold text-base">{locale.ui_blips}</span>
            <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_blips_label}</span>
          </div>
          <ToggleButton active={showBlips} onClick={() => toggleBlips(!showBlips)} />
        </Content>

        <div className="bg-white bg-opacity-[5%] px-3 py-1 flex items-center justify-between rounded-b-lg">
          <span className="text-white text-xs font-gilroy font-semibold">{locale.ui_blip_select_color}</span>
          <BlipColorPicker
            defaultColor={blipsColor.hex}
            onColorChange={(color: { hex: string; fivemId: number }) => setBlipsColor(color)}
          />
        </div>
      </div>

      {/* <div className="flex flex-col gap-[2px]">
        <Content className="flex items-center justify-between rounded-t-lg">
          <div className="flex flex-col items-start text-left">
            <span className="text-white font-gilroy font-semibold text-base">{locale.ui_voicechat}</span>
            <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_voicechat_label}</span>
          </div>
          <ToggleButton active />
        </Content>

        <div className="bg-white bg-opacity-[5%] px-3 py-1 flex items-center justify-between rounded-b-lg">
          <span className="text-white text-xs font-gilroy font-semibold">"Mouse 4"</span>
          <img src="./icons/keyboard.png" className="px-2 py-1 bg-accent rounded hover:cursor-pointer" />
        </div>
      </div> */}

      <Content className="flex items-center justify-between rounded-md py-2">
        <div className="flex flex-col items-start text-left">
          <span className="text-white font-gilroy font-semibold text-base">{locale.ui_hud_position}</span>
          <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_hud_position_label}</span>
        </div>
        <div className="p-2 bg-accent rounded">
          <EditIcon
            className="rounded hover:cursor-pointer fill-primary stroke-primary"
            onClick={handleEditHudPosition}
          />
        </div>
        {/* <img
          src="./icons/edit.png"
          className="p-2 bg-accent rounded hover:cursor-pointer"
          onClick={handleEditHudPosition}
        /> */}
      </Content>

      <Content className="flex items-center justify-between rounded-md">
        <div className="flex flex-col items-start text-left">
          <span className="text-white font-gilroy font-semibold text-base">{locale.ui_notifications_chat}</span>
          <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_notifications_chat_label}</span>
        </div>
        <ToggleButton active={chatNotifications} onClick={() => toggleChatNotifications(!chatNotifications)} />
      </Content>

      <Content className="flex items-center justify-between rounded-md">
        <div className="flex flex-col items-start text-left">
          <span className="text-white font-gilroy font-semibold text-base">{locale.ui_hud_minimized}</span>
          <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_hud_minimized_label}</span>
        </div>
        <ToggleButton active={hudMinimized} onClick={() => toggleHudMinimized(!hudMinimized)} />
      </Content>

      <Content className="flex items-center justify-between rounded-md">
        <div className="flex flex-col items-start text-left">
          <span className="text-white font-gilroy font-semibold text-base">{locale.ui_hud_radio_icon}</span>
          <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_hud_radio_icon_label}</span>
        </div>
        <ToggleButton active={showRadioIcon} onClick={() => toggleShowRadioIcon(!showRadioIcon)} />
      </Content>

      <Content className="flex items-center justify-between rounded-md">
        <div className="flex flex-col items-start text-left">
          <span className="text-white font-gilroy font-semibold text-base">{locale.ui_hud_max_players}</span>
          <span className="text-white text-opacity-40 font-medium text-xs">{locale.ui_hud_max_players_label}</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          {hudMaxDisplayMode === 'infinity' ? (
            <div
              className="py-[0.35rem] px-6 rounded font-gilroy font-semibold text-sm hover:cursor-pointer h-8 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--bg-accent)',
                color: 'var(--primary-color)',
              }}
              onClick={() => setHudMaxDisplayMode('number')}
            >
              ∞
            </div>
          ) : (
            <>
              <div
                className="bg-white bg-opacity-5 flex items-center justify-center rounded h-8 w-8 hover:cursor-pointer"
                onClick={() => {
                  const newValue = Math.max(hudMaxDisplayValue - 1, 1)
                  setHudMaxDisplayValue(newValue)
                }}
              >
                <MinusIcon />
              </div>

              <div
                className="py-[0.35rem] px-6 rounded font-gilroy font-semibold text-sm h-8 flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--bg-accent)',
                  color: 'var(--primary-color)',
                }}
              >
                {hudMaxDisplayValue}
              </div>

              <div
                className="bg-white bg-opacity-5 flex items-center justify-center rounded h-8 w-8 hover:cursor-pointer"
                onClick={() => {
                  const newValue = Math.min(hudMaxDisplayValue + 1, 32)
                  setHudMaxDisplayValue(newValue)
                }}
              >
                <PlusIcon />
              </div>

              <div
                className="bg-white bg-opacity-5 flex items-center justify-center rounded h-8 w-8 hover:cursor-pointer ml-1"
                onClick={() => setHudMaxDisplayMode('infinity')}
                title="Switch to infinity"
              >
                <span className="text-white text-opacity-60 font-semibold text-base">∞</span>
              </div>
            </>
          )}
        </div>
      </Content>

      {/* <div className="">
        <Content className="flex items-center justify-between rounded-md mt-2">
          <div className="flex flex-col items-start text-left">
            <span className="text-white font-gilroy font-semibold text-base">Hud Scale</span>
            <span className="text-white text-opacity-40 font-medium text-xs">Determine the scale of the hud ahi</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <div
              className="bg-white bg-opacity-5 flex items-center justify-center rounded h-8 w-8"
              onClick={() => {
                const newScale = Math.max(scale - 0.1, 0.1) // Ensure scale >= 0.1
                setScale(newScale)
              }}
            >
              <MinusIcon />
            </div>

            <div
              className="py-[0.35rem] px-6 rounded font-gilroy font-semibold text-sm hover:cursor-pointer h-8 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--bg-accent)',
                color: 'var(--primary-color)',
              }}
            >
              {scale.toFixed(1)}
            </div>

            <div
              className="bg-white bg-opacity-5 flex items-center justify-center rounded h-8 w-8"
              onClick={() => {
                const newScale = Math.min(scale + 0.1, 1.5)
                setScale(newScale)
              }}
            >
              <PlusIcon />
            </div>
          </div>
        </Content>
      </div> */}
    </div>
  )
}

const SettingsWithButton = () => {
  const { locale } = useLocales()
  const { resetSettings } = useSettingsStore()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <Settings />
      </div>
      <div className="flex-shrink-0 pt-2">
        <Button
          bgColor="rgba(255, 0, 0, 0.05)"
          color="#FF0000"
          icon="exit"
          text={locale.ui_settings_reset}
          textColor="text-[#FF0000]"
          onClick={() => resetSettings()}
        />
      </div>
    </div>
  )
}

export default SettingsWithButton
