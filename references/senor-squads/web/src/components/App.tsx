import React, { useEffect, useState } from 'react'
import './App.css'
import { debugData } from '../utils/debugData'
import { useNuiEvent } from '../hooks/useNuiEvent'
import Squad from './Squad'
import Chat from './SquadPages/Chat'
import Hud from './SquadPages/Hud'
import PingWheel from './PingWheel'
import { isEnvBrowser } from '../utils/misc'
import Dev from './Dev'
import useStateSlice from '../stores/stateSlice'
import usePlayerStore, { MessageInterface, PersonalSquad, SquadPlayer } from '../stores/playerSlice'
import useSettingsStore from '../stores/settingsSlice'
import { fetchNui } from '../utils/fetchNui'
import { VisibilityProvider } from '../providers/VisibilityProvider'
import useInput from '../stores/inputSlice'
import useSquad, { Squad as SquadListItem } from '../stores/squadSlice'

// This will set the NUI to visible if we are
// developing in browser
debugData([
  {
    action: 'setVisible',
    data: {
      hud: true,
      container: true,
    },
  },
])

debugData([
  {
    action: 'setDesignConfig',
    data: {
      primaryColor: '#00FFAE',
      buttonBg: '#00CB8A',
      textGradient: 'background: linear-gradient(90deg, rgba(255, 255, 255, 0.75) 0%, rgba(153, 153, 153, 0.75) 100%)',
      containerBackground: 'linear-gradient(360deg, #0B0B0B 0%, #101A17 100%)',
      bgAccent: 'rgba(0, 255, 174, 0.05)',
      joinButton: 'rgba(136, 0, 255, 0.1)',
      validGradient: 'linear-gradient(90deg, rgba(0, 255, 174, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      backAccent: 'rgba(255, 0, 0, 0.05)',
    },
  },
])

const App: React.FC = () => {
  const [pingWheelVisible, setPingWheelVisible] = useState(false)
  const { setMySquad, updatePlayer, setPlayerId, addMessage, setIsOwner, clearMessages } = usePlayerStore()
  const {
    hudOpen,
    showNameTags,
    showBlips,
    blipsColor,
    chatNotifications,
    hudMaxDisplayMode,
    hudMaxDisplayValue,
    showRadioIcon,
    hudPosition,
  } = useSettingsStore()
  const { setSquadImage, setMaximumSquadPlayers } = useInput()
  const { setAvailableSquads } = useSquad()

  const { chat } = useStateSlice()

  useNuiEvent(
    'setDesignConfig',
    (data: {
      primaryColor: string
      buttonBg: string
      textGradient: string
      containerBackground: string
      bgAccent: string
      validGradient: string
      joinButton: string
      backAccent: string
    }) => {
      document.documentElement.style.setProperty('--primary-color', data.primaryColor)
      document.documentElement.style.setProperty('--button-bg', data.buttonBg)
      document.documentElement.style.setProperty('--text-gradient', data.textGradient)
      document.documentElement.style.setProperty('--container-bg', data.containerBackground)
      document.documentElement.style.setProperty('--bg-accent', data.bgAccent)
      document.documentElement.style.setProperty('--join-button', data.joinButton)
      document.documentElement.style.setProperty('--valid-gradient', data.validGradient)
      document.documentElement.style.setProperty('--back-accent', data.backAccent)
    },
  )

  useNuiEvent('setPlayerId', (playerId: number) => {
    setPlayerId(playerId)
  })

  useNuiEvent('setIsOwner', (isOwner: boolean) => {
    setIsOwner(isOwner)
  })

  useEffect(() => {
    fetchNui('nuiLoaded')
  }, [])

  useEffect(() => {
    fetchNui('newSettings', {
      Blips: {
        enabled: showBlips,
        color: blipsColor.fivemId,
      },
      Tags: showNameTags,
      Hud: hudOpen,
      Notifications: {
        chat: chatNotifications,
      },
      HudMaxDisplay: {
        mode: hudMaxDisplayMode,
        value: hudMaxDisplayValue,
      },
      ShowRadioIcon: showRadioIcon,
      HudPosition: hudPosition,
    })
  }, [hudOpen, showNameTags, showBlips, blipsColor, chatNotifications, hudMaxDisplayMode, hudMaxDisplayValue, showRadioIcon, hudPosition])

  // TODO: find a way to actually listen to these events even though if the main page is not streamed
  useNuiEvent('setMySquad', (squad: PersonalSquad | null) => {
    setMySquad(squad)
  })

  useNuiEvent('updatePlayer', (data: { serverId: number; data: Partial<SquadPlayer> }) => {
    updatePlayer(data.serverId, data.data)
  })

  useNuiEvent('NewMessage', (data: MessageInterface) => {
    addMessage(data)
  })

  useNuiEvent('ClearMessages', () => {
    clearMessages()
  })

  useNuiEvent('setInitialSquadImage', (image: string) => {
    setSquadImage(image)
  })

  useNuiEvent('setSquads', (squads: SquadListItem[]) => {
    setAvailableSquads(squads)
  })

  useNuiEvent('MaximumSquadPlayers', (MaximumSquadPlayers: number) => {
    setMaximumSquadPlayers(MaximumSquadPlayers)
  })

  useNuiEvent('setDefaultSettings', (defaultSettings: {
    hudOpen?: boolean
    showNameTags?: boolean
    showBlips?: boolean
    blipsColor?: { hex: string; fivemId: number }
    chatNotifications?: boolean
    hudMaxDisplayMode?: 'infinity' | 'number'
    hudMaxDisplayValue?: number
    hudMinimized?: boolean
    showRadioIcon?: boolean
    hudHealthColor?: string
    hudArmorColor?: string
    hudLtr?: boolean
    hudPosition?: { x: number; y: number }
    scale?: number
  }) => {
    const { setServerDefaults } = useSettingsStore.getState()
    setServerDefaults(defaultSettings)
  })

  useNuiEvent('resetSettings', () => {
    const { resetSettings } = useSettingsStore.getState()
    resetSettings()
    localStorage.removeItem('squad-server-defaults-applied')
  })

  useNuiEvent('openPingWheel', () => {
    setPingWheelVisible(true)
  })

  useNuiEvent('closePingWheel', () => {
    setPingWheelVisible(false)
  })

  return (
    <div className="nui-wrapper gap-3">
      <VisibilityProvider>
        <Squad />
        {chat && <Chat />}
      </VisibilityProvider>
      {hudOpen && <Hud />}
      <PingWheel visible={pingWheelVisible} onClose={() => setPingWheelVisible(false)} />
      {isEnvBrowser() && <Dev />}
    </div>
  )
}

export default App
