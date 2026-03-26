import { useNuiEvent } from '@/hooks/useNuiEvent'
import { useEffect } from 'react'
import { KOSMenu } from './admin/KOSMenu'
import { RoundHud } from '@/components/hud/RoundHud'
import { MatchScoreboard } from '@/components/scoreboard/MatchScoreboard'
import { Killfeed } from '@/components/killfeed/Killfeed'
import { useNuiStore } from '@/store/nuiStore'
import { nuiGetUiConfig, nuiGetUiLocale } from '@/utils/kosMenuNui'
import type { MatchNuiMessage } from '@/types/match'
import type { KosMap } from '@/types/admin'
import type { UiConfig } from '@/types/ui'

interface OpenMenuPayload {
  isAdmin?: boolean
  maps?: KosMap[]
}

const defaultUiConfig: UiConfig = {
  colorScheme: {
    primary: '#ffffff',
    backgroundDark: '#000000',
    teamA: '#5b8cff',
    teamB: '#e85d4c',
  },
  components: {
    roundHud: true,
    scoreboard: true,
    killfeed: true,
  },
}

function hexToRgb(input: string): string | null {
  const value = input.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(value)) {
    return null
  }
  const normalized = value.length === 3
    ? value.split('').map((ch) => ch + ch).join('')
    : value
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

function hexToRgbTuple(input: string): [number, number, number] | null {
  const value = input.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(value)) {
    return null
  }
  const normalized = value.length === 3
    ? value.split('').map((ch) => ch + ch).join('')
    : value
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const l = (max + min) / 2
  if (delta === 0) {
    return [0, 0, Math.round(l * 100)]
  }
  const s = delta / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (max === rn) {
    h = 60 * (((gn - bn) / delta) % 6)
  } else if (max === gn) {
    h = 60 * ((bn - rn) / delta + 2)
  } else {
    h = 60 * ((rn - gn) / delta + 4)
  }
  if (h < 0) {
    h += 360
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
}

function hslTokenString(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`
}

function clampLightness(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function setCssColorVar(variable: string, value?: string) {
  if (!value) {
    return
  }
  document.documentElement.style.setProperty(variable, value)
}

function applyUiColors(config: UiConfig) {
  const colors = config.colorScheme ?? {}
  setCssColorVar('--kos-primary', colors.primary)
  setCssColorVar('--kos-background-dark', colors.backgroundDark)
  setCssColorVar('--kos-team-a', colors.teamA)
  setCssColorVar('--kos-team-b', colors.teamB)
  const primaryRgb = colors.primary ? hexToRgb(colors.primary) : null
  const backgroundDarkRgb = colors.backgroundDark ? hexToRgb(colors.backgroundDark) : null
  const primaryTuple = colors.primary ? hexToRgbTuple(colors.primary) : null
  const backgroundTuple = colors.backgroundDark ? hexToRgbTuple(colors.backgroundDark) : null
  if (primaryRgb) {
    document.documentElement.style.setProperty('--kos-primary-rgb', primaryRgb)
  }
  if (backgroundDarkRgb) {
    document.documentElement.style.setProperty('--kos-background-dark-rgb', backgroundDarkRgb)
  }
  if (primaryTuple) {
    const [h, s, l] = rgbToHsl(primaryTuple[0], primaryTuple[1], primaryTuple[2])
    document.documentElement.style.setProperty('--primary', hslTokenString(h, s, l))
    document.documentElement.style.setProperty('--ring', hslTokenString(h, s, l))
    document.documentElement.style.setProperty('--primary-foreground', l >= 60 ? '0 0% 0%' : '0 0% 100%')
  }
  if (backgroundTuple) {
    const [h, s, l] = rgbToHsl(backgroundTuple[0], backgroundTuple[1], backgroundTuple[2])
    const cardL = clampLightness(l + 5)
    const accentL = clampLightness(l + 18)
    const mutedL = clampLightness(l + 18)
    const borderL = clampLightness(l + 18)
    document.documentElement.style.setProperty('--background', hslTokenString(h, s, l))
    document.documentElement.style.setProperty('--card', hslTokenString(h, s, cardL))
    document.documentElement.style.setProperty('--popover', hslTokenString(h, s, cardL))
    document.documentElement.style.setProperty('--secondary', hslTokenString(h, s, mutedL))
    document.documentElement.style.setProperty('--secondary-foreground', '0 0% 98%')
    document.documentElement.style.setProperty('--muted', hslTokenString(h, s, mutedL))
    document.documentElement.style.setProperty('--muted-foreground', '0 0% 65.1%')
    document.documentElement.style.setProperty('--accent', hslTokenString(h, s, accentL))
    document.documentElement.style.setProperty('--accent-foreground', '0 0% 98%')
    document.documentElement.style.setProperty('--border', hslTokenString(h, s, borderL))
    document.documentElement.style.setProperty('--input', hslTokenString(h, s, borderL))
    document.documentElement.style.setProperty('--foreground', '0 0% 98%')
    document.documentElement.style.setProperty('--card-foreground', '0 0% 98%')
    document.documentElement.style.setProperty('--popover-foreground', '0 0% 98%')
  }
}

/**
 * NUI root: match HUD, scoreboard, admin dialog, and killfeed stack.
 */
const App = () => {
  const matchData = useNuiStore((s) => s.matchData)
  const scoreboardOpen = useNuiStore((s) => s.scoreboardOpen)
  const adminOpen = useNuiStore((s) => s.adminOpen)
  const isAdmin = useNuiStore((s) => s.isAdmin)
  const setMatchData = useNuiStore((s) => s.setMatchData)
  const setAdminOpen = useNuiStore((s) => s.setAdminOpen)
  const setIsAdmin = useNuiStore((s) => s.setIsAdmin)
  const setMenuMaps = useNuiStore((s) => s.setMenuMaps)
  const uiConfig = useNuiStore((s) => s.uiConfig)
  const setUiConfig = useNuiStore((s) => s.setUiConfig)
  const setLocale = useNuiStore((s) => s.setLocale)
  const toggleScoreboard = useNuiStore((s) => s.toggleScoreboard)

  useEffect(() => {
    // load config on mount
    void (async () => {
      const config = await nuiGetUiConfig(defaultUiConfig)
      setUiConfig(config ?? defaultUiConfig)
      const locale = await nuiGetUiLocale({})
      setLocale(locale ?? {})
    })()
  }, [setLocale, setUiConfig])

  useEffect(() => {
    applyUiColors(uiConfig)
  }, [uiConfig])

  useNuiEvent<MatchNuiMessage | null>('matchData', (msg) => {
    setMatchData(msg ?? null)
  })

  useNuiEvent<OpenMenuPayload>('openMenu', (payload) => {
    setIsAdmin(Boolean(payload?.isAdmin))
    setAdminOpen(true)
    setMenuMaps(payload?.maps ?? [])
  })
  useNuiEvent('menuClosed', () => {
    setAdminOpen(false)
    setIsAdmin(false)
    setMenuMaps([])
  })
  useNuiEvent('scoreboardToggle', () => toggleScoreboard())
  useNuiEvent<Record<string, string>>('setLocale', (payload) => {
    setLocale(payload ?? {})
  })

  const payload = matchData?.match ?? null
  const localId = matchData?.localPlayerId ?? 0
  const showMatchLayers = Boolean(payload)
  const components = uiConfig.components ?? {}

  return (
    <div className="pointer-events-none fixed inset-0">
      {showMatchLayers && payload && (
        <>
          {components.roundHud !== false && <RoundHud data={payload} localPlayerId={localId} />}
          {components.killfeed !== false && <Killfeed localPlayerId={localId} />}
          {components.scoreboard !== false && (
            <MatchScoreboard data={payload} localPlayerId={localId} open={scoreboardOpen} />
          )}
        </>
      )}
      <KOSMenu open={adminOpen} onOpenChange={setAdminOpen} isAdmin={isAdmin} />
    </div>
  )
}

export default App
