import { atom } from 'jotai'
import { HistoryEntry } from '@/types'

export const historyAtom = atom<HistoryEntry[]>([]) 