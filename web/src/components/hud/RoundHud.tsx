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

  const leftPortraitColor = leftTeam === 'teamA' ? 'red' : 'blue'
  const rightPortraitColor = rightTeam === 'teamA' ? 'red' : 'blue'

  const leftLabel = (leftTeam === 'teamA' ? data.teams.teamA.gang?.label : data.teams.teamB.gang?.label) ?? (leftTeam === 'teamA' ? 'Team A' : 'Team B')
  const rightLabel = (rightTeam === 'teamA' ? data.teams.teamA.gang?.label : data.teams.teamB.gang?.label) ?? (rightTeam === 'teamA' ? 'Team A' : 'Team B')

  const leftWins = series.wins[leftTeam]
  const rightWins = series.wins[rightTeam]

  return (
    <div
      className={cn(
        'pointer-events-none fixed left-1/2 top-1.5 z-hud flex -translate-x-1/2 flex-col items-center gap-0.5',
        className
      )}
    >
      <div
        className="flex items-stretch overflow-hidden rounded-sm border border-white/10 shadow-sm"
        style={{ backgroundColor: 'rgba(var(--kos-background-dark-rgb), 0.90)' }}
      >
        <div
          className={cn(
            'flex min-w-[108px] flex-col items-center justify-center gap-0.5 border-r border-white/10 px-2 py-1.5',
            leftPortraitColor === 'red' ? 'bg-red-500/[0.08]' : 'bg-blue-500/[0.08]'
          )}
        >
          <div className="flex w-full items-center justify-between gap-1">
            <span
              className={cn(
                'text-[8px] font-bold uppercase tracking-wide',
                leftPortraitColor === 'red' ? 'text-red-300/90' : 'text-blue-300/90'
              )}
            >
              {leftLabel}
            </span>
            <span
              className={cn(
                'text-[10px] font-bold tabular-nums',
                leftPortraitColor === 'red' ? 'text-red-200' : 'text-blue-200'
              )}
            >
              {leftWins}
            </span>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-0.5">
            {leftRoster.map((p) => (
              <PlayerPortrait
                key={p.id}
                image={p.avatar}
                dead={!p.alive}
                team={leftPortraitColor}
                size={20}
                scheme="team"
                showTeamLine={false}
              />
            ))}
          </div>
          <span className="text-[8px] font-medium text-zinc-400">{aliveLeft} alive</span>
        </div>

        <div
          className="flex min-w-[124px] flex-col items-center justify-center gap-0 px-2 py-1.5"
          style={{ backgroundColor: 'rgba(var(--kos-background-dark-rgb), 0.82)' }}
        >
          <span className="text-[8px] font-semibold uppercase tracking-wide text-zinc-500">
            Round {series.index}/{series.total}
          </span>
          <span className="font-display text-xl font-black tabular-nums leading-tight tracking-tight text-amber-100">
            {displaySeconds !== null ? formatClock(displaySeconds) : '—'}
          </span>
          <span className="text-[8px] font-medium text-zinc-400">
            Score{' '}
            <span className={leftPortraitColor === 'red' ? 'text-red-300/90' : 'text-blue-300/90'}>{leftWins}</span>
            <span className="mx-0.5 text-zinc-600">:</span>
            <span className={rightPortraitColor === 'red' ? 'text-red-300/90' : 'text-blue-300/90'}>{rightWins}</span>
          </span>
        </div>

        <div
          className={cn(
            'flex min-w-[108px] flex-col items-center justify-center gap-0.5 border-l border-white/10 px-2 py-1.5',
            rightPortraitColor === 'red' ? 'bg-red-500/[0.08]' : 'bg-blue-500/[0.08]'
          )}
        >
          <div className="flex w-full items-center justify-between gap-1">
            <span
              className={cn(
                'text-[8px] font-bold uppercase tracking-wide',
                rightPortraitColor === 'red' ? 'text-red-300/90' : 'text-blue-300/90'
              )}
            >
              {rightLabel}
            </span>
            <span
              className={cn(
                'text-[10px] font-bold tabular-nums',
                rightPortraitColor === 'red' ? 'text-red-200' : 'text-blue-200'
              )}
            >
              {rightWins}
            </span>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-0.5">
            {rightRoster.map((p) => (
              <PlayerPortrait
                key={p.id}
                image={p.avatar}
                dead={!p.alive}
                team={rightPortraitColor}
                size={20}
                scheme="team"
                showTeamLine={false}
              />
            ))}
          </div>
          <span className="text-[8px] font-medium text-zinc-400">{aliveRight} alive</span>
        </div>
      </div>
      {data.map?.name && (
        <span
          className="rounded-sm border border-white/10 px-1.5 py-px text-[8px] font-medium text-zinc-400"
          style={{ backgroundColor: 'rgba(var(--kos-background-dark-rgb), 0.90)' }}
        >
          {data.map.name}
        </span>
      )}
    </div>
  )
}
