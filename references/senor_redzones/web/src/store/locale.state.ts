import { atom } from 'jotai'
import { DEFAULT_LOCALE } from '@/data/locale'

export type LocaleDict = Record<string, string>

export const localeAtom = atom<LocaleDict>(DEFAULT_LOCALE)
