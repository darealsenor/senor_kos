import { Airdrop } from '@/types'
import { atom } from 'jotai'

export const airdropsAtom = atom<Airdrop[]>([
  // {
  //   playerId: 1,
  //   coords: { x: 0, y: 0, z: 30.0 },
  //   lockTime: 60,
  //   distance: 150,
  //   prizes: [
  //     { item: 'Medkit', amount: '3' },
  //     { item: 'Ammo', amount: '90' },
  //   ],
  //   weapons: 'Rifles',
  //   settings: {
  //     Firstperson: 'First-person',
  //     SemiDamage: 'Semi Damage',
  //     SlowMotion: 'Slow Motion',
  //     SuperJump: 'Super Jump',
  //     SquidGames: 'Squid Games',
  //     Solo: 'Solo Gameplay',
  //   },
  //   dropState: 0,
  //   startTimer: 0,
  //   timeLeft: 60 * 5,
  //   interaction: 'Keystroke',
  //   id: 'dc12s'
  // },
  // {
  //   playerId: 2,
  //   coords: { x: 200, y: 300, z: 12.4 },
  //   lockTime: 45,
  //   distance: 120,
  //   prizes: [{ item: 'Armor', amount: '1' }],
  //   weapons: 'Snipers',
  //   settings: {
  //     HS: 'Headshot Only',
  //     Solo: 'Solo Gameplay',
  //   },
  //   dropState: 1,
  //   startTimer: 10,
  //   timeLeft: 60 * 3.5,
  //   interaction: 'Gulag',
  //   id: 'cdwq1'
  // },
  // {
  //   playerId: 2,
  //   coords: { x: 325, y: 65, z: 12.4 },
  //   lockTime: 45,
  //   distance: 120,
  //   prizes: [{ item: 'Armor', amount: '1' }],
  //   weapons: 'Snipers',
  //   settings: {
  //     HS: 'Headshot Only',
  //     Solo: 'Solo Gameplay',
  //   },
  //   dropState: 1,
  //   startTimer: 10,
  //   timeLeft: 60 * 0.3,
  //   interaction: 'Gulag',
  //   id: 'cdwq1q'
  // },
])
