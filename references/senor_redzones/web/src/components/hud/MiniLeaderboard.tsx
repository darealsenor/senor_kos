import type { ZoneLeaderboard } from '@/types'
import type { HudPosition } from '@/data/defaults'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/useLocale'
import { useTimeRemaining } from '@/hooks/useTimeRemaining'

const POSITION_CLASSES: Record<HudPosition, string> = {
  top: 'top-8 left-1/2 -translate-x-1/2',
  'top-right': 'top-8 right-8',
  'top-left': 'top-8 left-8',
  bottom: 'bottom-8 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-8 right-8',
  'bottom-left': 'bottom-8 left-8',
  'center-right': 'top-1/2 right-8 -translate-y-1/2',
  'center-left': 'top-1/2 left-8 -translate-y-1/2',
}

function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface MiniLeaderboardProps {
  leaderboard: ZoneLeaderboard
  position?: HudPosition
  scoreboardKey?: string
  className?: string
}

const TOP_ENTRIES = 5

export const MiniLeaderboard = ({ leaderboard, position = 'top-right', scoreboardKey, className }: MiniLeaderboardProps) => {
  const { t } = useLocale()
  const timeRemaining = useTimeRemaining(leaderboard)
  const topFive = leaderboard.players.slice(0, TOP_ENTRIES)
  const positionClass = POSITION_CLASSES[position] ?? POSITION_CLASSES['top-right']
  const isTime = leaderboard.durationType === 'time' && leaderboard.duration != null && leaderboard.duration > 0
  const isKills = leaderboard.durationType === 'kills' && leaderboard.duration != null && leaderboard.duration > 0
  const timerLabel = isTime && timeRemaining != null
    ? formatTimeRemaining(timeRemaining)
    : isKills
      ? `${leaderboard.totalKills ?? 0} / ${leaderboard.duration} ${t('kills').toLowerCase()}`
      : null

  return (
    <div className={cn('absolute w-72 pointer-events-auto', positionClass, className)}>
      <div className="bg-[rgba(var(--rz-background-dark-rgb),0.95)] border border-rz-primary/20 rounded shadow-2xl overflow-hidden">
        <div className="relative px-4 py-3 border-b border-rz-primary/30 flex items-center justify-between bg-rz-primary/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rz-primary text-xl">rocket_launch</span>
            <h2 className="text-white text-xs font-bold tracking-[0.2em] leading-none uppercase">{t('redzone')}</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-rz-primary animate-pulse" />
            <span className="text-[10px] text-white/60 font-bold tracking-tighter uppercase">{t('top_5_players')}</span>
          </div>
        </div>
        {timerLabel != null && (
          <div className="px-4 py-2 border-b border-rz-primary/20 flex items-center justify-center gap-2 bg-black/30">
            <span className="material-symbols-outlined text-rz-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isTime ? 'schedule' : 'gps_fixed'}
            </span>
            <span className="text-rz-primary text-xs font-bold tracking-wider uppercase">{timerLabel}</span>
          </div>
        )}
        <div className="flex flex-col scanline">
          {topFive.map((entry, idx) => (
            <div
              key={entry.playerId}
              className={cn(
                'flex items-center justify-between px-4 py-3 border-b border-white/5 transition-all duration-300',
                idx === 0 ? 'neon-glow-red border-rz-primary/20' : 'hover:bg-white/5 py-3',
                idx === topFive.length - 1 && 'border-b-0'
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'font-bold text-sm tracking-tighter',
                    idx === 0 ? 'text-rz-primary' : 'text-white/40'
                  )}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      'font-medium text-xs tracking-wider uppercase flex items-center gap-1',
                      idx === 0 ? 'text-white font-bold' : 'text-white/90'
                    )}
                  >
                    {entry.name ?? `Player_${entry.playerId}`}
                    {idx === 0 && <span className="material-symbols-outlined text-[10px] text-rz-primary">grade</span>}
                  </span>
                  {idx === 0 && <span className="text-[8px] text-rz-primary font-bold uppercase tracking-widest text-glow">{t('current_leader')}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={cn('font-bold text-sm', idx === 0 && 'text-glow')}
                  style={{ color: '#ffffff' }}
                >{entry.kills}</span>
                <span className="text-[8px] text-white/40 font-bold uppercase tracking-tighter">{t('kills')}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5 bg-black/40 flex justify-center border-t border-white/5">
          <div className="flex items-center gap-2">
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] text-white/60 font-bold border border-white/10 uppercase">
              {scoreboardKey}
            </kbd>
            <span className="text-[9px] text-white/40 font-bold tracking-widest uppercase">{t('full_leaderboard')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
