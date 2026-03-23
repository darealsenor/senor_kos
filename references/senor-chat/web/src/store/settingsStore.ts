import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ColorPaletteItem {
  color: string
  name: string
  bgColor: string
  id: number
}

interface Settings {
  closeChatAfterCommand: boolean
  soundOnType: boolean
  channels: boolean
  channelsMode: 'outside' | 'inline'
  profilePictures: boolean
  emojis: boolean
  chatTags: boolean
  chatColors: boolean
  showChatOnNewMessage: boolean
  colorPalette: ColorPaletteItem[]
  mainColor: ColorPaletteItem | null
  chatLocation: string
  chatSize: string
}

const getDefaultSettings = (): Settings => {
  const defaultColorPalette: ColorPaletteItem[] = [
    { color: '#228be6', name: 'Blue', bgColor: 'rgba(34, 139, 230, 0.1)', id: 1 },
    { color: '#fd7e14', name: 'Orange', bgColor: 'rgba(253, 126, 20, 0.1)', id: 2 },
    { color: '#e74c3c', name: 'Red', bgColor: 'rgba(231, 76, 60, 0.1)', id: 3 },
    { color: '#2ecc71', name: 'Green', bgColor: 'rgba(46, 204, 113, 0.1)', id: 4 },
    { color: '#9b59b6', name: 'Purple', bgColor: 'rgba(155, 89, 182, 0.1)', id: 5 },
    { color: '#f1c40f', name: 'Yellow', bgColor: 'rgba(241, 196, 15, 0.1)', id: 6 },
    { color: '#1abc9c', name: 'Teal', bgColor: 'rgba(26, 188, 156, 0.1)', id: 7 },
    { color: '#e67e22', name: 'Carrot', bgColor: 'rgba(230, 126, 34, 0.1)', id: 8 },
  ]

  return {
    closeChatAfterCommand: true,
    soundOnType: true,
    channels: true,
    channelsMode: 'outside',
    profilePictures: true,
    emojis: true,
    chatTags: true,
    chatColors: true,
    showChatOnNewMessage: false,
    colorPalette: defaultColorPalette,
    mainColor: defaultColorPalette[0] || null,
    chatLocation: 'left-bottom',
    chatSize: 'medium',
  }
}

const defaultSettings = getDefaultSettings()

export { getDefaultSettings }

const useSettingsStore = create(
  persist<{ 
    settings: Settings; 
    presetDefaults: Settings | null;
    setSettings: (newSettings: Partial<Settings>) => void;
    setPresetDefaults: (preset: Settings) => void;
    resetSettings: () => void;
  }>(
    (set, get) => ({
      settings: defaultSettings,
      presetDefaults: null,
      setSettings: (newSettings) =>
        set((state) => {
          const updatedSettings = { ...state.settings }
          
          if (newSettings.profilePictures !== undefined && state.presetDefaults?.profilePictures === false) {
            newSettings.profilePictures = false
          }
          
          return {
            settings: { ...updatedSettings, ...newSettings },
          }
        }),
      setPresetDefaults: (preset) => set({ presetDefaults: preset }),
      resetSettings: () => {
        const state = get()
        const resetTo = state.presetDefaults || defaultSettings
        set({ settings: resetTo })
      },
    }),
    {
      name: 'chat-settings-storage', // Saves to localStorage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      partialize: (state) => ({ settings: state.settings }) as any, // Only persist settings, not functions
      merge: (persistedState: unknown, currentState: { settings: Settings; presetDefaults: Settings | null; setSettings: (newSettings: Partial<Settings>) => void; setPresetDefaults: (preset: Settings) => void; resetSettings: () => void }) => {
        // Merge persisted state with current state, ensuring all new properties are included
        const persisted = persistedState as Partial<{ settings: Partial<Settings> }> | undefined
        if (persisted?.settings) {
          return {
            ...currentState,
            settings: {
              ...defaultSettings,
              ...persisted.settings,
            },
          }
        }
        return currentState
      },
    }
  )
)

export default useSettingsStore
