export type ThemeId =
  | 'slate'
  | 'stone'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'red'
  | 'rose'
  | 'orange'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'violet'

const VAR_KEYS = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--ring',
  '--radius',
] as const

export type ThemeVars = Partial<Record<(typeof VAR_KEYS)[number], string>>

const violet: ThemeVars = {
  '--background': '224 71.4% 4.1%',
  '--foreground': '210 20% 98%',
  '--card': '224 71.4% 4.1%',
  '--card-foreground': '210 20% 98%',
  '--popover': '224 71.4% 4.1%',
  '--popover-foreground': '210 20% 98%',
  '--primary': '263.4 70% 50.4%',
  '--primary-foreground': '210 20% 98%',
  '--secondary': '215 27.9% 16.9%',
  '--secondary-foreground': '210 20% 98%',
  '--muted': '215 27.9% 16.9%',
  '--muted-foreground': '217.9 10.6% 64.9%',
  '--accent': '215 27.9% 16.9%',
  '--accent-foreground': '210 20% 98%',
  '--destructive': '0 62.8% 30.6%',
  '--destructive-foreground': '210 20% 98%',
  '--border': '215 27.9% 16.9%',
  '--input': '215 27.9% 16.9%',
  '--ring': '263.4 70% 50.4%',
  '--radius': '0.5rem',
}

const slate: ThemeVars = {
  '--background': '222.2 47.4% 11.2%',
  '--foreground': '210 40% 98%',
  '--card': '222.2 47.4% 11.2%',
  '--card-foreground': '210 40% 98%',
  '--popover': '222.2 47.4% 11.2%',
  '--popover-foreground': '210 40% 98%',
  '--primary': '210 40% 98%',
  '--primary-foreground': '222.2 47.4% 11.2%',
  '--secondary': '217.2 32.6% 17.5%',
  '--secondary-foreground': '210 40% 98%',
  '--muted': '217.2 32.6% 17.5%',
  '--muted-foreground': '215 20.2% 65.1%',
  '--accent': '217.2 32.6% 17.5%',
  '--accent-foreground': '210 40% 98%',
  '--destructive': '0 62.8% 30.6%',
  '--destructive-foreground': '210 40% 98%',
  '--border': '217.2 32.6% 17.5%',
  '--input': '217.2 32.6% 17.5%',
  '--ring': '212.7 26.8% 83.9%',
  '--radius': '0.5rem',
}

const stone: ThemeVars = {
  '--background': '20 14.3% 4.1%',
  '--foreground': '60 9.1% 97.8%',
  '--card': '20 14.3% 4.1%',
  '--card-foreground': '60 9.1% 97.8%',
  '--popover': '20 14.3% 4.1%',
  '--popover-foreground': '60 9.1% 97.8%',
  '--primary': '60 9.1% 97.8%',
  '--primary-foreground': '24 9.8% 10%',
  '--secondary': '24 9.8% 10%',
  '--secondary-foreground': '60 9.1% 97.8%',
  '--muted': '24 9.8% 10%',
  '--muted-foreground': '25 5.3% 44.7%',
  '--accent': '24 9.8% 10%',
  '--accent-foreground': '60 9.1% 97.8%',
  '--destructive': '0 62.8% 30.6%',
  '--destructive-foreground': '60 9.1% 97.8%',
  '--border': '24 9.8% 10%',
  '--input': '24 9.8% 10%',
  '--ring': '60 9.1% 97.8%',
  '--radius': '0.5rem',
}

const zinc: ThemeVars = {
  '--background': '240 10% 3.9%',
  '--foreground': '0 0% 98%',
  '--card': '240 10% 3.9%',
  '--card-foreground': '0 0% 98%',
  '--popover': '240 10% 3.9%',
  '--popover-foreground': '0 0% 98%',
  '--primary': '0 0% 98%',
  '--primary-foreground': '240 5.9% 10%',
  '--secondary': '240 3.7% 15.9%',
  '--secondary-foreground': '0 0% 98%',
  '--muted': '240 3.7% 15.9%',
  '--muted-foreground': '240 5% 64.9%',
  '--accent': '240 3.7% 15.9%',
  '--accent-foreground': '0 0% 98%',
  '--destructive': '0 62.8% 30.6%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '240 3.7% 15.9%',
  '--input': '240 3.7% 15.9%',
  '--ring': '240 4.9% 83.9%',
  '--radius': '0.5rem',
}

const neutral: ThemeVars = {
  '--background': '0 0% 3.9%',
  '--foreground': '0 0% 98%',
  '--card': '0 0% 3.9%',
  '--card-foreground': '0 0% 98%',
  '--popover': '0 0% 3.9%',
  '--popover-foreground': '0 0% 98%',
  '--primary': '0 0% 98%',
  '--primary-foreground': '0 0% 9%',
  '--secondary': '0 0% 14.9%',
  '--secondary-foreground': '0 0% 98%',
  '--muted': '0 0% 14.9%',
  '--muted-foreground': '0 0% 63.9%',
  '--accent': '0 0% 14.9%',
  '--accent-foreground': '0 0% 98%',
  '--destructive': '0 62.8% 30.6%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '0 0% 14.9%',
  '--input': '0 0% 14.9%',
  '--ring': '0 0% 83.1%',
  '--radius': '0.5rem',
}

const red: ThemeVars = {
  ...neutral,
  '--primary': '0 72% 51%',
  '--primary-foreground': '0 0% 98%',
  '--ring': '0 72% 51%',
}

const rose: ThemeVars = {
  ...neutral,
  '--primary': '346.8 77.2% 49.8%',
  '--primary-foreground': '355.7 100% 97.3%',
  '--ring': '346.8 77.2% 49.8%',
}

const orange: ThemeVars = {
  ...neutral,
  '--primary': '24.6 95% 53.1%',
  '--primary-foreground': '60 9.1% 97.8%',
  '--ring': '24.6 95% 53.1%',
}

const green: ThemeVars = {
  ...neutral,
  '--primary': '142.1 76.2% 36.3%',
  '--primary-foreground': '355.7 100% 97.3%',
  '--ring': '142.1 76.2% 36.3%',
}

const blue: ThemeVars = {
  ...neutral,
  '--primary': '221.2 83.2% 53.3%',
  '--primary-foreground': '210 40% 98%',
  '--ring': '221.2 83.2% 53.3%',
}

const yellow: ThemeVars = {
  ...neutral,
  '--primary': '47.9 95.8% 53.1%',
  '--primary-foreground': '26 83.3% 14.1%',
  '--ring': '47.9 95.8% 53.1%',
}

export const THEMES: Record<ThemeId, ThemeVars> = {
  violet,
  slate,
  stone,
  gray: slate,
  zinc,
  neutral,
  red,
  rose,
  orange,
  green,
  blue,
  yellow,
}

const DEFAULT_THEME: ThemeId = 'violet'

export function getThemeVars(themeId: string | undefined): ThemeVars {
  const id = (themeId && THEMES[themeId as ThemeId]) ? (themeId as ThemeId) : DEFAULT_THEME
  return THEMES[id] ?? THEMES[DEFAULT_THEME]
}

export function applyTheme(themeId: string | undefined): void {
  const vars = getThemeVars(themeId)
  const root = document.documentElement
  for (const key of VAR_KEYS) {
    const v = vars[key]
    if (v != null) root.style.setProperty(key, v)
  }
}
