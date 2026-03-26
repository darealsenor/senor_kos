import { useNuiStore } from '@/store/nuiStore'

function formatLocaleMessage(template: string, args: Array<string | number>): string {
  if (args.length === 0) {
    return template
  }

  let idx = 0
  return template.replace(/%[sd]/g, () => {
    if (idx >= args.length) {
      return '%s'
    }
    const value = args[idx]
    idx += 1
    return String(value)
  })
}

export function useLocale() {
  const localeData = useNuiStore((s) => s.locale)
  const t = (key: string, ...args: Array<string | number>): string => {
    const str = localeData[key] ?? key
    return formatLocaleMessage(str, args)
  }
  return { t, localeData }
}
