import { useState } from 'react'
import { isEnvBrowser } from '@/utils/misc'
import { MiniLeaderboard } from '../hud/MiniLeaderboard'
import { BigScoreboard } from '../scoreboard/BigScoreboard'
import { EndOfZoneResults } from '../end-results/EndOfZoneResults'
import {
  MOCK_CURRENT_PLAYER_ID,
  MOCK_LEADERBOARD,
  MOCK_END_RESULTS,
} from '@/data/mockLeaderboard'

type DevView = 'none' | 'mini' | 'scoreboard' | 'endResults' | 'admin'

interface DevPanelProps {
  showAdmin?: boolean
  onAdminOpen?: () => void
}

export const DevPanel = ({ showAdmin, onAdminOpen }: DevPanelProps) => {
  const [view, setView] = useState<DevView>('none')

  const handleAdminClick = () => {
    onAdminOpen?.()
  }

  if (!isEnvBrowser()) return null

  return (
    <>
      {view === 'none' && (
        <div className="fixed inset-0 bg-rz-background-dark flex items-center justify-center">
          <p className="text-white/50 text-sm font-display tracking-widest uppercase">Select a view from the dev panel</p>
        </div>
      )}
      <div className="fixed bottom-4 left-4 z-[9998] flex flex-col gap-2 p-4 bg-black/80 rounded-lg border border-rz-primary/30 font-display">
        <span className="text-[10px] text-rz-primary font-bold tracking-widest uppercase">Dev Panel</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView(view === 'mini' ? 'none' : 'mini')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-colors ${
              view === 'mini' ? 'bg-rz-primary text-white border-rz-primary' : 'bg-transparent text-white/80 border-white/30 hover:border-rz-primary/50'
            }`}
          >
            Mini HUD
          </button>
          <button
            type="button"
            onClick={() => setView(view === 'scoreboard' ? 'none' : 'scoreboard')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-colors ${
              view === 'scoreboard' ? 'bg-rz-primary text-white border-rz-primary' : 'bg-transparent text-white/80 border-white/30 hover:border-rz-primary/50'
            }`}
          >
            Big Scoreboard
          </button>
          <button
            type="button"
            onClick={() => setView(view === 'endResults' ? 'none' : 'endResults')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-colors ${
              view === 'endResults' ? 'bg-rz-primary text-white border-rz-primary' : 'bg-transparent text-white/80 border-white/30 hover:border-rz-primary/50'
            }`}
          >
            End of Zone
          </button>
          <button
            type="button"
            onClick={handleAdminClick}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-colors ${
              showAdmin ? 'bg-rz-primary text-white border-rz-primary' : 'bg-transparent text-white/80 border-white/30 hover:border-rz-primary/50'
            }`}
          >
            Admin Panel
          </button>
        </div>
      </div>
      {view === 'mini' && (
        <div className="min-h-screen bg-rz-background-dark">
          <div className="fixed inset-0 bg-cover bg-center opacity-40 grayscale" style={{ backgroundImage: "url('https://picsum.photos/1920/1080')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-rz-background-dark via-transparent to-rz-background-dark/80" />
          <MiniLeaderboard leaderboard={MOCK_LEADERBOARD} />
        </div>
      )}
      {view === 'scoreboard' && (
        <BigScoreboard
          leaderboard={MOCK_LEADERBOARD}
          onClose={() => setView('none')}
        />
      )}
      {view === 'endResults' && (
        <div className="min-h-screen bg-rz-background-dark">
          <div className="fixed inset-0 z-0 bg-cover bg-center scale-110 blur-xl opacity-40" style={{ backgroundImage: "url('https://picsum.photos/1920/1080')" }} />
          <EndOfZoneResults
            results={{
              ...MOCK_END_RESULTS,
              topPlayers: [
                ...MOCK_END_RESULTS.topPlayers,
                { playerId: MOCK_CURRENT_PLAYER_ID, name: 'Redzone_Warrior', kills: 24, deaths: 12, streak: 5 },
              ].sort((a, b) => b.kills - a.kills),
            }}
            currentPlayerId={MOCK_CURRENT_PLAYER_ID}
            onClose={() => setView('none')}
          />
        </div>
      )}
    </>
  )
}
