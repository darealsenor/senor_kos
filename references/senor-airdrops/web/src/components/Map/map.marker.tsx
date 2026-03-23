import L from 'leaflet'

export interface IMapMarker {
  x: number
  y: number
  color?: string
  icon?: string
  onClick?: () => void
  label?: string
}

export interface IMapCircles {
  center: number[],
  radius: number,
  pathOptions: {
    color: string;
    fillColor: string;
    fillOpacity: number;
    weight: number;
  }
}

export function createCircleMarkerHtml(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="w-[12px] h-[12px] rounded-full bg-${color}-500 border-[2px] border-white shadow-md"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

export function createLocationMarkerHtml(color: string, label?: string): L.DivIcon {
  return L.divIcon({
    className: 'location-marker',
    html: `
      <div class="relative">
        <div class="w-[20px] h-[20px] rounded-full bg-${color}-500 border-[2px] border-white shadow-md"></div>
        ${
          label
            ? `
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-800 shadow-sm whitespace-nowrap">
            ${label}
          </div>
        `
            : ''
        }
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export function getAirdropMarkerColor(timeLeft: number): string {
  if (timeLeft > 60 * 4) return '#00c853'
  if (timeLeft > 60) return '#ff5e00'
  return '#d50000'
}
