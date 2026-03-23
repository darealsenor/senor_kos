import L, { Projection, Transformation } from 'leaflet'

export const CENTER_X = 117.3
export const CENTER_Y = 172.8
export const SCALE_X = 0.02072
export const SCALE_Y = 0.0205

export const MAX_BOUNDS: [[number, number], [number, number]] = [
  [8000.0, -5500.0],
  [-8000.0, 5500.0],
]

export const CUSTOM_CRS = {
  ...L.CRS.Simple,
  projection: Projection.LonLat,
  scale: (zoom: number) => Math.pow(2, zoom),
  zoom: (scale: number) => Math.log(scale) / 0.6931471805599453,
  distance: (a: any, b: any) => {
    const x = b.lng - a.lng
    const y = b.lat - a.lat
    return Math.sqrt(x * x + y * y)
  },
  transformation: new Transformation(SCALE_X, CENTER_X, -SCALE_Y, CENTER_Y),
  infinite: true,
}

// Coordinate transformation functions
export const toMapCoords = (x: number, y: number) => [y - 80, x + 100]
export const toGameCoords = (lat: number, lng: number) => [lng - 100, lat + 80]
