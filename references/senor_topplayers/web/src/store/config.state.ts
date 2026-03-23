import { atom } from 'jotai'
import { applyTheme } from '@/lib/themes'

export interface TopplayersConfig {
  locale: Record<string, string>
  appTitle: string
  theme?: string
}

const defaultConfig: TopplayersConfig = {
  locale: {},
  appTitle: 'Top Players',
}

export const configAtom = atom<TopplayersConfig>(defaultConfig)

export function formatLocaleMessage(str: string, ...args: (string | number)[]): string {
  if (args.length === 0) return str
  let i = 0
  return str.replace(/%s/g, () => String(args[i++] ?? ''))
}
