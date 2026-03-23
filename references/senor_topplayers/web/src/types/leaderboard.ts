export interface LeaderboardEntry {
  identifier: string | null
  rp_name: string | null
  steam_name: string | null
  avatar: string | null
  kills: number
  deaths: number
  damage: number
  headshots: number
  playtime: number
  money: number
  vehicles: number | null
  properties: number | null
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  total: number
  serverStats?: ServerStats
}

export interface ServerStats {
  kills: number
  deaths: number
  damage: number
  headshots: number
  playtime: number
  money: number
  vehicles: number
  properties: number
  players: number
}

export interface LeaderboardSelf {
  rank: number
  total: number
  rp_name: string | null
  steam_name: string | null
  avatar: string | null
  kills: number
  deaths: number
  damage: number
  headshots: number
  playtime: number
  money: number
  vehicles: number | null
  properties: number | null
}

export type LeaderboardCategory =
  | 'kills'
  | 'deaths'
  | 'damage'
  | 'headshots'
  | 'playtime'
  | 'money'
  | 'vehicles'
  | 'properties'

export const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  'kills',
  'deaths',
  'damage',
  'headshots',
  'playtime',
  'money',
  'vehicles',
  'properties',
]
