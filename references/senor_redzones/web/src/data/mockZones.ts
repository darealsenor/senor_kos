import type { Zone } from '@/types'

export const MOCK_ZONES: Zone[] = [
  {
    id: 'temp-1',
    name: 'Downtown Arena',
    type: 'temporary',
    coords: { x: 200, y: -900, z: 30 },
    radius: 75,
    bucket: 0,
    durationType: 'time',
    duration: 300,
    loadout: [],
    killstreaks: {},
    blipName: 'Redzone Arena',
    blipColour: 1,
    markerColour: { r: 255, g: 42, b: 24, a: 120 },
  },
  {
    id: 2,
    name: 'Military Base',
    type: 'permanent',
    coords: { x: -2047, y: 3132, z: 32 },
    radius: 100,
    bucket: 1,
    durationType: 'kills',
    duration: 50,
    loadout: [],
    killstreaks: {},
    blipColour: 1,
    markerColour: { r: 255, g: 42, b: 24, a: 120 },
    enabled: true,
  },
]
