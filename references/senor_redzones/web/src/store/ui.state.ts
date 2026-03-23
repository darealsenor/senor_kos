import { atom } from 'jotai'
import type { NuiView } from '@/types'

export const nuiViewAtom = atom<NuiView>('hidden')

export const scoreboardOpenAtom = atom<boolean>(false)
