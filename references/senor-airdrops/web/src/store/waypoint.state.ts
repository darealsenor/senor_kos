import { atom } from 'jotai'
import { Vector3 } from '@/types'

export const waypointAtom = atom<Vector3 | null>(null) 