import { useEffect, useMemo, useState } from 'react'
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

interface RoundHudProps {
  data: KosMatchPayload
  className?: string
}

/**
 * Top-center competitive layout: team alive counts, round timer, series score.
 */
export function RoundHud({ data, className }: RoundHudProps) {
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

  const aliveA = countAlive(data.players, 'teamA')
  const aliveB = countAlive(data.players, 'teamB')
  const series = data.series

  const redAlive = data.players.filter((p) => p.team === 'teamA' && p.alive)
  const blueAlive = data.players.filter((p) => p.team === 'teamB' && p.alive)

  return (
    <div
      className={cn(
        'pointer-events-none fixed left-1/2 top-3 z-hud flex -translate-x-1/2 flex-col items-center gap-1',
        className
      )}
    >
      <div className="flex items-stretch overflow-hidden rounded-md border border-border bg-transparent p-0">
        <div className="flex min-w-[160px] flex-col items-center justify-center gap-2 border-r border-border px-4 py-3">
          <div className="flex w-full items-center justify-between">
            <span className="text-[10px] font-bold tracking-tight text-red-400">Red</span>
            <span className="text-[12px] font-bold text-red-400">{series.wins.teamA}</span>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2">
            {redAlive.map((p) => (
              <PlayerPortrait key={p.id} image={p.avatar} dead={false} team="red" size={30} showAliveDot />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">{aliveA} alive</span>
        </div>

        <div className="flex min-w-[190px] flex-col items-center justify-center px-5 py-3">
          <span className="text-[10px] font-semibold tracking-tight text-muted-foreground">
            Round {series.index}/{series.total}
          </span>
          <span className="font-display text-3xl font-black tabular-nums tracking-tight text-foreground">
            {displaySeconds !== null ? formatClock(displaySeconds) : '—'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Score {series.wins.teamA} : {series.wins.teamB}
          </span>
        </div>

        <div className="flex min-w-[160px] flex-col items-center justify-center gap-2 border-l border-border px-4 py-3">
          <div className="flex w-full items-center justify-between">
            <span className="text-[10px] font-bold tracking-tight text-blue-400">Blue</span>
            <span className="text-[12px] font-bold text-blue-400">{series.wins.teamB}</span>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2">
            {blueAlive.map((p) => (
              <PlayerPortrait key={p.id} image={p.avatar} dead={false} team="blue" size={30} showAliveDot />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">{aliveB} alive</span>
        </div>
      </div>
      {data.map?.name && (
        <span className="rounded border border-border bg-transparent px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {data.map.name}
        </span>
      )}
    </div>
  )
}
