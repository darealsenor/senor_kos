import { atom } from 'jotai'
import type { ZoneLeaderboard, EndOfZoneResults } from '@/types'

export const leaderboardAtom = atom<ZoneLeaderboard | null>(null)

export const endResultsAtom = atom<EndOfZoneResults | null>(null)
