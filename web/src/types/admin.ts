export interface LeaderboardGangRow {
  gangKey: string
  gangName: string
  kills: number
  deaths: number
  matchesPlayed: number
  wins: number
  losses: number
}

export interface LeaderboardPlayerRow {
  identifier: string
  name?: string | null
  avatar?: string | null
  gang?: { name?: string; label?: string } | null
  kills: number
  deaths: number
  headshots: number
  matchesPlayed: number
  wins: number
  losses: number
}

export interface GetLeaderboardsResponse {
  players: LeaderboardPlayerRow[]
  gangs: LeaderboardGangRow[]
}

export interface GetLeaderboardPlayersResponse {
  rows: LeaderboardPlayerRow[]
  total: number
}

export interface GetLeaderboardGangsResponse {
  rows: LeaderboardGangRow[]
  total: number
}

export interface MatchHistoryRow {
  id: number
  matchId: string
  winnerTeam?: string | null
  winnerGang?: { name?: string; label?: string } | null
  duration: number
  endedAt: string | number
}

export interface MatchHistoryParticipant {
  source: number
  identifier: string
  name?: string | null
  team?: string | null
  gang?: { name?: string; label?: string } | null
  stats?: Record<string, unknown> | null
}

export interface MatchHistoryDetail extends MatchHistoryRow {
  participants: MatchHistoryParticipant[]
}

export interface GetMatchHistoryResponse {
  rows: MatchHistoryRow[]
  nextOffset?: number
  total?: number
}

export interface KosMap {
  id: string
  name: string
}

export interface OnlinePlayerRow {
  id: number
  name: string
  avatar?: string | null
}

export interface GetMapsResponse {
  maps: KosMap[]
}

export interface GetOnlinePlayersResponse {
  players: OnlinePlayerRow[]
}

export interface ActiveMatchPlayerRow {
  id: number
  name?: string | null
  avatar?: string | null
  team: 'teamA' | 'teamB'
  alive: boolean
  kills: number
  deaths: number
}

export interface ActiveMatchRow {
  id: string
  state: string
  mode: string
  mapName?: string | null
  roundIndex: number
  roundTotal: number
  score: {
    teamA: number
    teamB: number
  }
  players: ActiveMatchPlayerRow[]
}

export interface GetActiveMatchesResponse {
  matches: ActiveMatchRow[]
  canPlayerSpectate: boolean
  isAdmin: boolean
}

export interface ActiveMatchActionResponse {
  ok: boolean
  error?: string
}
