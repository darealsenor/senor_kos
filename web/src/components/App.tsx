import { useCallback } from 'react'
import { useNuiEvent } from '@/hooks/useNuiEvent'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { RoundHud } from '@/components/hud/RoundHud'
import { MatchScoreboard } from '@/components/scoreboard/MatchScoreboard'
import { Killfeed } from '@/components/killfeed/Killfeed'
import { useNuiStore } from '@/store/nuiStore'
import type { MatchNuiMessage } from '@/types/match'

/**
 * NUI root: match HUD, scoreboard, admin dialog, and killfeed stack.
 */
const App = () => {
  const matchData = useNuiStore((s) => s.matchData)
  const scoreboardOpen = useNuiStore((s) => s.scoreboardOpen)
  const adminOpen = useNuiStore((s) => s.adminOpen)
  const setMatchData = useNuiStore((s) => s.setMatchData)
  const setScoreboardOpen = useNuiStore((s) => s.setScoreboardOpen)
  const setAdminOpen = useNuiStore((s) => s.setAdminOpen)
  const toggleScoreboard = useNuiStore((s) => s.toggleScoreboard)

  useNuiEvent<MatchNuiMessage | null>('matchData', (msg) => {
    setMatchData(msg ?? null)
  })

  useNuiEvent('adminOpen', () => setAdminOpen(true))
  useNuiEvent('adminClosed', () => setAdminOpen(false))
  useNuiEvent('scoreboardToggle', () => toggleScoreboard())

  const closeScoreboard = useCallback(() => setScoreboardOpen(false), [setScoreboardOpen])
  const payload = matchData?.match ?? null
  const localId = matchData?.localPlayerId ?? 0
  const showMatchLayers = Boolean(payload)

  return (
    <div className="pointer-events-none fixed inset-0">
      {showMatchLayers && payload && (
        <>
          <RoundHud data={payload} />
          <Killfeed localPlayerId={localId} />
          <MatchScoreboard
            data={payload}
            localPlayerId={localId}
            open={scoreboardOpen}
            onClose={closeScoreboard}
          />
        </>
      )}
      <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />
    </div>
  )
}

export default App
