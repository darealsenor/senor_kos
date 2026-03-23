export interface Vector4 {
  x: number
  y: number
  z: number
  w: number
}

export function isCoordsValid(c: Vector4): boolean {
  const x = Number(c?.x)
  const y = Number(c?.y)
  const z = Number(c?.z)
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return false
  return !(x === 0 && y === 0 && z === 0)
}

export interface PedAnimation {
  dict: string
  anim: string
  flag?: number
}

export interface Ped {
  id: number
  coords: Vector4
  category: string
  categoryRanking: number
  text: string | null
  label?: string | null
  identifier?: string | null
  enabled: boolean
  animation?: PedAnimation | null
}

export interface Prop {
  id: number
  coords: Vector4
  prop: string | null
  label?: string | null
  enabled: boolean
}

export type CreatePedInput = {
  coords: Vector4
  category?: string
  categoryRanking?: number
  text?: string | null
  label?: string | null
  identifier?: string | null
  enabled?: boolean
  animation?: PedAnimation | null
}

export type CreatePropInput = {
  coords: Vector4
  prop?: string | null
  label?: string | null
  enabled?: boolean
}

export interface SearchPlayerResult {
  identifier: string
  rp_name: string | null
  steam_name: string | null
}

export const ALLOWED_STAT_CATEGORIES = [
  'kills',
  'deaths',
  'damage',
  'headshots',
  'playtime',
  'money',
  'vehicles',
  'properties',
] as const

export type StatCategory = (typeof ALLOWED_STAT_CATEGORIES)[number]

export const DEFAULT_STAT_CATEGORY: StatCategory = 'kills'
