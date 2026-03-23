import { create } from 'zustand'

interface MuteModalState {
  open: boolean
  action: 'mute' | 'unmute'
  targetId: number | undefined
  openModal: (action: 'mute' | 'unmute', targetId?: number) => void
  closeModal: () => void
}

const useMuteModalStore = create<MuteModalState>((set) => ({
  open: false,
  action: 'mute',
  targetId: undefined,
  openModal: (action, targetId) => set({ open: true, action, targetId }),
  closeModal: () => set({ open: false, targetId: undefined })
}))

export default useMuteModalStore


