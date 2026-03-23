import { atom } from 'jotai'
import type { HudPosition } from '@/data/defaults'
import { DEFAULTS } from '@/data/defaults'

export const hudPositionAtom = atom<HudPosition>(DEFAULTS.hudPosition)
export const scoreboardKeyAtom = atom<string>('B')

