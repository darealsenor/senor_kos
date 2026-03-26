import { create } from 'zustand'
import type { MatchNuiMessage } from '@/types/match'
import type { KosMap } from '@/types/admin'
import type { UiConfig } from '@/types/ui'
import { isEnvBrowser } from '@/utils/misc'
import { mockMatchMessage } from '@/dev/mockMatch'

type BoolOrUpdater = boolean | ((prev: boolean) => boolean)

const defaultUiConfig: UiConfig = {
  colorScheme: {
    primary: '#ffffff',
    backgroundDark: '#000000',
    teamA: '#5b8cff',
    teamB: '#e85d4c',
  },
  components: {
    roundHud: true,
    scoreboard: true,
    killfeed: true,
  },
}

interface NuiStore {
  matchData: MatchNuiMessage | null
  scoreboardOpen: boolean
  adminOpen: boolean
  isAdmin: boolean
  menuMaps: KosMap[]
  uiConfig: UiConfig
  locale: Record<string, string>
  setMatchData: (payload: MatchNuiMessage | null) => void
  setScoreboardOpen: (v: BoolOrUpdater) => void
  setAdminOpen: (v: BoolOrUpdater) => void
  setIsAdmin: (v: BoolOrUpdater) => void
  setMenuMaps: (v: KosMap[] | ((prev: KosMap[]) => KosMap[])) => void
  setUiConfig: (v: UiConfig) => void
  setLocale: (v: Record<string, string>) => void
  toggleScoreboard: () => void
}

/**
 * Shared NUI view state: Lua pushes via useNuiEvent in App; DevTools edits the same store in the browser.
 */
export const useNuiStore = create<NuiStore>((set) => ({
  matchData: isEnvBrowser() ? mockMatchMessage() : null,
  scoreboardOpen: false,
  adminOpen: false,
  isAdmin: false,
  menuMaps: [],
  uiConfig: defaultUiConfig,
  locale: {},
  setMatchData: (payload) =>
    set((s) => ({
      matchData: payload,
      scoreboardOpen: payload?.match ? s.scoreboardOpen : false,
    })),
  setScoreboardOpen: (v) =>
    set((s) => ({
      scoreboardOpen: typeof v === 'function' ? (v as (p: boolean) => boolean)(s.scoreboardOpen) : v,
    })),
  setAdminOpen: (v) =>
    set((s) => ({
      adminOpen: typeof v === 'function' ? (v as (p: boolean) => boolean)(s.adminOpen) : v,
    })),
  setIsAdmin: (v) =>
    set((s) => ({
      isAdmin: typeof v === 'function' ? (v as (p: boolean) => boolean)(s.isAdmin) : v,
    })),
  setMenuMaps: (v) =>
    set((s) => ({
      menuMaps: typeof v === 'function' ? (v as (p: KosMap[]) => KosMap[])(s.menuMaps) : v,
    })),
  setUiConfig: (v) =>
    set(() => ({
      uiConfig: {
        colorScheme: { ...defaultUiConfig.colorScheme, ...(v?.colorScheme ?? {}) },
        components: { ...defaultUiConfig.components, ...(v?.components ?? {}) },
      },
    })),
  setLocale: (v) =>
    set(() => ({
      locale: v ?? {},
    })),
  toggleScoreboard: () => set((s) => ({ scoreboardOpen: !s.scoreboardOpen })),
}))
