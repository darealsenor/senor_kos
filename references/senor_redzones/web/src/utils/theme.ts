const DEFAULT_PRIMARY = '#f20d18'
const DEFAULT_BACKGROUND_DARK = '#221011'

function hexToRgb(hex: string): string {
  const match = hex.replace(/^#/, '').match(/(.{2})(.{2})(.{2})/)
  if (!match) return '242, 13, 24'
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)].join(', ')
}

function isValidHex(hex: unknown): hex is string {
  return typeof hex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(hex)
}

export function applyTheme(theme?: { primary?: string; backgroundDark?: string } | null) {
  const root = document.documentElement
  const primary = theme?.primary && isValidHex(theme.primary) ? theme.primary : DEFAULT_PRIMARY
  const backgroundDark = theme?.backgroundDark && isValidHex(theme.backgroundDark) ? theme.backgroundDark : DEFAULT_BACKGROUND_DARK
  root.style.setProperty('--rz-primary', primary)
  root.style.setProperty('--rz-primary-rgb', hexToRgb(primary))
  root.style.setProperty('--rz-background-dark', backgroundDark)
  root.style.setProperty('--rz-background-dark-rgb', hexToRgb(backgroundDark))
}

export function getThemePrimary(): string {
  if (typeof document === 'undefined') return DEFAULT_PRIMARY
  const value = getComputedStyle(document.documentElement).getPropertyValue('--rz-primary').trim()
  return value || DEFAULT_PRIMARY
}
