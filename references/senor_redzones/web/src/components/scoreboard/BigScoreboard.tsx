import type { ZoneLeaderboard } from '@/types'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/useLocale'
import { useTimeRemaining } from '@/hooks/useTimeRemaining'

function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface BigScoreboardProps {
  leaderboard: ZoneLeaderboard
  onClose?: () => void
  className?: string
}

export const BigScoreboard = ({ leaderboard, onClose, className }: BigScoreboardProps) => {
  const { t } = useLocale()
  const timeRemaining = useTimeRemaining(leaderboard)
  const { players: entries, currentPlayerId } = leaderboard
  const sortedEntries = [...entries].sort((a, b) => b.kills - a.kills)
  const isTime = leaderboard.durationType === 'time' && leaderboard.duration != null && leaderboard.duration > 0
  const isKills = leaderboard.durationType === 'kills' && leaderboard.duration != null && leaderboard.duration > 0
  const timerLabel = isTime && timeRemaining != null
    ? formatTimeRemaining(timeRemaining)
    : isKills
      ? `${leaderboard.totalKills ?? 0} / ${leaderboard.duration} ${t('kills').toLowerCase()}`
      : null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/60',
        className
      )}
    >
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="material-symbols-outlined text-rz-primary text-4xl">military_tech</span>
            <h1 className="text-white text-5xl font-bold tracking-tighter uppercase italic">
              {t('redzone')} <span className="text-rz-primary">{t('leaderboard')}</span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-6">
            <span className="text-rz-primary text-sm font-bold tracking-[0.2em] uppercase text-glow">{t('live_rankings')}</span>
            <div className="h-1 w-12 bg-rz-primary/30" />
            <span className="text-white/50 text-sm font-medium tracking-[0.1em] uppercase">{t('zone_stats')}</span>
          </div>
        </div>
        <div className="w-full bg-[rgba(var(--rz-background-dark-rgb),0.96)] border border-rz-primary/20 rounded shadow-2xl overflow-hidden">
          <div className="bg-rz-primary flex items-center px-8 py-4 shadow-neon">
            <div className="w-20 text-white font-bold text-xs tracking-widest uppercase">{t('rank')}</div>
            <div className="flex-1 text-white font-bold text-xs tracking-widest uppercase">{t('player')}</div>
            <div className="w-28 text-center text-white font-bold text-xs tracking-widest uppercase">{t('kills')}</div>
            <div className="w-28 text-center text-white font-bold text-xs tracking-widest uppercase">{t('deaths')}</div>
            <div className="w-40 text-right text-white font-bold text-xs tracking-widest uppercase">{t('current_streak')}</div>
          </div>
          <div className="flex flex-col">
            {sortedEntries.map((entry, idx) => {
              const isCurrentPlayer = entry.playerId === currentPlayerId
              return (
                <div
                  key={entry.playerId}
                  className={cn(
                    'flex items-center px-8 py-5 border-b border-white/5 transition-colors cursor-default',
                    isCurrentPlayer
                      ? 'bg-rz-primary/10 border-y-2 border-rz-primary/50 shadow-neon-strong relative overflow-hidden'
                      : 'hover:bg-white/5'
                  )}
                >
                  {isCurrentPlayer && <div className="absolute inset-0 row-gradient" />}
                  <div className={cn('w-20 font-bold text-2xl', isCurrentPlayer ? 'text-rz-primary text-3xl font-black italic relative z-10' : idx < 3 ? 'text-white/80' : 'text-white/60 text-xl')}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1 flex items-center gap-3 relative z-10">
                    <div
                      className={cn(
                        'rounded flex items-center justify-center border border-white/20',
                        isCurrentPlayer ? 'size-12 bg-rz-primary border-2' : 'size-10 bg-white/10'
                      )}
                    >
                      <span className="material-symbols-outlined text-white/60">person</span>
                    </div>
                    <div>
                      <span
                        className={cn(
                          'font-bold',
                          isCurrentPlayer ? 'text-white text-xl font-black tracking-tight uppercase italic underline decoration-rz-primary decoration-4 underline-offset-4' : 'text-white text-lg'
                        )}
                      >
                        {entry.name ?? `Player_${entry.playerId}`}
                      </span>
                      {isCurrentPlayer && (
                        <span className="flex items-center gap-1 text-rz-primary text-[10px] font-black tracking-[0.2em] uppercase mt-1">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                          {t('you')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-28 text-center font-medium relative z-10',
                      idx === 0 ? 'text-2xl font-black text-glow' : isCurrentPlayer ? 'text-2xl font-black' : 'text-xl'
                    )}
                    style={{ color: '#ffffff' }}
                  >
                    {entry.kills}
                  </div>
                  <div className={cn('w-28 text-center text-white/40 text-xl font-medium relative z-10', isCurrentPlayer && 'text-2xl font-bold')}>
                    {entry.deaths}
                  </div>
                  <div className="w-40 flex justify-end items-center gap-2 relative z-10">
                    {entry.streak > 0 ? (
                      <>
                        <span className={cn('font-bold text-lg', isCurrentPlayer ? 'text-rz-primary font-black text-2xl italic' : 'text-white/60')}>
                          {entry.streak}
                        </span>
                        <span
                          className={cn('material-symbols-outlined', isCurrentPlayer ? 'text-rz-primary text-3xl' : 'text-white/20')}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          local_fire_department
                        </span>
                      </>
                    ) : (
                      <span className="text-white/20 italic font-bold text-lg">--</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-8 py-4 bg-white/5 flex items-center justify-between border-t border-white/10">
            <div className="flex gap-12">
              <div className="flex flex-col">
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{t('total_kills')}</span>
                <span className="text-rz-primary font-bold">{entries.reduce((s, e) => s + e.kills, 0)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{t('active_players')}</span>
                <span className="text-white font-bold">{entries.length}</span>
              </div>
              {timerLabel != null && (
                <div className="flex flex-col">
                  <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                    {isTime ? t('time_left') : t('kills')}
                  </span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-rz-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isTime ? 'schedule' : 'gps_fixed'}
                    </span>
                    {timerLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between w-full text-white/40 font-medium">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 hover:text-white transition-colors uppercase text-xs tracking-widest"
          >
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/20 text-[10px]">ESC</kbd>
            {t('back')}
          </button>
          {/* <span className="text-[10px] tracking-[0.3em] uppercase opacity-60">{t('redzone')}</span> */}
        </div>
      </div>
    </div>
  )
}
