import { atom } from 'jotai'
import { OpenMenuData } from '@/types'
import { isEnvBrowser } from '@/utils/misc'

export const configAtom = atom<OpenMenuData>({
  interaction: {
    Keystroke: 'Keystroke (Press Key)',
    Interaction: 'Eye Target',
  },
  settings: {
    Firstperson: 'First-person Only',
    SemiDamage: 'Semi Damage',
  },
  weapons: {
    Regular: 'Regular Only',
    Pistols: 'Pistols Only',
    Melee: 'Melee Only',
  },
  coords: [
    { id: 1, name: 'Military Base', coords: { x: 2050, y: 3000, z: 45 } },
    { id: 2, name: 'Airport Hangar', coords: { x: -1000, y: -2500, z: 13 } },
    { id: 3, name: 'Vinewood Hills', coords: { x: 700, y: 1200, z: 350 } },
    { id: 4, name: 'Docks', coords: { x: 900, y: -3200, z: 5 } },
    { id: 5, name: 'Sandy Shores', coords: { x: 1600, y: 3700, z: 33 } },
    { id: 6, name: 'Paleto Forest', coords: { x: -200, y: 6200, z: 32 } },
    { id: 7, name: 'Prison Yard', coords: { x: 1800, y: 2600, z: 45 } },
    { id: 8, name: 'Wind Farm', coords: { x: 2400, y: 1600, z: 100 } },
    { id: 9, name: 'Maze Bank Arena', coords: { x: -300, y: -2000, z: 20 } },
    { id: 10, name: 'Mt. Chiliad Peak', coords: { x: 200, y: 311, z: 300 } },
  ],
  prizes: [
    { id: 1, name: 'weapon_pistol50', label: 'Pistol-50', amount: 3 },
    { id: 2, name: 'oxy', label: 'Oxy', amount: 30 },
  ],
  inventoryItems: [
    { name: 'weapon_pistol50', label: 'Pistol-50' },
    { name: 'oxy', label: 'Oxy' },
    { name: 'xpill', label: 'X-Pill' },
  ],
  isAdmin: isEnvBrowser(),
})
