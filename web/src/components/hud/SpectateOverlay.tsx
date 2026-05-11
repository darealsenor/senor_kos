import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useNuiStore } from '@/store/nuiStore'
import { useLocale } from '@/hooks/useLocale'
import { PlayerPortrait, type TeamColor } from '@/components/hud/PlayerPortrait'
import { cn } from '@/lib/utils'

interface KeyHintProps {
  keyLabel: string
  text: string
  icon: React.ReactNode
}

function KeyHint({ keyLabel, text, icon }: KeyHintProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center justify-center min-w-[28px] h-[24px] rounded-md border border-white/15 bg-black/40 px-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white/80 shadow-[inset_0_-1px_0_rgba(0,0,0,0.4)]">
        {keyLabel}
      </span>
      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-white/60">
        {icon}
        {text}
      </span>
    </div>
  )
}

/**
 * Bottom-center spectate HUD pane. Shows the target you're watching plus prev/next/stop key hints.
 * Resolves target details from matchData when available; falls back to a neutral row otherwise.
 */
export function SpectateOverlay() {
  const spectate = useNuiStore((s) => s.spectate)
  const matchData = useNuiStore((s) => s.matchData)
  const { t } = useLocale()

  const players = matchData?.match?.players ?? []
  const target = players.find((p) => p.id === spectate.targetId) ?? null

  const teamColor: TeamColor =
    target?.team === 'teamA' ? 'red' : target?.team === 'teamB' ? 'green' : 'red'
  const themeTint =
    target?.team === 'teamA'
      ? 'rgba(255,58,58,0.4)'
      : target?.team === 'teamB'
        ? 'rgba(58,155,71,0.4)'
        : 'rgba(255,255,255,0.12)'
  const accentSolid =
    target?.team === 'teamA'
      ? '#ff3a3a'
      : target?.team === 'teamB'
        ? '#3a9b47'
        : 'rgba(255,255,255,0.45)'

  const displayName = target?.name?.trim() || `Player ${spectate.targetId}`
  const gangLabel = target?.gang?.label?.trim() || target?.gang?.name?.trim() || null
  const scopeLabel =
    spectate.scope === 'match' ? t('spectate_scope_match') : t('spectate_scope_team')

  return (
    <AnimatePresence>
      {spectate.visible && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-hud flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <div
            className="relative flex h-[58px] items-center gap-[14px] rounded-[10px] px-4 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
            style={{
              background: `linear-gradient(90deg, rgba(14,14,17,0.85) 0%, ${themeTint} 100%)`,
            }}
          >
            {/* Scope label cap */}
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/45">
                {t('spectate_label')}
              </span>
              <span
                className="mt-1 text-[12px] font-bold uppercase tracking-[0.18em]"
                style={{ color: accentSolid }}
              >
                {scopeLabel}
              </span>
            </div>

            <div className="h-[28px] w-px bg-white/10" />

            {/* Target identity */}
            <div className="flex items-center gap-3">
              <PlayerPortrait
                image={target?.avatar ?? null}
                dead={false}
                team={teamColor}
                size={40}
                scheme={target ? 'team' : 'neutral'}
                showTeamLine={false}
                className="!border-none"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-[16px] font-bold text-white drop-shadow-md max-w-[180px] truncate">
                  {displayName}
                </span>
                {gangLabel ? (
                  <span className="text-[11px] uppercase tracking-widest text-white/45 max-w-[180px] truncate">
                    {gangLabel}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Alive count (team scope only) */}
            {spectate.scope === 'team' && typeof spectate.aliveCount === 'number' ? (
              <>
                <div className="h-[28px] w-px bg-white/10" />
                <div className="flex flex-col items-center leading-none">
                  <span className="font-display text-[18px] font-bold text-white tabular-nums">
                    {spectate.aliveCount}
                  </span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                    {t('spectate_alive_remaining')}
                  </span>
                </div>
              </>
            ) : null}

            <div className="h-[28px] w-px bg-white/10" />

            {/* Key hints */}
            <div className={cn('flex items-center gap-3.5')}>
              <KeyHint
                keyLabel={spectate.prevKey || 'LEFT'}
                text={t('spectate_prev')}
                icon={<ChevronLeft className="size-3" />}
              />
              <KeyHint
                keyLabel={spectate.nextKey || 'RIGHT'}
                text={t('spectate_next')}
                icon={<ChevronRight className="size-3" />}
              />
              {spectate.scope === 'match' && (
                <KeyHint
                  keyLabel={spectate.stopKey || 'BACK'}
                  text={t('spectate_stop')}
                  icon={<X className="size-3" />}
                />
              )}
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
