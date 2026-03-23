import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useNuiEvent } from '@/hooks/useNuiEvent'
import { fetchNui } from '@/utils/fetchNui'

type LocaleData = Record<string, string>

type LocaleProviderState = {
  locale: LocaleData
  t: (key: string, ...args: (string | number)[]) => string
}

const initialState: LocaleProviderState = {
  locale: {},
  t: (key: string) => key,
}

const LocaleProviderContext = createContext<LocaleProviderState>(initialState)

export function LocaleProvider({
  children,
}: {
  children: ReactNode
}) {
  const [locale, setLocale] = useState<LocaleData>({})

  useNuiEvent('setLocale', (data: LocaleData) => {
    setLocale(data)
  })

  useEffect(() => {
    const requestLocale = async () => {
      try {
        await fetchNui('nuiLoaded')
      } catch (error) {
        console.error('[Locale] Failed to request locale data:', error)
      }
    }
    requestLocale()
  }, [])

  const t = (key: string, ...args: (string | number)[]): string => {
    const translation = locale[key]
    
    if (!translation) {
      if (Object.keys(locale).length > 0) {
        console.warn(`[Locale] Missing translation for key: ${key}`)
      }
      return key
    }

    if (args.length === 0) {
      return translation
    }

    let result = translation
    let argIndex = 0
    result = result.replace(/%[sd]/g, () => {
      if (argIndex < args.length) {
        return String(args[argIndex++])
      }
      return '%s'
    })

    return result
  }

  const value = {
    locale,
    t,
  }

  return (
    <LocaleProviderContext.Provider value={value}>
      {children}
    </LocaleProviderContext.Provider>
  )
}

export const useLocale = () => {
  const context = useContext(LocaleProviderContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}

