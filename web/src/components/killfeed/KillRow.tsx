import { motion } from 'framer-motion'
import { Crosshair, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KillfeedEntry } from '@/types/killfeed'

interface KillRowProps extends KillfeedEntry {
  localPlayerId: number
}

/**
 * Single killfeed row; compact dark panel with accent when local player involved.
 */
export function KillRow(props: KillRowProps) {
  const myKill = props.killer.playerId === props.localPlayerId
  const myDeath = props.victim.playerId === props.localPlayerId

  return (
    <motion.div
      className={cn(
        'flex h-9 items-center justify-center gap-1.5 rounded-md border px-2 py-0.5',
        myKill && 'border-emerald-500/50 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]',
        myDeath && 'border-red-500/50 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]',
        !myKill && !myDeath && 'border-white/10'
      )}
      style={{ backgroundColor: 'rgba(var(--kos-background-dark-rgb), 0.90)' }}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-sm px-1.5 py-0.5',
          myKill ? 'bg-emerald-500/15' : 'bg-white/5'
        )}
      >
        <Ruler className="size-2.5 text-zinc-400" />
        <span className={cn('text-[10px] font-semibold tabular-nums', myKill ? 'text-emerald-300' : 'text-zinc-400')}>
          {props.meters}m
        </span>
      </div>
      <div className="flex items-center gap-1">
        <img
          src={props.killer.image}
          alt=""
          className={cn(
            'size-5 rounded-full border object-cover',
            myKill ? 'border-emerald-500/50' : 'border-white/15'
          )}
        />
        <span
          className={cn(
            'max-w-[72px] truncate text-[11px] font-semibold',
            myKill ? 'text-emerald-200' : 'text-zinc-100'
          )}
        >
          {props.killer.name}
        </span>
      </div>
      <div className="flex items-center gap-0.5 text-zinc-500">
        <Crosshair className="size-4" style={{ transform: 'scale(-1,1)' }} />
        {props.headshot && <span className="text-[9px] font-bold text-red-400">HS</span>}
      </div>
      <div className="flex items-center gap-1">
        <img
          src={props.victim.image}
          alt=""
          className={cn(
            'size-5 rounded-full border object-cover',
            myDeath ? 'border-red-500/50' : 'border-white/15'
          )}
        />
        <span
          className={cn(
            'max-w-[72px] truncate text-[11px] font-semibold',
            myDeath ? 'text-red-200' : 'text-zinc-100'
          )}
        >
          {props.victim.name}
        </span>
      </div>
    </motion.div>
  )
}
