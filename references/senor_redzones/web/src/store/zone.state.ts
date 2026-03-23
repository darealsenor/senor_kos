import { atom } from 'jotai'
import type { Zone } from '@/types'

export const zonesAtom = atom<Zone[]>([])

export const currentZoneAtom = atom<Zone | null>(null)
