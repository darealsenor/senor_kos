import { useAtomValue } from 'jotai'
import { localeAtom } from '@/store/locale.state'
import { formatLocale } from '@/data/locale'

export function useLocale() {
  const locale = useAtomValue(localeAtom)
  return {
    t: (key: string, ...args: (string | number)[]): string => {
      const str = locale[key] ?? key
      return args.length > 0 ? formatLocale(str, ...args) : str
    },
  }
}
