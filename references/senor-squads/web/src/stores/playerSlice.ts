import { create } from 'zustand'

export interface MessageInterface {
  message: string
  time: number
  player: {
    name: SquadPlayer['name']
    serverId: SquadPlayer['serverId']
    image: SquadPlayer['image']
  }
}

export interface SquadPlayer {
  entity: number
  serverId: number
  image: string
  owner: boolean
  network: number
  health: number
  armor: number
  talking?: boolean
  isDead?: boolean
  coords: {
    x: number
    y: number
    z: number
  }
  name: string
}

export interface OfflineMember {
  isOwner: boolean
  name: string
  image: string
}

export interface PersonalSquad {
  players: Record<number, SquadPlayer>
  pendingMembers?: Record<string, OfflineMember>
  name: string
  image: string
  maxplayers: number
  messages?: MessageInterface[]
  password?: string
}

export interface PlayerInterface {
  playerId: number
  setPlayerId: (number: number) => void

  mySquad: PersonalSquad | null
  setMySquad: (squadData: PersonalSquad | null) => void
  updatePlayer: (serverId: number, data: Partial<SquadPlayer>) => void
  updatePlayersBulk: (updates: Record<number, Partial<SquadPlayer>>) => void
  removePlayer: (serverId: number) => void
  removePendingMember: (identifier: string) => void

  messages: MessageInterface[]
  addMessage: (Message: MessageInterface) => void
  clearMessages: () => void

  isOwner: boolean
  setIsOwner: (isOwner: boolean) => void

  squadEdit: boolean
  setSquadEdit: (bool: boolean) => void
}

const usePlayerStore = create<PlayerInterface>((set, get) => ({
  playerId: 1,
  setPlayerId: (playerId) => set({ playerId }),

  isOwner: false,
  setIsOwner: (isOwner: boolean) => set({ isOwner }),

  mySquad: null,

  setMySquad: (squadData) => {
    if (!squadData) {
      set({ mySquad: null })
      return
    }
    
    let players = squadData.players
    
    if (Array.isArray(players)) {
      const playersDict: Record<number, SquadPlayer> = {}
      for (const player of players) {
        if (player && typeof player.serverId === 'number') {
          playersDict[player.serverId] = player
        }
      }
      players = playersDict
    }
    
    set({ mySquad: { ...squadData, players } })
  },

  updatePlayer: (serverId, data) =>
    set((state) => {
      if (!state.mySquad) return state

      const currentPlayers = { ...state.mySquad.players }
      if (!currentPlayers[serverId]) return state

      currentPlayers[serverId] = { ...currentPlayers[serverId], ...data }

      return {
        mySquad: {
          ...state.mySquad,
          players: currentPlayers,
        },
      }
    }),

  updatePlayersBulk: (updates) =>
    set((state) => {
      if (!state.mySquad) return state

      const existingPlayers = { ...state.mySquad.players }
      for (const [key, value] of Object.entries(updates)) {
        const serverId = Number(key)
        if (!existingPlayers[serverId]) {
          continue
        }
        existingPlayers[serverId] = {
          ...existingPlayers[serverId],
          ...value,
        }
      }

      return {
        mySquad: {
          ...state.mySquad,
          players: existingPlayers,
        },
      }
    }),

  removePlayer: (serverId) =>
    set((state) => {
      if (!state.mySquad) return state

      const updatedPlayers = { ...state.mySquad.players }
      if (updatedPlayers[serverId]) {
        delete updatedPlayers[serverId]
      }

      return {
        mySquad: {
          ...state.mySquad,
          players: updatedPlayers,
        },
      }
    }),

  removePendingMember: (identifier) =>
    set((state) => {
      if (!state.mySquad?.pendingMembers) return state

      const pending = { ...state.mySquad.pendingMembers }
      if (pending[identifier]) {
        delete pending[identifier]
      }

      return {
        mySquad: {
          ...state.mySquad,
          pendingMembers: pending,
        },
      }
    }),

  messages: [],
  addMessage: (message: MessageInterface) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  clearMessages: () => set({ messages: [] }),

  squadEdit: false,
  setSquadEdit: (bool: boolean) =>
    set((state) => {
      // if (!state.isOwner) return state
      return { squadEdit: bool }
    }),
}))

export default usePlayerStore
