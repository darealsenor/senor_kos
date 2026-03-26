import type { KosMatchPayload, MatchNuiMessage } from '@/types/match'


export function mockMatchPayload(): KosMatchPayload {
  const now = Math.floor(Date.now() / 1000)
  return {
    match: {
      id: 'dev',
      hostId: 1,
      state: 'in_progress',
      startedAt: now - 120,
      cleanupAt: now + 3600,
      serverTime: now,
    },
    map: { id: 'legion', name: 'Legion Square' },
    mode: { key: 'time_limit', killsToWinRound: null, roundSeconds: 600, seriesLength: 3 },
    series: { index: 2, total: 3, wins: { teamA: 1, teamB: 0 }, lastWinner: 'teamA' },
    round: {
      startedAt: now - 45,
      endsAt: now + 555,
      remainingSeconds: 555,
      durationSeconds: 600,
      kills: { teamA: 3, teamB: 2 },
      winner: null,
    },
    teams: { teamA: { matchKills: 5, players: 3 }, teamB: { matchKills: 4, players: 3 } },
    players: [
      { id: 1, name: 'You', team: 'teamA', alive: true, kills: 2, deaths: 0, headshots: 1, gang: null, avatar: null },
      { id: 2, name: 'Ally', team: 'teamA', alive: false, kills: 1, deaths: 1, headshots: 0, gang: null, avatar: null },
      { id: 3, name: 'Mate', team: 'teamA', alive: true, kills: 0, deaths: 2, headshots: 0, gang: null, avatar: null },
      { id: 4, name: 'Red', team: 'teamB', alive: true, kills: 2, deaths: 1, headshots: 0, gang: null, avatar: null },
      { id: 5, name: 'Blue', team: 'teamB', alive: false, kills: 1, deaths: 2, headshots: 1, gang: null, avatar: null },
      { id: 6, name: 'Fox', team: 'teamB', alive: true, kills: 1, deaths: 1, headshots: 0, gang: null, avatar: null },
    ],
  }
}

/**
 * Full NUI message shape including local player id for highlights and killfeed.
 */
export function mockMatchMessage(): MatchNuiMessage {
  return { match: mockMatchPayload(), localPlayerId: 1 }
}
