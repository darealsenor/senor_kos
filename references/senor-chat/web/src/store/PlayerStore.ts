import { create } from 'zustand'
import { Color, Tag } from './messageStore'

interface PlayerPermissions {
  admin?: boolean
  mutePlayer?: boolean
  unmutePlayer?: boolean
  deleteMessage?: boolean
  accessStaffChannel?: boolean
  viewMuteStatus?: boolean
}

interface PlayerStore {
  playerId: number
  setPlayerId: (playerId: number) => void
  editMode: boolean
  setEditMode: (editMode: boolean) => void
  Admin: boolean
  setAdmin: (bool: boolean) => void
  permissions: PlayerPermissions
  setPermissions: (permissions: PlayerPermissions) => void

  tags: {
    playerTags: Tag[]
    selectedTags: Tag[]
  }
  setTags: (tags: Partial<PlayerStore['tags']>) => void

  colors: {
    playerColors: Color[]
    selectedColors: Color | null
  }
  setColors: (colors: Partial<PlayerStore['colors']>) => void

  maxCustomTags: number
  setMaxCustomTags: (max: number) => void
}

const usePlayerStore = create<PlayerStore>((set) => ({
  playerId: 1,
  setPlayerId: (playerId) => set({ playerId }),
  editMode: false,
  setEditMode: (editMode) => set({ editMode }),
  Admin: true,
  setAdmin: (Admin) => set({ Admin }),
  permissions: {},
  setPermissions: (permissions) => set({ permissions }),

  tags: { playerTags: [], selectedTags: [] },
  setTags: (tags) => set((state) => ({ tags: { ...state.tags, ...tags } })),

  colors: { playerColors: [], selectedColors: null },
  setColors: (colors) => set((state) => ({ colors: { ...state.colors, ...colors } })),

  maxCustomTags: 2,
  setMaxCustomTags: (max) => set({ maxCustomTags: max }),
}))

export default usePlayerStore
