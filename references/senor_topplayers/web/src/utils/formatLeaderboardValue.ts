import type { LeaderboardCategory } from '@/types/leaderboard'

export function formatLeaderboardValue(value: number, category: LeaderboardCategory): string {
  if (category === 'playtime') {
    const h = Math.floor(value / 3600)
    const m = Math.floor((value % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }
  return value.toLocaleString()
}
