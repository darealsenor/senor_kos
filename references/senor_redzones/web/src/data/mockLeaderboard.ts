import type { LeaderboardEntry, ZoneLeaderboard, EndOfZoneResults } from '@/types'

export const MOCK_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { playerId: 1, name: 'PHANTOM_ACE', kills: 24, deaths: 8, streak: 6 },
  { playerId: 2, name: 'GHOST_RIFT', kills: 19, deaths: 12, streak: 3 },
  { playerId: 3, name: 'NEON_STRIKE', kills: 15, deaths: 10, streak: 2 },
  { playerId: 4, name: 'VOID_WALKER', kills: 12, deaths: 15, streak: 0 },
  { playerId: 5, name: 'CRIMSON_RAVEN', kills: 10, deaths: 18, streak: 1 },
  { playerId: 6, name: 'Shadow_Strike', kills: 8, deaths: 20, streak: 0 },
]

export const MOCK_CURRENT_PLAYER_ID = 4

export const MOCK_LEADERBOARD: ZoneLeaderboard = {
  zoneId: 'temp-1',
  players: MOCK_LEADERBOARD_ENTRIES,
  totalKills: 88,
  endTime: Math.floor(Date.now() / 1000) + 180,
  durationType: 'time',
  duration: 300,
  currentPlayerId: MOCK_CURRENT_PLAYER_ID,
}

export const MOCK_END_RESULTS: EndOfZoneResults = {
  zoneId: 'temp-1',
  zoneName: 'Zone 04',
  topPlayers: [
    { playerId: 1, name: 'V0RTEX_PHANTOM', kills: 28, deaths: 6, streak: 8 },
    { playerId: 2, name: 'SILVER_STRIKER', kills: 22, deaths: 10, streak: 5 },
    { playerId: 3, name: 'BRONZE_BEAST', kills: 18, deaths: 14, streak: 3 },
  ],
  totalKills: 150,
  duration: 1122,
}
