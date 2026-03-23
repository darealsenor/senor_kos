import { useAtomValue } from 'jotai'
import { configAtom } from '@/store/config.state'
import { formatLocaleMessage } from '@/store/config.state'

export function useLocale() {
  const config = useAtomValue(configAtom)
  const appTitle = config.appTitle ?? 'Top Players'
  const t = (key: string, ...args: (string | number)[]): string => {
    const str = config.locale[key] ?? key
    return formatLocaleMessage(str, ...args)
  }
  return { t, appTitle }
}
