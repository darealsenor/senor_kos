import { motion } from 'framer-motion'
import { Crosshair, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KillfeedEntry } from '@/types/killfeed'

interface KillRowProps extends KillfeedEntry {
  localPlayerId: number
}

/**
 * Single killfeed row; styling follows senor-hud-2 gradients with CEF-safe icons.
 */
export function KillRow(props: KillRowProps) {
  const myKill = props.killer.playerId === props.localPlayerId
  const myDeath = props.victim.playerId === props.localPlayerId

  return (
    <motion.div
      className={cn(
        'flex h-10 items-center justify-center gap-2 rounded-lg border px-2 py-1',
        myKill
          ? 'border-primary/40 bg-primary/10'
          : myDeath
            ? 'border-destructive/40 bg-destructive/10'
            : 'border-border bg-secondary/30'
      )}
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          'flex items-center gap-1 rounded-sm px-2 py-1',
          myKill ? 'bg-primary/20' : 'bg-muted/40'
        )}
      >
        <Ruler className="size-3 text-foreground/70" />
        <span className={cn('text-xs font-semibold', myKill ? 'text-primary' : 'text-foreground/70')}>
          {props.meters}m
        </span>
      </div>
      <div className="flex items-center gap-2">
        <img
          src={props.killer.image}
          alt=""
          className={cn(
            'size-6 rounded-full border object-cover',
            myKill ? 'border-primary/60' : 'border-border'
          )}
        />
        <span
          className={cn('max-w-[96px] truncate text-sm font-semibold', myKill ? 'text-primary' : 'text-foreground')}
        >
          {props.killer.name}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Crosshair className="size-5 text-muted-foreground" style={{ transform: 'scale(-1,1)' }} />
        {props.headshot && <span className="text-[10px] font-medium text-destructive">HS</span>}
      </div>
      <div className="flex items-center gap-2">
        <img
          src={props.victim.image}
          alt=""
          className={cn(
            'size-6 rounded-full border object-cover',
            myDeath ? 'border-destructive/60' : 'border-border'
          )}
        />
        <span
          className={cn('max-w-[96px] truncate text-sm font-semibold', myDeath ? 'text-destructive' : 'text-foreground')}
        >
          {props.victim.name}
        </span>
      </div>
    </motion.div>
  )
}
