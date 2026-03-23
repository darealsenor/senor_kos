export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface InventoryItem {
  name: string
  label: string
}

export interface Prize extends InventoryItem {
  amount: number
}

export interface PrizeWithId extends Prize {
  id: number
}

export interface Prizes {
  prizes?: Prize[]
}

export type Pickup = 'Keystroke' | 'Interaction'

export type AirdropSettings = 'Firstperson' | 'SemiDamage'

export type AirdropWeapons = 'Regular' | 'Pistols' | 'Melee'

export type TTabs = 'browse' | 'creation' | 'locations' | 'prizes' | 'history'

export interface Airdrop {
  playerId: number
  coords: Vector3
  lockTime: number
  distance: number
  prizes?: Prize[]
  weapons: AirdropWeapons
  settings: Partial<Record<AirdropSettings, string>>
  dropState: number
  startTime: number
  timeLeft: number
  interaction: Pickup
  id: string
}

export interface OpenMenuData {
  interaction: Partial<Record<Pickup, string>>
  weapons: Partial<Record<AirdropWeapons, string>>
  settings: Partial<Record<AirdropSettings, string>>
  coords?: { id: number; name: string; coords: Vector3 }[]
  prizes?: PrizeWithId[]
  inventoryItems: InventoryItem[];
  isAdmin: boolean;
}

export interface IMap {
  coords: number[]
}

export interface IInput {
  coords: Vector3
  weapons?: AirdropWeapons
  settings?: Partial<Record<AirdropSettings, string>>
  interaction?: Pickup
  lockTime: number
  distance: number
  newDropName: string
  newDropCoords: Vector3
}

export interface ILocation {
  coords: Vector3
  id: number
  name: string
}

export interface HistoryEntry {
  name: string
  gang: string
  drop: {
    coords: Vector3
    weapons: AirdropWeapons
    settings: Partial<Record<AirdropSettings, string>>
    interaction: Pickup
    endTime: number
  }
}
