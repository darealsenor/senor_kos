import { useEffect, useMemo, useState } from 'react'
import type { KosMatchPayload, MatchPlayerRow } from '@/types/match'
import { PlayerPortrait } from '@/components/hud/PlayerPortrait'
import { cn } from '@/lib/utils'
import { Crown } from 'lucide-react'
import { useNuiStore } from '@/store/nuiStore'

interface MatchScoreboardProps {
  data: KosMatchPayload
  localPlayerId: number
  open: boolean
}

function sortPlayers(rows: MatchPlayerRow[]): MatchPlayerRow[] {
  return [...rows].sort((a, b) => {
    if (b.kills !== a.kills) return b.kills - a.kills
    if (b.deaths !== a.deaths) return a.deaths - b.deaths
    return (a.name ?? '').localeCompare(b.name ?? '')
  })
}

function PlayerRow({ player, team, localPlayerId }: { player: MatchPlayerRow, team: "teamA" | "teamB", localPlayerId: number }) {
  const isMe = player.id === localPlayerId;
  const isRed = team === "teamA";
  
  const bgClass = isRed 
    ? (isMe ? 'bg-[#ff3a3a]/10 border border-[#ff3a3a]/30' : 'bg-[#ff3a3a]/10') 
    : (isMe ? 'bg-[#00e946]/10 border border-[#00e946]/30' : 'bg-[#00e946]/10');
  
  return (
    <div 
      className={cn(
        "flex h-[58px] w-full items-center justify-between rounded-[10px] px-3.5",
        bgClass
      )}
    >
      <div className="flex items-center gap-3.5">
        <PlayerPortrait 
           image={player.avatar} 
           dead={!player.alive} 
           team={team === 'teamA' ? 'red' : 'green'} 
           size={34} 
           showAliveDot={false} 
           className="!border-none shrink-0" 
           scheme="team"
        />
        <div className="flex flex-col justify-center">
          <span className="text-[15px] font-bold text-white uppercase leading-none tracking-[0.02em] max-w-[120px] truncate font-display">
            {player.name}
          </span>
          <span className="text-[10px] font-medium text-white/50 uppercase mt-1 leading-none tracking-[0.03em] font-display">
            {'TEAM ' + (team === 'teamA' ? 'A' : 'B')}
          </span>
        </div>
      </div>

      <div className="flex items-center h-[30px]">
        {/* Kills */}
        <div className="flex flex-col items-center justify-center w-[36px]">
           <span className="text-[13px] font-bold text-white leading-none font-display">K</span>
           <span className="text-[12px] font-bold text-white/60 mt-1 leading-none tabular-nums font-display">{player.kills}</span>
        </div>
        <div className="w-[1px] h-[86%] bg-white/10 mx-1.5" />
        
        {/* Deaths */}
        <div className="flex flex-col items-center justify-center w-[36px]">
           <span className="text-[13px] font-bold text-white leading-none font-display">D</span>
           <span className="text-[12px] font-bold text-white/60 mt-1 leading-none tabular-nums font-display">{player.deaths}</span>
        </div>
        <div className="w-[1px] h-[86%] bg-white/10 mx-1.5" />

        {/* Headshots */}
        <div className="flex flex-col items-center justify-center w-[36px]">
           <span className="text-[13px] font-bold text-white leading-none font-display">HS</span>
           <span className="text-[12px] font-bold text-white/60 mt-1 leading-none tabular-nums font-display">{player.headshots}</span>
        </div>
      </div>
    </div>
  )
}

export function MatchScoreboard({ data, localPlayerId, open }: MatchScoreboardProps) {
  const [tick, setTick] = useState(0)
  const remainingBase = data.round.remainingSeconds
  const inRound = data.match.state === 'in_progress' && typeof remainingBase === 'number'

  useEffect(() => {
    setTick(0)
  }, [remainingBase, data.match.state, data.match.serverTime])

  useEffect(() => {
    if (!inRound) return
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [inRound])

  const displaySeconds = useMemo(() => {
    if (!inRound) return null
    return Math.max(0, (remainingBase as number) - tick)
  }, [inRound, remainingBase, tick])

  if (!open) return null

  const redPlayers = sortPlayers(data.players.filter((p) => p.team === 'teamA'))
  const bluePlayers = sortPlayers(data.players.filter((p) => p.team === 'teamB'))
  const leftWins = data.series.wins.teamA
  const rightWins = data.series.wins.teamB

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-scoreboard flex items-center justify-center p-6 bg-black/40"
    >
      <div 
        className="relative flex w-full max-w-[860px] flex-col overflow-hidden rounded-[16px] border border-white/5 p-6 shadow-2xl"
        style={{ background: 'linear-gradient(180deg, rgba(27,29,32,0.95) 0%, rgba(22,24,27,0.95) 100%)' }}
      >
        {/* Header Block */}
        <div className="flex items-center justify-between mb-8 px-2 relative h-[44px]">
           <div className="flex items-center gap-4">
             <div className="flex size-10 items-center justify-center rounded-[10px] bg-white/5">
                <Crown className="size-5 text-white" />
             </div>
             <div className="flex flex-col">
               <span className="text-[17px] font-bold text-white leading-none font-display">ScoreBoard</span>
               <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mt-1.5 font-display">Players Statistics</span>
             </div>
           </div>

           {/* Central Timer Array inherited from HUD */}
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-[24px]">
             <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px]" style={{ backgroundColor: '#ff3a3a', boxShadow: 'inset 0 0 21px rgba(0,0,0,0.25), 0 4px 16px rgba(255,58,58,0.25)' }}>
               <span className="text-[20px] font-bold text-[#2c2c2c] leading-none mt-0.5">{leftWins}</span>
             </div>
             
             <div className="flex flex-col items-center justify-center pt-1 w-[88px] text-center gap-0">
                <div className="text-[11px] font-extrabold text-white/50 uppercase leading-none tracking-widest">ROUND {data.series.index}/{data.series.total}</div>
                <div className="font-display text-[26px] font-bold leading-none tracking-wide mt-1 tabular-nums flex items-center justify-center">
                  {displaySeconds !== null ? (() => {
                    const mm = Math.floor(displaySeconds / 60).toString().padStart(2, '0');
                    const ss = (displaySeconds % 60).toString().padStart(2, '0');
                    return (
                      <>
                        <span className={mm[0] === '0' ? "text-white/30" : "text-white"}>{mm[0]}</span>
                        <span className="text-white">{mm[1]}</span>
                        <span className="text-white/40 px-0.5 -mt-0.5">:</span>
                        <span className="text-white">{ss}</span>
                      </>
                    );
                  })() : <span className="text-white">—</span>}
                </div>
             </div>

             <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px]" style={{ backgroundColor: '#3a9b47', boxShadow: 'inset 0 0 21px rgba(0,0,0,0.25), 0 4px 16px rgba(58,155,71,0.25)' }}>
               <span className="text-[20px] font-bold text-[#2c2c2c] leading-none mt-0.5">{rightWins}</span>
             </div>
           </div>
        </div>

        {/* Content Rows */}
        <div className="flex gap-6 relative px-2 mb-2">
          {/* Vertical Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 bg-white/5" />
          
          <div className="flex-1 flex flex-col gap-[8px]">
            {redPlayers.map(p => <PlayerRow key={p.id} player={p} team="teamA" localPlayerId={localPlayerId} />)}
          </div>
          
          <div className="flex-1 flex flex-col gap-[8px]">
            {bluePlayers.map(p => <PlayerRow key={p.id} player={p} team="teamB" localPlayerId={localPlayerId} />)}
          </div>
        </div>

      </div>
    </div>
  )
}
