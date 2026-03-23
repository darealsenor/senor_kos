import { useState, useRef, useEffect } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { fetchNui } from '../utils/fetchNui'
import { AnimatePresence, motion } from 'framer-motion'
import { useNuiEvent } from '../hooks/useNuiEvent'
import { debugData } from '../utils/debugData'
import { isEnvBrowser } from '../utils/misc'
import { DevPanel } from './dev/DevPanel'
import { AdminPanel } from './admin/AdminPanel'
import { MiniLeaderboard } from './hud/MiniLeaderboard'
import { BigScoreboard } from './scoreboard/BigScoreboard'
import { EndOfZoneResults } from './end-results/EndOfZoneResults'
import { MOCK_ZONES } from '@/data/mockZones'
import { leaderboardAtom, endResultsAtom } from '../store/leaderboard.state'
import { scoreboardOpenAtom } from '../store/ui.state'
import { hudPositionAtom, scoreboardKeyAtom } from '../store/config.state'
import { localeAtom } from '../store/locale.state'
import type { Zone, ZoneLeaderboard, EndOfZoneResults as EndOfZoneResultsType, AdminFormDefaults } from '@/types'
import type { HudPosition } from '@/data/defaults'
import { applyTheme } from '@/utils/theme'

export interface AdminOpenData {
  zones?: Zone[]
  loadoutItems?: Array<{ name: string; label: string }>
  defaults?: AdminFormDefaults
  locale?: Record<string, string>
  theme?: { primary?: string; backgroundDark?: string }
}

const MOCK_LOADOUT_ITEMS = [
  { name: 'weapon_pistol', label: 'Pistol' },
  { name: 'weapon_smg', label: 'SMG' },
  { name: 'bandage', label: 'Bandage' },
  { name: 'water', label: 'Water' },
]

debugData([
  { action: 'setVisible', data: true },
  {
    action: 'adminOpen',
    data: {
      zones: MOCK_ZONES,
      loadoutItems: MOCK_LOADOUT_ITEMS,
      defaults: { zoneRadius: 50, durationKills: 3, durationTime: 300, blipColour: 1, markerColour: [255, 42, 24, 120], hudPosition: 'top-right' },
    },
  },
] as Array<{ action: string; data: unknown }>)

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminData, setAdminData] = useState<AdminOpenData | null>(null)
  const [spawnPlacementActive, setSpawnPlacementActive] = useState(false)
  const [leaderboard, setLeaderboard] = useAtom(leaderboardAtom)
  const [endResults, setEndResults] = useAtom(endResultsAtom)
  const [scoreboardOpen, setScoreboardOpen] = useAtom(scoreboardOpenAtom)
  const [hudPosition, setHudPosition] = useAtom(hudPositionAtom)
  const scoreboardKey = useAtomValue(scoreboardKeyAtom)
  const setLocale = useSetAtom(localeAtom)
  const endResultsRef = useRef(endResults)
  const [miniScoreboardEnabled, setMiniScoreboardEnabled] = useState(true)
  const [scoreboardEnabled, setScoreboardEnabled] = useState(true)
  const [endOfGameResultsEnabled, setEndOfGameResultsEnabled] = useState(true)
  useEffect(() => {
    endResultsRef.current = endResults
  }, [endResults])

  const showAdminRef = useRef(showAdmin)
  useEffect(() => {
    showAdminRef.current = showAdmin
  }, [showAdmin])

  useNuiEvent<boolean>('spawnPlacementActive', (active) => {
    setSpawnPlacementActive(!!active)
  })

  useNuiEvent('adminOpen', (data?: AdminOpenData) => {
    if (data?.locale && typeof data.locale === 'object') setLocale(data.locale)
    applyTheme(data?.theme)
    setAdminData(data ?? null)
    setShowAdmin(true)
  })

  useNuiEvent<ZoneLeaderboard>('leaderboardUpdate', (data) => {
    setLeaderboard(data ?? null)
    if (data) setEndResults(null)
  })

  useNuiEvent('zoneExited', () => {
    setLeaderboard(null)
    setScoreboardOpen(false)
    setTimeout(() => {
      if (!endResultsRef.current && !showAdminRef.current) fetchNui('hideFrame')
    }, 0)
  })

  useNuiEvent<{ hudPosition?: string; scoreboardKey?: string; miniScoreboardEnabled?: boolean; scoreboardEnabled?: boolean; endOfGameResultsEnabled?: boolean; locale?: Record<string, string>; theme?: { primary?: string; backgroundDark?: string } }>('redzone:config', (data) => {
    if (data?.hudPosition) setHudPosition(data.hudPosition as HudPosition)
    if (typeof data?.scoreboardKey === 'string') {
      // scoreboardKey is stored in atom via NUI keybind setup; keep handling there if needed
    }
    if (typeof data?.miniScoreboardEnabled === 'boolean') setMiniScoreboardEnabled(data.miniScoreboardEnabled)
    if (typeof data?.scoreboardEnabled === 'boolean') setScoreboardEnabled(data.scoreboardEnabled)
    if (typeof data?.endOfGameResultsEnabled === 'boolean') setEndOfGameResultsEnabled(data.endOfGameResultsEnabled)
    if (data?.locale && typeof data.locale === 'object') setLocale(data.locale)
    applyTheme(data?.theme)
  })

  const closeEndResults = () => {
    setEndResults(null)
    fetchNui('hideFrame')
  }
  useNuiEvent<EndOfZoneResultsType>('zoneEndResults', (data) => {
    setEndResults(data ?? null)
  })
  useEffect(() => {
    if (!endResults) return
    const t = setTimeout(closeEndResults, 5000)
    return () => clearTimeout(t)
  }, [endResults])

  useNuiEvent('scoreboardToggle', () => {
    setScoreboardOpen((prev) => !prev)
  })

  return (
    <>
      <AnimatePresence>
        {showAdmin && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AdminPanel
              initialZones={adminData?.zones}
              loadoutItems={adminData?.loadoutItems ?? []}
              defaults={adminData?.defaults}
              spawnPlacementActive={spawnPlacementActive}
              onClose={() => {
                setShowAdmin(false)
                setAdminData(null)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!showAdmin && endResults && endOfGameResultsEnabled && (
          <motion.div
            key="endResults"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <EndOfZoneResults
              results={endResults}
              currentPlayerId={leaderboard?.currentPlayerId}
              currentPlayerStats={leaderboard?.players.find((p) => p.playerId === leaderboard?.currentPlayerId)}
              onClose={closeEndResults}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!showAdmin && !endResults && leaderboard && leaderboard.players.length > 0 && miniScoreboardEnabled && (
          <motion.div
            key="hud"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MiniLeaderboard leaderboard={leaderboard} position={hudPosition} scoreboardKey={scoreboardKey} />
            <AnimatePresence>
              {scoreboardOpen && scoreboardEnabled && (
                <motion.div
                  key="scoreboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BigScoreboard
                    leaderboard={leaderboard}
                    onClose={() => setScoreboardOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {isEnvBrowser() && <DevPanel showAdmin={showAdmin} onAdminOpen={() => setShowAdmin(true)} />}
    </>
  )
}

export default App
