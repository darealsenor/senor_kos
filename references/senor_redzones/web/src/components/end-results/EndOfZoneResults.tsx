import type { EndOfZoneResults as EndResults, LeaderboardEntry } from '@/types'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/useLocale'

interface EndOfZoneResultsProps {
  results: EndResults
  currentPlayerId?: number
  currentPlayerStats?: LeaderboardEntry | null
  onClose?: () => void
  className?: string
}

const PODIUM_ORDER = [2, 1, 3] as const
const PODIUM_STYLES: Record<number, { height: string; border: string; badge: string }> = {
  1: { height: 'h-72', border: 'border-t-4 border-rz-primary', badge: '1ST' },
  2: { height: 'h-56', border: 'border-t-2 border-white/40', badge: '2ND' },
  3: { height: 'h-44', border: 'border-t-2 border-white/30', badge: '3RD' },
}

export const EndOfZoneResults = ({
  results,
  currentPlayerId,
  currentPlayerStats,
  className,
}: EndOfZoneResultsProps) => {
  const { t } = useLocale()
  const top3 = results.topPlayers.slice(0, 3)
  const podiumData = PODIUM_ORDER.map((rank) => ({
    rank,
    entry: top3[rank - 1],
    style: PODIUM_STYLES[rank],
  }))

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const myStats = currentPlayerStats ?? (currentPlayerId != null ? results.topPlayers.find((p) => p.playerId === currentPlayerId) : null)

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-black/70', className)}>
      <div className="relative z-10 w-[90vw] max-w-[1400px]">
        <div className="relative bg-[rgba(var(--rz-background-dark-rgb),0.98)] border border-rz-primary/20 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden rounded-lg">
          <div className="scanline-overlay absolute inset-0 z-0" />
          <header className="relative z-10 flex flex-col items-center pt-10 pb-5 border-b border-rz-primary/10">
            <div className="flex items-center gap-3 text-rz-primary mb-3">
              <span className="material-symbols-outlined text-xl">security</span>
              <span className="text-sm font-bold tracking-[0.3em] uppercase">{t('sector_secured')}</span>
            </div>
            <h1 className="text-7xl font-bold tracking-tighter text-white uppercase italic neon-glow">
              {results.zoneName} <span className="text-rz-primary">{t('cleared')}</span>
            </h1>
          </header>
          <div className="relative z-10 px-16 py-8">
            <div className="flex flex-row items-end justify-center gap-8 mb-12 mt-4">
              {podiumData.map(({ rank, entry, style }) => (
                <div key={rank} className={cn('flex flex-col items-center', rank === 2 ? 'w-1/4' : rank === 1 ? 'w-1/3 z-20' : 'w-1/4')}>
                  <div className="relative mb-8 flex flex-col items-center">
                    <div
                      className={cn(
                        'border-2 rotate-45 flex items-center justify-center overflow-hidden bg-rz-background-dark',
                        rank === 1 && 'w-44 h-44 border-4 border-rz-primary shadow-[0_0_40px_rgba(242,13,24,0.5)]',
                        rank === 2 && 'w-32 h-32 border-white/40',
                        rank === 3 && 'w-32 h-32 border-white/30',
                        !entry && 'opacity-20'
                      )}
                    >
                      <span className="material-symbols-outlined -rotate-45 text-white/60 text-6xl">person</span>
                    </div>
                    <div
                      className={cn(
                        'absolute font-bold px-3 py-1 text-sm rounded-sm left-1/2 -translate-x-1/2',
                        rank === 1 && 'bg-rz-primary text-white -bottom-5 px-6 py-2 text-base shadow-lg',
                        rank === 2 && 'bg-white/40 text-white -bottom-4',
                        rank === 3 && 'bg-white/30 text-white -bottom-4',
                        !entry && 'opacity-20'
                      )}
                    >
                      {style.badge}
                    </div>
                    {rank === 1 && (
                      <span className={cn('material-symbols-outlined absolute -top-12 left-1/2 -translate-x-1/2 text-rz-primary text-6xl neon-glow', !entry && 'opacity-20')}>
                        military_tech
                      </span>
                    )}
                  </div>
                  <div className={cn('w-full podium-gradient-1 flex flex-col items-center pt-6 px-4 text-center relative overflow-hidden', style.height, style.border, !entry && 'opacity-20')}>
                    {rank === 1 && entry && <div className="absolute inset-0 bg-rz-primary/5" />}
                    {entry ? (
                      <>
                        <span className={cn('font-bold truncate w-full', rank === 1 ? 'text-white text-2xl tracking-tight' : 'text-xl text-white/90')}>
                          {entry.name ?? `Player_${entry.playerId}`}
                        </span>
                        <span className={cn('text-sm uppercase tracking-widest mt-2 italic', rank === 1 ? 'text-rz-primary font-bold tracking-[0.2em]' : 'text-white/60')}>
                          {rank === 1 ? t('mvp') : t('kills_count', String(entry.kills))}
                        </span>
                        {rank === 1 && (
                          <div className="mt-5 flex gap-2">
                            {[1, 2, 3].map((i) => (
                              <span key={i} className="material-symbols-outlined text-rz-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-white/20 text-sm uppercase tracking-widest italic">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {myStats && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rz-primary/30 to-transparent" />
                  <h2 className="text-2xl font-bold uppercase tracking-widest text-rz-primary italic">{t('your_performance')}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rz-primary/30 to-transparent" />
                </div>
                <div className="grid grid-cols-4 gap-5 mb-10">
                  <div className="bg-rz-background-dark/60 border border-rz-primary/10 p-6 rounded group hover:border-rz-primary/40 transition-colors">
                    <p className="text-white/60 text-sm uppercase font-bold tracking-widest mb-2">{t('total_kills')}</p>
                    <span className="text-4xl font-bold text-white">{myStats.kills}</span>
                  </div>
                  <div className="bg-rz-background-dark/60 border border-rz-primary/10 p-6 rounded group hover:border-rz-primary/40 transition-colors">
                    <p className="text-white/60 text-sm uppercase font-bold tracking-widest mb-2">{t('deaths')}</p>
                    <span className="text-4xl font-bold text-white">{myStats.deaths}</span>
                  </div>
                  <div className="bg-rz-background-dark/60 border border-rz-primary/10 p-6 rounded group hover:border-rz-primary/40 transition-colors">
                    <p className="text-white/60 text-sm uppercase font-bold tracking-widest mb-2">{t('best_streak')}</p>
                    <span className="text-4xl font-bold text-white">{myStats.streak}</span>
                  </div>
                  <div className="bg-rz-background-dark/60 border border-rz-primary/10 p-6 rounded group hover:border-rz-primary/40 transition-colors">
                    <p className="text-white/60 text-sm uppercase font-bold tracking-widest mb-2">{t('duration_label')}</p>
                    <span className="text-4xl font-bold text-white">{formatTime(results.duration)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-rz-primary to-transparent opacity-50" />
        </div>
      </div>
    </div>
  )
}
