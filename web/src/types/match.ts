export type MatchState = 'pre_game' | 'in_progress' | 'post_game' | string

export interface MatchPlayerRow {
  id: number
  name?: string
  avatar?: string | null
  team: 'teamA' | 'teamB'
  gang?: { name?: string; label?: string } | null
  alive: boolean
  kills: number
  deaths: number
  headshots: number
}

export interface KosMatchPayload {
  match: {
    id: string
    hostId: number
    state: MatchState
    startedAt: number
    cleanupAt: number
    serverTime: number
  }
  map?: { id: string; name: string } | null
  mode: {
    key: string
    killsToWinRound?: number | null
    roundSeconds: number
    seriesLength: number
  }
  series: {
    index: number
    total: number
    wins: { teamA: number; teamB: number }
    lastWinner?: string | null
  }
  round: {
    startedAt: number | null
    endsAt: number | null
    remainingSeconds: number | null
    durationSeconds: number
    kills: { teamA: number; teamB: number }
    winner?: string | null
  }
  teams: {
    teamA: { matchKills: number; players: number; gang?: { name?: string; label?: string } | null }
    teamB: { matchKills: number; players: number; gang?: { name?: string; label?: string } | null }
  }
  players: MatchPlayerRow[]
}

export interface MatchNuiMessage {
  match: KosMatchPayload | null
  localPlayerId: number
}
