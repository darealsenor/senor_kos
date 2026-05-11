import { useEffect, useMemo, useState, Fragment } from 'react'
import { cn } from '@/lib/utils'
import type { KosMatchPayload } from '@/types/match'
import { PlayerPortrait } from '@/components/hud/PlayerPortrait'

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function countAlive(players: KosMatchPayload['players'], team: 'teamA' | 'teamB'): number {
  let n = 0
  for (let i = 0; i < players.length; i++) {
    const p = players[i]
    if (p.team === team && p.alive) n += 1
  }
  return n
}

/** Full team list for HUD portraits; alive first, then by player id. */
function rosterForTeam(players: KosMatchPayload['players'], team: 'teamA' | 'teamB') {
  return players
    .filter((p) => p.team === team)
    .sort((a, b) => {
      if (a.alive !== b.alive) return a.alive ? -1 : 1
      return a.id - b.id
    })
}

interface RoundHudProps {
  data: KosMatchPayload
  localPlayerId: number
  className?: string
}

/**
 * Top-center bar: local team left, timer center, enemy right — dark panels with team tints.
 */
export function RoundHud({ data, localPlayerId, className }: RoundHudProps) {
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

  const localTeam = data.players.find((p) => p.id === localPlayerId)?.team ?? 'teamA'
  const leftTeam = localTeam
  const rightTeam = leftTeam === 'teamA' ? 'teamB' : 'teamA'

  const aliveLeft = countAlive(data.players, leftTeam)
  const aliveRight = countAlive(data.players, rightTeam)
  const series = data.series

  const leftRoster = rosterForTeam(data.players, leftTeam)
  const rightRoster = rosterForTeam(data.players, rightTeam)

  const leftTeamColor = leftTeam === 'teamA' ? 'red' : 'green'
  const rightTeamColor = rightTeam === 'teamA' ? 'red' : 'green'

  const leftTheme = leftTeam === 'teamA' ? { bg: 'rgba(255,58,58,0.4)', solid: '#ff3a3a' } : { bg: 'rgba(58,155,71,0.4)', solid: '#3a9b47' }
  const rightTheme = rightTeam === 'teamA' ? { bg: 'rgba(255,58,58,0.4)', solid: '#ff3a3a' } : { bg: 'rgba(58,155,71,0.4)', solid: '#3a9b47' }

  const leftWins = series.wins[leftTeam]
  const rightWins = series.wins[rightTeam]

  return (
    <div
      className={cn(
        'pointer-events-none fixed left-1/2 top-4 z-hud flex -translate-x-1/2 justify-center',
        className
      )}
    >
      <div className="relative flex items-center justify-center gap-[30px]">
          
        {/* Left Team Pane */}
        <div 
           className="relative flex h-[58px] items-center justify-end gap-[13px] rounded-[10px] px-3.5"
           style={{ background: `linear-gradient(90deg, rgba(14,14,17,0.7) 0%, ${leftTheme.bg} 100%)` }}
        >
           {leftRoster.map((p, i) => (
             <Fragment key={p.id}>
               <PlayerPortrait
                 image={p.avatar}
                 dead={!p.alive}
                 team={leftTeamColor}
                 size={40}
                 scheme="team"
                 showTeamLine={false}
                 className="!border-none"
               />
               {i < leftRoster.length - 1 && <div className="h-[28px] w-px bg-white/10" />}
             </Fragment>
           ))}
        </div>

        {/* Center Cluster */}
        <div className="relative flex items-center justify-center gap-[18px]">
           {/* Radial Gradient Glow for Center (offset perfectly matching Figma y: -107 for sweeping dome) */}
           <div className="absolute left-1/2 top-[-107px] -translate-x-1/2 h-[184px] w-[240px] opacity-90 pointer-events-none -z-10" 
                style={{ background: 'radial-gradient(50% 50% at 50% 50%, #0E0E11 0%, rgba(14,14,17,0) 100%)' }} />

           {/* Left Wins */}
           <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] z-10" 
                style={{ 
                  backgroundColor: leftTheme.solid,
                  boxShadow: `inset 0 0 21px rgba(0,0,0,0.25), 0 4px 16px ${leftTheme.solid}40` 
                }}>
             <span className="text-[20px] font-bold text-[#2c2c2c] leading-none mt-0.5">{leftWins}</span>
           </div>

           {/* Timer Info */}
           <div className="flex flex-col items-center justify-center pt-1 w-[88px] text-center z-10 gap-0">
              <div className="text-[12px] font-extrabold text-white/50 uppercase leading-none tracking-widest">ROUND</div>
              
              <div className="font-display text-[26px] font-bold leading-none tracking-wide mt-1 tabular-nums drop-shadow-md flex items-center justify-center">
                {displaySeconds !== null ? (() => {
                  const mm = Math.floor(displaySeconds / 60).toString().padStart(2, '0');
                  const ss = (displaySeconds % 60).toString().padStart(2, '0');
                  
                  return (
                    <>
                      {mm[0] === '0' ? (
                        <span className="text-white/30">{mm[0]}</span>
                      ) : (
                        <span className="text-white">{mm[0]}</span>
                      )}
                      <span className="text-white">{mm[1]}</span>
                      <span className="text-white/40 px-0.5 -mt-0.5">:</span>
                      <span className="text-white">{ss}</span>
                    </>
                  );
                })() : <span className="text-white">—</span>}
              </div>

              <div className="text-[14px] font-bold text-white/60 leading-none mt-1 whitespace-nowrap">
                {series.index} <span className="text-white/20 px-1.5">|</span> {series.total}
              </div>
           </div>

           {/* Right Wins */}
           <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] z-10" 
                style={{ 
                  backgroundColor: rightTheme.solid,
                  boxShadow: `inset 0 0 21px rgba(0,0,0,0.25), 0 4px 16px ${rightTheme.solid}40`
                }}>
             <span className="text-[20px] font-bold text-[#2c2c2c] leading-none mt-0.5">{rightWins}</span>
           </div>
        </div>

        {/* Right Team Pane */}
        <div 
           className="relative flex h-[58px] items-center justify-start gap-[13px] rounded-[10px] px-3.5"
           style={{ background: `linear-gradient(90deg, ${rightTheme.bg} 0%, rgba(14,14,17,0.7) 100%)` }}
        >
           {rightRoster.map((p, i) => (
             <Fragment key={p.id}>
               <PlayerPortrait
                 image={p.avatar}
                 dead={!p.alive}
                 team={rightTeamColor}
                 size={40}
                 scheme="team"
                 showTeamLine={false}
                 className="!border-none"
               />
               {i < rightRoster.length - 1 && <div className="h-[28px] w-px bg-white/10" />}
             </Fragment>
           ))}
        </div>

      </div>
    </div>
  )
}
