import * as React from 'react'
import { useEffect } from 'react'
import './App.css'
import { debugData } from '../utils/debugData'
import ChatContainer from './ChatContainer'
import ChatInput from './ChatInput'
import { fetchNui } from '../utils/fetchNui'
import Channels from './Channels'
import { useNuiEvent } from '../hooks/useNuiEvent'
import playerStore from '../store/PlayerStore'
import useSuggestionStore, { Suggestion } from '../store/suggestionStore'
import { Color, Tag } from '../store/messageStore'
import Settings from './Settings'
import useSettingsStore, { getDefaultSettings } from '../store/settingsStore'
import MuteModal from './MuteModal'
import './ChatPosition.css'
import './ChatSize.css'

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; countdown: number }
> {
  private countdownInterval: number | null = null

  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, countdown: 2 }
  }

  static getDerivedStateFromError() {
    return { hasError: true, countdown: 2 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat Error Boundary caught an error:', error, errorInfo)
    
    // Start countdown to hide NUI
    this.startCountdown()
  }

  startCountdown = () => {
    this.countdownInterval = setInterval(() => {
      this.setState(prevState => {
        if (prevState.countdown <= 1) {
          // Hide the NUI frame
          try {
            fetchNui('hideFrame')
          } catch (error) {
            console.error('Failed to hide frame:', error)
          }
          
          if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
            this.countdownInterval = null
          }
          
          return { ...prevState, countdown: 0 }
        }
        return { ...prevState, countdown: prevState.countdown - 1 }
      })
    }, 1000)
  }

  componentWillUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  }

  handleTryAgain = () => {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
      this.countdownInterval = null
    }
    this.setState({ hasError: false, countdown: 2 })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          background: 'rgba(255, 0, 0, 0.1)', 
          border: '1px solid red', 
          borderRadius: '4px',
          color: 'white',
          fontFamily: 'monospace',
          textAlign: 'center'
        }}>
          <h3>Chat Error</h3>
          <p>Something went wrong with the chat.</p>
          {this.state.countdown > 0 ? (
            <p>Auto-closing in {this.state.countdown} seconds...</p>
          ) : (
            <p>Chat closed. Use your chat key to reopen.</p>
          )}
          <button 
            onClick={this.handleTryAgain}
            style={{
              padding: '8px 16px',
              background: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Debug data for development mode
debugData([
  {
    action: 'nuiLoaded',
    data: {
      id: 1,
      tags: [
        { bgColor: 'rgba(34, 139, 230, 0.1)', color: '#228be6', text: 'Devid' },
        { bgColor: 'rgba(253, 126, 20, 0.1)', color: '#fd7e14', text: 'TX' },
        { bgColor: 'rgba(230, 126, 34, 0.1)', color: '#e67e22', text: 'Admin' },
        { bgColor: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6', text: 'Mod' },
        { bgColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', text: 'VIP' },
      ],
      colors: [
        { color: '#228be6', name: 'Blue', bgColor: 'rgba(34, 139, 230, 0.1)', id: 1 },
        { color: '#fd7e14', name: 'Orange', bgColor: 'rgba(253, 126, 20, 0.1)', id: 2 },
        { color: '#e74c3c', name: 'Red', bgColor: 'rgba(231, 76, 60, 0.1)', id: 3 },
        { color: '#2ecc71', name: 'Green', bgColor: 'rgba(46, 204, 113, 0.1)', id: 4 },
        { color: '#9b59b6', name: 'Purple', bgColor: 'rgba(155, 89, 182, 0.1)', id: 5 },
        { color: '#f1c40f', name: 'Yellow', bgColor: 'rgba(241, 196, 15, 0.1)', id: 6 },
        { color: '#1abc9c', name: 'Teal', bgColor: 'rgba(26, 188, 156, 0.1)', id: 7 },
        { color: '#e67e22', name: 'Carrot', bgColor: 'rgba(230, 126, 34, 0.1)', id: 8 },
      ],
      selectedTag: { bgColor: 'rgba(34, 139, 230, 0.1)', color: '#228be6', text: 'Devid' },
      selectedColor: { color: '#228be6', name: 'Blue', bgColor: 'rgba(34, 139, 230, 0.1)', id: 1 },
    },
  },
])

// This will set the NUI to visible if we are
// developing in browser
debugData([
  {
    action: 'setVisible',
    data: {
      box: true,
      input: true,
    },
  },
  {
    action: 'ON_SUGGESTION_ADD',
    data: [
      {
        name: '/mute',
        help: 'Mute a player for specified duration',
        params: ['playerId', 'duration', 'reason']
      },
      {
        name: '/me',
        help: 'Perform an action as your character',
        params: ['action']
      },
      {
        name: '/ooc',
        help: 'Send out-of-character message',
        params: ['message']
      },
      {
        name: '/car',
        help: 'Spawn a vehicle',
        params: ['model']
      },
      {
        name: '/tp',
        help: 'Teleport to a player or location',
        params: ['target']
      },
      {
        name: '/give',
        help: 'Give an item to a player',
        params: ['playerId', 'item', 'amount']
      },
      {
        name: '/kick',
        help: 'Kick a player from the server',
        params: ['playerId', 'reason']
      },
      {
        name: '/ban',
        help: 'Ban a player from the server',
        params: ['playerId', 'duration', 'reason']
      },
      {
        name: '/weather',
        help: 'Change the weather',
        params: ['weatherType']
      },
      {
        name: '/time',
        help: 'Set the time of day',
        params: ['hour']
      },
      {
        name: '/noclip',
        help: 'Toggle noclip mode',
        params: []
      },
      {
        name: '/godmode',
        help: 'Toggle god mode',
        params: []
      },
      {
        name: '/revive',
        help: 'Revive a player',
        params: ['playerId']
      },
      {
        name: '/heal',
        help: 'Heal a player',
        params: ['playerId']
      },
      {
        name: '/armor',
        help: 'Give armor to a player',
        params: ['playerId', 'amount']
      },
      {
        name: '/money',
        help: 'Give money to a player',
        params: ['playerId', 'type', 'amount']
      },
      {
        name: '/job',
        help: 'Set a player\'s job',
        params: ['playerId', 'job', 'grade']
      },
      {
        name: '/gang',
        help: 'Set a player\'s gang',
        params: ['playerId', 'gang', 'grade']
      },
      {
        name: '/house',
        help: 'Manage player houses',
        params: ['action', 'playerId']
      },
      {
        name: '/business',
        help: 'Manage player businesses',
        params: ['action', 'playerId']
      },
      {
        name: '/phone',
        help: 'Send a phone message',
        params: ['number', 'message']
      },
      {
        name: '/call',
        help: 'Make a phone call',
        params: ['number']
      },
      {
        name: '/sms',
        help: 'Send an SMS',
        params: ['number', 'message']
      },
      {
        name: '/ad',
        help: 'Post an advertisement',
        params: ['message']
      },
      {
        name: '/news',
        help: 'Post a news article',
        params: ['headline', 'content']
      },
      {
        name: '/police',
        help: 'Send a police radio message',
        params: ['message']
      },
      {
        name: '/ems',
        help: 'Send an EMS radio message',
        params: ['message']
      },
      {
        name: '/mechanic',
        help: 'Send a mechanic radio message',
        params: ['message']
      },
      {
        name: '/taxi',
        help: 'Send a taxi radio message',
        params: ['message']
      },
      {
        name: '/tow',
        help: 'Send a tow truck radio message',
        params: ['message']
      },
      {
        name: '/bank',
        help: 'Access bank functions',
        params: ['action', 'amount']
      },
      {
        name: '/atm',
        help: 'Access ATM functions',
        params: ['action', 'amount']
      },
      {
        name: '/inventory',
        help: 'Open inventory',
        params: []
      },
      {
        name: '/settings',
        help: 'Open settings menu',
        params: []
      },
      {
        name: '/help',
        help: 'Show help information',
        params: ['topic']
      },
      {
        name: '/rules',
        help: 'Show server rules',
        params: []
      },
      {
        name: '/discord',
        help: 'Get Discord invite link',
        params: []
      },
      {
        name: '/website',
        help: 'Get server website link',
        params: []
      },
      {
        name: '/donate',
        help: 'Get donation information',
        params: []
      }
    ]
  }
])

const App: React.FC = () => {
  const { setPlayerId, setColors, setTags, setPermissions } = playerStore()
  const { settings } = useSettingsStore()
  const { addSuggestion } = useSuggestionStore()
  const [muteConfig, setMuteConfig] = React.useState<{
    minTimeMinutes?: number
    maxTimeMinutes?: number
    reasons?: string[]
  } | null>(null)



  useEffect(() => {
    async function fetchId() {
      try {
        const retval: {
          id: number
          tags: Tag[]
          colors: Color[]
          selectedTag: Tag | undefined
          selectedColor: Color | undefined
          uiConfig?: {
            ColorPalette?: Array<{ color: string; name: string; bgColor: string; id: number }>
          }
          presets?: {
            enabled?: boolean
            default?: string
            presets?: Record<string, {
              profilePictures?: boolean
              emojis?: boolean
              chatTags?: boolean
              chatColors?: boolean
              channels?: boolean
              channelsMode?: 'outside' | 'inline'
              soundOnType?: boolean
              showChatOnNewMessage?: boolean
              chatLocation?: string
              chatSize?: string
              defaultMainColor?: number
              maxCustomTags?: number
            }>
          }
          muteConfig?: {
            minTimeMinutes?: number
            maxTimeMinutes?: number
            reasons?: string[]
          }
        } = await fetchNui('nuiLoaded')
        
        
        if (retval) {
          setPlayerId(retval.id || 1)
          
          if (retval.colors) setColors({ playerColors: retval.colors })
          if (retval.tags) setTags({ playerTags: retval.tags })
          
          if (retval.selectedTag) {
            const tags = Array.isArray(retval.selectedTag) ? retval.selectedTag : [retval.selectedTag]
            setTags({ selectedTags: tags })
          }
          
          if (retval.selectedColor) {
            setColors({ selectedColors: retval.selectedColor })
          }
          
          if (retval.muteConfig) setMuteConfig(retval.muteConfig)
          
          const { setSettings, settings: currentSettings } = useSettingsStore.getState()
          const defaults = getDefaultSettings()
          const updates: Partial<ReturnType<typeof useSettingsStore.getState>['settings']> = {}
          
          const presetDefaults: Partial<Settings> = { ...defaults }
          
          if (retval.uiConfig?.ColorPalette) {
            presetDefaults.colorPalette = retval.uiConfig.ColorPalette
            const isDefault = JSON.stringify(currentSettings.colorPalette) === JSON.stringify(defaults.colorPalette)
            if (isDefault) updates.colorPalette = retval.uiConfig.ColorPalette
          }
          
          if (retval.presets?.enabled && retval.presets.default && retval.presets.presets) {
            const preset = retval.presets.presets[retval.presets.default]
            
            if (preset) {
              const keys: (keyof typeof preset)[] = [
                'profilePictures', 'emojis', 'chatTags', 'chatColors',
                'channels', 'channelsMode', 'soundOnType', 'showChatOnNewMessage',
                'chatLocation', 'chatSize'
              ]
              
              for (const key of keys) {
                if (key !== 'defaultMainColor' && preset[key] !== undefined) {
                  const settingsKey = key as keyof typeof currentSettings
                  presetDefaults[settingsKey] = preset[key] as any
                  if (currentSettings[settingsKey] === defaults[settingsKey]) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (updates as any)[settingsKey] = preset[key]
                  }
                }
              }
              
              if (preset.defaultMainColor && retval.uiConfig?.ColorPalette) {
                const color = retval.uiConfig.ColorPalette.find(c => c.id === preset.defaultMainColor)
                if (color) {
                  presetDefaults.mainColor = color
                  const isDefault = currentSettings.mainColor?.id === defaults.mainColor?.id
                  if (isDefault) {
                    updates.mainColor = color
                  }
                }
              }
              
              if (preset.maxCustomTags !== undefined) {
                const { setMaxCustomTags } = playerStore.getState()
                setMaxCustomTags(preset.maxCustomTags)
              }
            }
          }
          
          const { setPresetDefaults } = useSettingsStore.getState()
          setPresetDefaults(presetDefaults as Settings)
          
          if (Object.keys(updates).length > 0) {
            setSettings(updates)
          }
        }
      } catch (err) {
        console.error('load error:', err)
        setPlayerId(1)
        setColors({ playerColors: [] })
        setTags({ playerTags: [] })
      }
    }

    fetchId()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useNuiEvent('ON_SUGGESTION_ADD', (suggestions: Suggestion[]) => {
    try {
      if (suggestions && Array.isArray(suggestions) && suggestions.length > 0) {
        // Validate suggestion data before adding
        const validSuggestions = suggestions.filter(s => 
          s && 
          typeof s === 'object' && 
          s.name && 
          typeof s.name === 'string' &&
          s.help !== undefined &&
          Array.isArray(s.params)
        )
        if (validSuggestions.length > 0) {
          addSuggestion(validSuggestions)
        }
      }
    } catch (error) {
      console.error('Failed to add suggestions:', error, suggestions)
    }
  })

  useNuiEvent('removeSuggestion', (name: string) => {
    try {
      if (name && typeof name === 'string') {
        const { removeSuggestion } = useSuggestionStore.getState()
        removeSuggestion(name)
      }
    } catch (error) {
      console.error('Failed to remove suggestion:', error, name)
    }
  })

  useNuiEvent('updateMeta', (data: {colors: Color[], tags: Tag[], selectedColor: Color, selectedTag: Tag | Tag[]}) => {
    try {
      if (data && typeof data === 'object') {
        if (data.colors && Array.isArray(data.colors)) {
          setColors({playerColors: data.colors, selectedColors: data.selectedColor || null})
        }
        if (data.tags && Array.isArray(data.tags)) {
          if (data.selectedTag) {
            if (Array.isArray(data.selectedTag)) {
              setTags({playerTags: data.tags, selectedTags: data.selectedTag})
            } else {
              setTags({playerTags: data.tags, selectedTags: [data.selectedTag]})
            }
          } else {
            setTags({playerTags: data.tags, selectedTags: []})
          }
        }
      }
    } catch (error) {
      console.error('Failed to update meta:', error)
    }
  })

  useNuiEvent('playerPermissions', (permissions: {
    admin?: boolean
    mutePlayer?: boolean
    unmutePlayer?: boolean
    deleteMessage?: boolean
    accessStaffChannel?: boolean
    viewMuteStatus?: boolean
  }) => {
    try {
      if (permissions && typeof permissions === 'object') {
        setPermissions(permissions)
      }
    } catch (error) {
      console.error('Failed to set permissions:', error, permissions)
    }
  })

  return (
    <ErrorBoundary>
      <div className="nui-wrapper" style={{ '--main-color': settings.mainColor?.color || '#0D77D9' } as React.CSSProperties}>
        <div className={`chat-position-wrapper chat-position-${settings.chatLocation} chat-size-${settings.chatSize}`}>
          <Channels />
          <ChatContainer />
          <ChatInput />
        </div>
        <Settings />
        <MuteModal muteConfig={muteConfig} />
      </div>
    </ErrorBoundary>
  )
}

export default App
