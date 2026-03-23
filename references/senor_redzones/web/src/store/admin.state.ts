import { atom } from 'jotai'
import type { Zone, CreateZoneInput } from '@/types'

export const isAdminAtom = atom<boolean>(false)

export const adminZonesAtom = atom<Zone[]>([])

export const createZoneFormAtom = atom<Partial<CreateZoneInput>>({})
