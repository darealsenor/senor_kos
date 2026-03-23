import L from 'leaflet'

export function createCircleMarkerIcon(hexColor: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background-color:${hexColor};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

export function createZoneMarkerIcon(hexColor: string, label: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative">
        <div style="width:20px;height:20px;border-radius:50%;background-color:${hexColor};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.5)"></div>
        ${label ? `<div style="position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:2px 6px;border-radius:4px;font-size:10px;white-space:nowrap">${label}</div>` : ''}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export function markerColourToHex(
  markerColour: { r: number; g: number; b: number } | [number, number, number, number] | undefined,
  defaultHex?: string
): string {
  const fallback = defaultHex ?? '#f20d18'
  if (!markerColour) return fallback
  const arr = Array.isArray(markerColour) ? markerColour : [markerColour.r, markerColour.g, markerColour.b]
  const [r, g, b] = arr
  return '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
}
