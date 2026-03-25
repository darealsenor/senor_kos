export interface KillfeedPlayer {
  playerId: number
  name: string
  image: string
}

export interface KillfeedEntry {
  killer: KillfeedPlayer
  victim: KillfeedPlayer
  headshot: boolean
  meters: number
  killId: number | string
}
