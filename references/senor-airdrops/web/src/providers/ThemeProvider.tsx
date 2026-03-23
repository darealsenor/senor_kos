import { createContext, useEffect, useState } from "react"
import { useNuiEvent } from "@/hooks/useNuiEvent"

type Theme = "dark"

type ThemeConfig = {
  mode?: "dark" | "light"
  background?: string
  border?: string
  primary?: string
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useNuiEvent('setTheme', (themeConfig: ThemeConfig) => {
    const root = window.document.documentElement
    
    if (themeConfig.mode) {
      root.classList.remove("light", "dark")
      root.classList.add(themeConfig.mode)
    }
    
    if (themeConfig.background) {
      root.style.setProperty('--background', themeConfig.background, 'important')
      root.style.setProperty('--card', themeConfig.background, 'important')
    }
    if (themeConfig.border) {
      root.style.setProperty('--border', themeConfig.border, 'important')
      root.style.setProperty('--input', themeConfig.border, 'important')
    }
    if (themeConfig.primary) {
      root.style.setProperty('--primary', themeConfig.primary, 'important')
      root.style.setProperty('--ring', themeConfig.primary, 'important')
    }
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "dark") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

