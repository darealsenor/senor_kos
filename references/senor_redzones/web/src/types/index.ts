export interface AdminFormDefaults {
  zoneRadius?: number
  durationKills?: number
  durationTime?: number
  blipColour?: number
  markerColour?: number[]
  hudPosition?: string
}

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface SpawnPoint {
  x: number
  y: number
  z: number
  heading?: number
}

export type ZoneType = 'permanent' | 'temporary'

export type DurationType = 'time' | 'kills'

export interface KillstreakReward {
  type: 'item' | 'money'
  name?: string
  amount: number
  metadata?: Record<string, unknown>
  account?: string
}

export interface MarkerColour {
  r: number
  g: number
  b: number
  a: number
}

export interface Zone {
  id: string | number
  name: string
  type: ZoneType
  coords: Vector3
  radius: number
  bucket: number
  durationType?: DurationType
  duration: number
  loadout: Array<{ name: string; amount?: number; metadata?: Record<string, unknown> }> | Record<string, number>
  killstreaks: Record<string | number, KillstreakReward>
  blipName?: string
  blipColour?: number
  markerColour?: MarkerColour | [number, number, number, number]
  enabled?: boolean
  autoRevive?: boolean
  spawnPoints?: SpawnPoint[]
  active?: boolean
  startTime?: number
}

export interface ZonePreset {
  id: number
  name: string
  data: {
    bucket?: number
    durationType?: DurationType
    duration?: number
    loadout?: Zone['loadout']
    killstreaks?: Zone['killstreaks']
    blipColour?: number
    markerColour?: MarkerColour | [number, number, number, number]
    spawnPoints?: SpawnPoint[]
    autoRevive?: boolean
  }
}

export interface ZonePlayerStats {
  playerId: number
  name?: string
  kills: number
  deaths: number
  streak: number
}

export type LeaderboardEntry = ZonePlayerStats

export interface ZoneLeaderboard {
  zoneId: string | number
  players: LeaderboardEntry[]
  totalKills: number
  /** Unix timestamp (seconds) when time-based zone ends. UI derives countdown from this. */
  endTime?: number
  durationType?: 'time' | 'kills'
  duration?: number
  currentPlayerId?: number
}

export interface EndOfZoneResults {
  zoneId: string | number
  zoneName: string
  topPlayers: LeaderboardEntry[]
  totalKills: number
  duration: number
}

export type NuiView = 'hidden' | 'hud' | 'scoreboard' | 'endResults' | 'adminPanel'

export interface CreateZoneInput {
  name: string
  coords: Vector3
  radius: number
  type?: ZoneType
  bucket?: number
  durationType?: DurationType
  duration?: number
  loadout?: Zone['loadout']
  killstreaks?: Zone['killstreaks']
  blipName?: string
  blipColour?: number
  markerColour?: MarkerColour | [number, number, number, number]
  enabled?: boolean
  autoRevive?: boolean
  spawnPoints?: SpawnPoint[]
}
