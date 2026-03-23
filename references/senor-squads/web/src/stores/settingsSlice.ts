import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type HudMaxDisplayMode = 'infinity' | 'number';

export interface DefaultSettings {
  hudOpen?: boolean;
  showNameTags?: boolean;
  showBlips?: boolean;
  blipsColor?: { hex: string; fivemId: number };
  chatNotifications?: boolean;
  hudMaxDisplayMode?: HudMaxDisplayMode;
  hudMaxDisplayValue?: number;
  hudMinimized?: boolean;
  showRadioIcon?: boolean;
  hudHealthColor?: string;
  hudArmorColor?: string;
  hudLtr?: boolean;
  hudPosition?: { x: number; y: number };
  scale?: number;
}

export interface SettingsInterface {
  hudOpen: boolean;
  toggleHud: (bool: boolean) => void;

  editHud: boolean;
  toggleEditHud: (bool: boolean) => void;

  hudHealthColor: string;
  setHudHealthColor: (color: string) => void;

  hudArmorColor: string;
  setHudArmorColor: (color: string) => void;

  showNameTags: boolean;
  toggleNameTags: (bool: boolean) => void;

  showBlips: boolean;
  toggleBlips: (bool: boolean) => void;

  blipsColor: { hex: string; fivemId: number };
  setBlipsColor: (color: { hex: string; fivemId: number }) => void;

  hudPosition: { x: number; y: number };
  setHudPosition: (x: number, y: number) => void;

  hudLtr: boolean;
  setHudLtr: (bool: boolean) => void;

  scale: number;
  setScale: (number: number) => void;

  chatNotifications: boolean;
  toggleChatNotifications: (bool: boolean) => void;

  hudMaxDisplayMode: HudMaxDisplayMode;
  setHudMaxDisplayMode: (mode: HudMaxDisplayMode) => void;

  hudMaxDisplayValue: number;
  setHudMaxDisplayValue: (value: number) => void;

  hudMinimized: boolean;
  toggleHudMinimized: (bool: boolean) => void;

  showRadioIcon: boolean;
  toggleShowRadioIcon: (bool: boolean) => void;

  serverDefaults: DefaultSettings | null;
  setServerDefaults: (defaults: DefaultSettings) => void;
  resetSettings: () => void;
}

const hardcodedDefaults: Omit<
  SettingsInterface,
  | 'toggleHud'
  | 'toggleEditHud'
  | 'setHudHealthColor'
  | 'setHudArmorColor'
  | 'toggleNameTags'
  | 'toggleBlips'
  | 'setBlipsColor'
  | 'setHudPosition'
  | 'setHudLtr'
  | 'resetSettings'
  | 'toggleChatNotifications'
  | 'setHudMaxDisplayMode'
  | 'setHudMaxDisplayValue'
  | 'toggleHudMinimized'
  | 'toggleShowRadioIcon'
  | 'setScale'
  | 'setServerDefaults'
  | 'serverDefaults'
> = {
  hudOpen: true,
  editHud: false,
  hudHealthColor: 'rgba(255, 255, 255, 1)',
  hudArmorColor: '#0084FF',
  showNameTags: true,
  showBlips: true,
  blipsColor: { hex: '#00FFFF', fivemId: 6 },
  hudPosition: { x: 0, y: 0 },
  hudLtr: false,
  scale: 1.0,
  chatNotifications: true,
  hudMaxDisplayMode: 'infinity',
  hudMaxDisplayValue: 4,
  hudMinimized: false,
  showRadioIcon: true,
};

const getDefaults = (serverDefaults: DefaultSettings | null) => {
  if (!serverDefaults) return hardcodedDefaults;
  
  return {
    ...hardcodedDefaults,
    ...(serverDefaults.hudOpen !== undefined && { hudOpen: serverDefaults.hudOpen }),
    ...(serverDefaults.showNameTags !== undefined && { showNameTags: serverDefaults.showNameTags }),
    ...(serverDefaults.showBlips !== undefined && { showBlips: serverDefaults.showBlips }),
    ...(serverDefaults.blipsColor !== undefined && { blipsColor: serverDefaults.blipsColor }),
    ...(serverDefaults.chatNotifications !== undefined && { chatNotifications: serverDefaults.chatNotifications }),
    ...(serverDefaults.hudMaxDisplayMode !== undefined && { hudMaxDisplayMode: serverDefaults.hudMaxDisplayMode }),
    ...(serverDefaults.hudMaxDisplayValue !== undefined && { hudMaxDisplayValue: serverDefaults.hudMaxDisplayValue }),
    ...(serverDefaults.hudMinimized !== undefined && { hudMinimized: serverDefaults.hudMinimized }),
    ...(serverDefaults.showRadioIcon !== undefined && { showRadioIcon: serverDefaults.showRadioIcon }),
    ...(serverDefaults.hudHealthColor !== undefined && { hudHealthColor: serverDefaults.hudHealthColor }),
    ...(serverDefaults.hudArmorColor !== undefined && { hudArmorColor: serverDefaults.hudArmorColor }),
    ...(serverDefaults.hudLtr !== undefined && { hudLtr: serverDefaults.hudLtr }),
    ...(serverDefaults.hudPosition !== undefined && { hudPosition: serverDefaults.hudPosition }),
    ...(serverDefaults.scale !== undefined && { scale: serverDefaults.scale }),
  };
};

const storageKey = 'squad-settings'
const serverDefaultsAppliedKey = 'squad-server-defaults-applied'

const shouldApplyServerDefaults = (): boolean => {
  try {
    const appliedFlag = localStorage.getItem(serverDefaultsAppliedKey)
    if (appliedFlag === 'true') {
      return false
    }
    
    return true
  } catch {
    return true
  }
}

export const useSettingsStore = create<SettingsInterface>()(
  persist(
    (set, get) => ({
      ...hardcodedDefaults,
      serverDefaults: null,
      setServerDefaults: (defaults: DefaultSettings) => {
        const currentState = get()
        if (!currentState.serverDefaults) {
          set({ serverDefaults: defaults })
          
          if (shouldApplyServerDefaults()) {
            const mergedDefaults = getDefaults(defaults)
            set({
              hudOpen: mergedDefaults.hudOpen,
              showNameTags: mergedDefaults.showNameTags,
              showBlips: mergedDefaults.showBlips,
              blipsColor: mergedDefaults.blipsColor,
              chatNotifications: mergedDefaults.chatNotifications,
              hudMaxDisplayMode: mergedDefaults.hudMaxDisplayMode,
              hudMaxDisplayValue: mergedDefaults.hudMaxDisplayValue,
              hudMinimized: mergedDefaults.hudMinimized,
              showRadioIcon: mergedDefaults.showRadioIcon,
              hudHealthColor: mergedDefaults.hudHealthColor,
              hudArmorColor: mergedDefaults.hudArmorColor,
              hudLtr: mergedDefaults.hudLtr,
              hudPosition: mergedDefaults.hudPosition,
              scale: mergedDefaults.scale,
            })
            localStorage.setItem(serverDefaultsAppliedKey, 'true')
          }
        }
      },
      toggleHud: (bool: boolean) => set({ hudOpen: bool }),
      toggleEditHud: (bool: boolean) => set({ editHud: bool }),
      setHudHealthColor: (color: string) => set({ hudHealthColor: color }),
      setHudArmorColor: (color: string) => set({ hudArmorColor: color }),
      toggleNameTags: (bool: boolean) => set({ showNameTags: bool }),
      toggleBlips: (bool: boolean) => set({ showBlips: bool }),
      setBlipsColor: (color: { hex: string; fivemId: number }) =>
        set({ blipsColor: color }),
      setHudPosition: (x: number, y: number) => set({ hudPosition: { x, y } }),
      setHudLtr: (bool: boolean) => set({ hudLtr: bool }),
      resetSettings: () => {
        const currentState = get()
        const serverDefaults = get().serverDefaults
        const defaults = getDefaults(serverDefaults)
        set({
          ...defaults,
          hudPosition: currentState.hudPosition,
          editHud: currentState.editHud,
        })
      },
      scale: 1.0,
      setScale: (number: number) => set({ scale: number }),
      toggleChatNotifications: (bool: boolean) => set({ chatNotifications: bool }),
      setHudMaxDisplayMode: (mode: HudMaxDisplayMode) => set({ hudMaxDisplayMode: mode }),
      setHudMaxDisplayValue: (value: number) => set({ hudMaxDisplayValue: value }),
      toggleHudMinimized: (bool: boolean) => set({ hudMinimized: bool }),
      toggleShowRadioIcon: (bool: boolean) => set({ showRadioIcon: bool }),
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const persisted: Partial<SettingsInterface> = { ...state }
        delete persisted.serverDefaults
        delete persisted.setServerDefaults
        return persisted
      },
    }
  )
);

export default useSettingsStore;