export type HudPosition =
  | 'top'
  | 'top-right'
  | 'top-left'
  | 'bottom'
  | 'bottom-right'
  | 'bottom-left'
  | 'center-right'
  | 'center-left'

export const DEFAULTS = {
  blipColour: 1,
  markerColour: [255, 42, 24, 120] as [number, number, number, number],
  hudPosition: 'top-right' as HudPosition,
  zoneRadius: 50,
  durationKills: 3,
  durationTime: 300,
} as const
