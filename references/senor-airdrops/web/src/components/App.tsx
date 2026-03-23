import { useNuiEvent } from '@/hooks/useNuiEvent'
import { debugData } from '../utils/debugData'
import { MainCard } from './MainCard'
import { Airdrop, AirdropSettings, AirdropWeapons, OpenMenuData, Pickup, Vector3, HistoryEntry } from '@/types'
import { useAtom } from 'jotai'
import { configAtom } from '@/store/config.state'
import { useEffect } from 'react'
import { fetchNui } from '@/utils/fetchNui'
import { airdropsAtom } from '@/store/drop.state'
import { useToast } from '@/hooks/use-toast'
import { setToastHandler } from '@/utils/toast-global'
import { Button } from './ui/button'
import { waypointAtom } from '@/store/waypoint.state'
import { historyAtom } from '@/store/history.state'
import { useLocale } from '@/providers/LocaleProvider'

// This will set the NUI to visible if we are
// developing in browser
debugData<boolean | Vector3>([
  {
    action: 'setVisible',
    data: true,
  },
  {
    action: 'setWaypoint',
    data: { x: 200, y: 300, z: 0 }
  }
])

debugData<HistoryEntry[]>([
  {
    action: 'setHistory',
    data: [
      {
        name: 'John_Doe',
        gang: 'Los Santos Vagos',
        drop: {
          coords: { x: 200, y: 300, z: 0 },
          weapons: 'Rifles',
          settings: { HS: 'Only headshots count', Firstperson: 'Immersive view' },
          interaction: 'Keystroke',
          endTime: Date.now() - 1000 * 60 * 30 // 30 minutes ago
        }
      },
      {
        name: 'Jane_Smith',
        gang: 'Ballas',
        drop: {
          coords: { x: -1000, y: -2500, z: 13 },
          weapons: 'Snipers',
          settings: { SlowMotion: 'Time is slower', Solo: 'Lone Wolf Mode' },
          interaction: 'Gulag',
          endTime: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
        }
      },
      {
        name: 'Mike_Johnson',
        gang: 'Families',
        drop: {
          coords: { x: 700, y: 1200, z: 350 },
          weapons: 'Shotguns',
          settings: { SemiDamage: 'Reduced damage', SuperJump: 'Jump like Jordan' },
          interaction: 'Interaction',
          endTime: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
        }
      },
      {
        name: 'Sarah_Williams',
        gang: 'Aztecas',
        drop: {
          coords: { x: 900, y: -3200, z: 5 },
          weapons: 'Pistols',
          settings: { SquidGames: 'Red Light Green Light' },
          interaction: 'Keystroke',
          endTime: Date.now() - 1000 * 60 * 60 * 48 // 2 days ago
        }
      },
      {
        name: 'Alex_Brown',
        gang: 'Rifa',
        drop: {
          coords: { x: 1600, y: 3700, z: 33 },
          weapons: 'Regular',
          settings: { Firstperson: 'Immersive view', SlowMotion: 'Time is slower' },
          interaction: 'Interaction',
          endTime: Date.now() - 1000 * 60 * 60 * 72 // 3 days ago
        }
      }
    ]
  }
])

// debugData<OpenMenuData>([
//   {
//     action: 'OpenMenu',
//     data: {
//       interaction: {
//         Keystroke: 'Press [E] to unlock',
//         Interaction: 'Look at crate to unlock',
//         Gulag: 'Eliminate players to unlock',
//       },
//       weapons: {
//         Regular: 'Standard Loadout',
//         Pistols: 'Small Arms',
//         Rifles: 'Assault Rifles',
//         Shotguns: 'Close-range Boomsticks',
//         Snipers: 'Precision Rifles',
//       },
//       settings: {
//         HS: 'Only headshots count',
//         Firstperson: 'Immersive view',
//         SemiDamage: 'Reduced damage',
//         SlowMotion: 'Time is slower',
//         SuperJump: 'Jump like Jordan',
//         SquidGames: 'Red Light Green Light',
//         Solo: 'Lone Wolf Mode',
//       },
//       coords: [
//         { id: 1, name: 'Military Base', coords: { x: 2050, y: 3000, z: 45 } },
//         { id: 2, name: 'Airport Hangar', coords: { x: -1000, y: -2500, z: 13 } },
//         { id: 3, name: 'Vinewood Hills', coords: { x: 700, y: 1200, z: 350 } },
//         { id: 4, name: 'Docks', coords: { x: 900, y: -3200, z: 5 } },
//         { id: 5, name: 'Sandy Shores', coords: { x: 1600, y: 3700, z: 33 } },
//         { id: 6, name: 'Paleto Forest', coords: { x: -200, y: 6200, z: 32 } },
//         { id: 7, name: 'Prison Yard', coords: { x: 1800, y: 2600, z: 45 } },
//         { id: 8, name: 'Wind Farm', coords: { x: 2400, y: 1600, z: 100 } },
//         { id: 9, name: 'Maze Bank Arena', coords: { x: -300, y: -2000, z: 20 } },
//         { id: 10, name: 'Mt. Chiliad Peak', coords: { x: 500, y: 5600, z: 800 } },
//       ],
//       prizes: [
//         { id: 1, item: 'Pistol Ammo', amount: '5' },
//         { id: 2, item: 'Rifle Ammo', amount: '30' },
//         { id: 3, item: 'Shotgun Ammo', amount: '10' },
//         { id: 4, item: 'Sniper Ammo', amount: '5' },
//         { id: 5, item: 'Armor Vest', amount: '1' },
//         { id: 6, item: 'Medkit', amount: '2' },
//         { id: 7, item: 'Stim Pack', amount: '3' },
//         { id: 8, item: 'Grenade', amount: '1' },
//         { id: 9, item: 'Smoke Bomb', amount: '2' },
//         { id: 10, item: 'Adrenaline Shot', amount: '1' },
//       ],
//     },
//   },
// ])

const App = () => {
  const [config, setConfig] = useAtom(configAtom)
  const [airdrops, setAirdrops] = useAtom(airdropsAtom)
  const [, setWaypoint] = useAtom(waypointAtom)
  const [, setHistory] = useAtom(historyAtom)
  const { toast } = useToast()
  const { t } = useLocale()

  useEffect(() => {
    const getConfig = async () => {
      const result = await fetchNui('nuiLoaded')
      if (result.success) {
        setConfig((prevConfig) => ({
          ...prevConfig,
          weapons: result.data.weapons,
          interaction: result.data.interaction,
          settings: result.data.settings,
        }))
      }
    }

    getConfig()
  }, [])

  useEffect(() => {
    setToastHandler((msg) => {
      toast({ title: t('notification_title'), description: msg })
    })
  }, [toast, t])

  useNuiEvent('OpenMenu', (data) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      ...data
    }))
  })

  useNuiEvent('setAirdrops', setAirdrops)
  useNuiEvent('setWaypoint', (data: Vector3) => {
    if (data) {
      setWaypoint(data)
    }
  })
  useNuiEvent('setHistory', setHistory)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <div className="w-[53vw]">
        <MainCard />
      </div>
    </div>
  )
}

export default App
