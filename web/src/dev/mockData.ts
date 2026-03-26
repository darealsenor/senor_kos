import type {
  ActiveMatchActionResponse,
  ActiveMatchRow,
  GetActiveMatchesResponse,
  GetLeaderboardGangsResponse,
  GetLeaderboardPlayersResponse,
  GetMatchHistoryResponse,
  MatchHistoryDetail,
  MatchHistoryParticipant,
  GetOnlinePlayersResponse,
  LeaderboardGangRow,
  LeaderboardPlayerRow,
  MatchHistoryRow,
  OnlinePlayerRow,
} from '@/types/admin'

const MOCK_ONLINE_PLAYERS: OnlinePlayerRow[] = (() => {
  const names = [
    'Alpha',
    'Bravo',
    'Charlie',
    'Delta',
    'Echo',
    'Foxtrot',
    'Gambit',
    'Helix',
    'Ion',
    'Jade',
    'Kite',
    'Lumen',
    'Mantis',
    'Nova',
    'Orbit',
    'Pulse',
    'Quasar',
    'Raptor',
    'Sable',
    'Talon',
  ]
  return Array.from({ length: 40 }, (_, idx) => ({
    id: 100 + idx,
    name: names[idx % names.length],
    avatar: idx % 3 === 0 ? `https://cdn.discordapp.com/embed/avatars/${idx % 5}.png` : null,
  }))
})()

const FAKE_LEADERBOARD_PLAYERS: LeaderboardPlayerRow[] = (() => {
  const gangLabels = ['Crimson', 'BlueLine', 'NightShift', 'IronWolf', 'ViperCrew', 'StoneMason']
  return Array.from({ length: 120 }, (_, i) => {
    const gangIdx = i % gangLabels.length
    const wins = 120 - Math.floor(i / 2)
    const kills = 600 - i * 3
    const deaths = 200 + Math.floor(i / 3)

    return {
      identifier: `player:${i + 1}`,
      name: `Player ${i + 1}`,
      avatar: null,
      gang: { name: gangLabels[gangIdx], label: gangLabels[gangIdx] },
      kills,
      deaths,
      headshots: Math.floor(kills / 10),
      matchesPlayed: Math.floor(i / 2) + 1,
      wins: Math.max(0, wins),
      losses: Math.max(0, Math.floor(wins / 3)),
    }
  })
})()

const FAKE_LEADERBOARD_GANGS: LeaderboardGangRow[] = (() => {
  const keys = ['crim', 'blue', 'night', 'iron', 'viper', 'stone', 'ghost', 'ember']
  return keys.map((k, idx) => {
    const wins = 90 - idx * 7
    const kills = 300 + idx * 50

    return {
      gangKey: k,
      gangName: k.toUpperCase(),
      kills,
      deaths: 120 + idx * 30,
      matchesPlayed: 40 + idx * 6,
      wins: Math.max(0, wins),
      losses: Math.max(0, Math.floor(wins / 2)),
    }
  })
})()

export const getMockOnlinePlayers = (): GetOnlinePlayersResponse => {
  return { players: MOCK_ONLINE_PLAYERS }
}

export const makeMockLeaderboardPlayers = (
  query: string,
  limit: number,
  offset: number,
): GetLeaderboardPlayersResponse => {
  const q = query.trim().toLowerCase()

  const filtered = q
    ? FAKE_LEADERBOARD_PLAYERS.filter((p) => {
        const name = (p.name ?? '').toLowerCase()
        const gang = (p.gang?.label ?? '').toLowerCase()
        const ident = p.identifier.toLowerCase()
        return name.includes(q) || gang.includes(q) || ident.includes(q)
      })
    : FAKE_LEADERBOARD_PLAYERS

  return {
    rows: filtered.slice(offset, offset + limit),
    total: filtered.length,
  }
}

export const makeMockLeaderboardGangs = (
  query: string,
  limit: number,
  offset: number,
): GetLeaderboardGangsResponse => {
  const q = query.trim().toLowerCase()

  const filtered = q
    ? FAKE_LEADERBOARD_GANGS.filter((g) => {
        const name = g.gangName.toLowerCase()
        const key = g.gangKey.toLowerCase()
        return name.includes(q) || key.includes(q)
      })
    : FAKE_LEADERBOARD_GANGS

  return {
    rows: filtered.slice(offset, offset + limit),
    total: filtered.length,
  }
}

export const getMockMatchHistory = (limit: number, offset: number): GetMatchHistoryResponse => {
  const totalCount = 120
  const winners = ['teamA', 'teamB']
  const gangKeys = ['crim', 'blue', 'night', 'iron', 'viper', 'stone']
  const now = Date.now()

  const rows: MatchHistoryRow[] = []
  const end = Math.min(totalCount, offset + limit)
  for (let i = offset; i < end; i += 1) {
    const winnerTeam = winners[i % winners.length]
    const gangKey = gangKeys[i % gangKeys.length]
    const duration = 60 + (i % 12) * 10
    const endedAt = new Date(now - i * 3600_000).toISOString()

    rows.push({
      id: i + 1,
      matchId: `match_${String(100000 + i)}`,
      winnerTeam,
      winnerGang: { name: gangKey, label: gangKey.toUpperCase() },
      duration,
      endedAt,
    })
  }

  return { rows, nextOffset: offset + rows.length, total: totalCount }
}

export const getMockMatchHistoryDetail = (id: number): MatchHistoryDetail => {
  const winnerTeam = id % 2 === 0 ? 'teamA' : 'teamB'
  const loserTeam = winnerTeam === 'teamA' ? 'teamB' : 'teamA'
  const gangKeys = ['crim', 'blue', 'night', 'iron', 'viper', 'stone']
  const winnerGangKey = gangKeys[id % gangKeys.length]
  const loserGangKey = gangKeys[(id + 3) % gangKeys.length]

  const makeParticipant = (team: string, idx: number, gangKey: string): MatchHistoryParticipant => {
    const killsBase = team === winnerTeam ? 15 : 10
    const deathsBase = team === winnerTeam ? 8 : 12
    const headshots = team === winnerTeam ? 4 : 2
    const kills = killsBase + idx
    const deaths = deathsBase + Math.floor(idx / 2)

    return {
      source: 500 + id * 10 + idx,
      identifier: `player:${id}:${idx}`,
      name: `Player ${id}-${idx}`,
      team,
      gang: { name: gangKey, label: gangKey.toUpperCase() },
      stats: {
        kills,
        deaths,
        headshots,
      },
    }
  }

  const participants: MatchHistoryParticipant[] = []
  for (let i = 0; i < 5; i += 1) {
    participants.push(makeParticipant('teamA', i, winnerTeam === 'teamA' ? winnerGangKey : loserGangKey))
    participants.push(makeParticipant('teamB', i, winnerTeam === 'teamB' ? winnerGangKey : loserGangKey))
  }

  const winnerGang = winnerTeam === 'teamA'
    ? { name: winnerGangKey, label: winnerGangKey.toUpperCase() }
    : { name: winnerGangKey, label: winnerGangKey.toUpperCase() }

  return {
    id,
    matchId: `match_${String(100000 + id)}`,
    winnerTeam,
    winnerGang,
    duration: 360 + (id % 60),
    endedAt: new Date(Date.now() - id * 3600_000).toISOString(),
    participants,
  }
}

export const getMockActiveMatches = (): GetActiveMatchesResponse => {
  const matches: ActiveMatchRow[] = [
    {
      id: 'mock_a1',
      state: 'in_progress',
      mode: 'competitive',
      mapName: 'Legion Square',
      roundIndex: 2,
      roundTotal: 5,
      score: { teamA: 1, teamB: 0 },
      players: [
        { id: 101, name: 'Alpha', avatar: 'https://cdn.discordapp.com/embed/avatars/0.png', team: 'teamA', alive: true, kills: 3, deaths: 1 },
        { id: 102, name: 'Bravo', avatar: 'https://cdn.discordapp.com/embed/avatars/1.png', team: 'teamA', alive: false, kills: 1, deaths: 2 },
        { id: 201, name: 'Delta', avatar: 'https://cdn.discordapp.com/embed/avatars/2.png', team: 'teamB', alive: true, kills: 2, deaths: 2 },
        { id: 202, name: 'Echo', avatar: 'https://cdn.discordapp.com/embed/avatars/3.png', team: 'teamB', alive: true, kills: 1, deaths: 1 },
      ],
    },
  ]
  return {
    matches,
    canPlayerSpectate: true,
    isAdmin: true,
  }
}

export const getMockActiveMatchAction = (): ActiveMatchActionResponse => {
  return { ok: true }
}
