import {
  Swords,
  Skull,
  Zap,
  Crosshair,
  Clock,
  Banknote,
  Car,
  Home,
  type LucideIcon,
} from 'lucide-react'
import type { LeaderboardCategory } from '@/types/leaderboard'

export const CATEGORY_ICONS: Record<LeaderboardCategory, LucideIcon> = {
  kills: Swords,
  deaths: Skull,
  damage: Zap,
  headshots: Crosshair,
  playtime: Clock,
  money: Banknote,
  vehicles: Car,
  properties: Home,
}

