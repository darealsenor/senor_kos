import { create } from 'zustand'
import type { MatchNuiMessage } from '@/types/match'
import { isEnvBrowser } from '@/utils/misc'
import { mockMatchMessage } from '@/dev/mockMatch'

type BoolOrUpdater = boolean | ((prev: boolean) => boolean)

interface NuiStore {
  matchData: MatchNuiMessage | null
  scoreboardOpen: boolean
  adminOpen: boolean
  setMatchData: (payload: MatchNuiMessage | null) => void
  setScoreboardOpen: (v: BoolOrUpdater) => void
  setAdminOpen: (v: BoolOrUpdater) => void
  toggleScoreboard: () => void
}

/**
 * Shared NUI view state: Lua pushes via useNuiEvent in App; DevTools edits the same store in the browser.
 */
export const useNuiStore = create<NuiStore>((set) => ({
  matchData: isEnvBrowser() ? mockMatchMessage() : null,
  scoreboardOpen: false,
  adminOpen: false,
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
  toggleScoreboard: () => set((s) => ({ scoreboardOpen: !s.scoreboardOpen })),
}))
