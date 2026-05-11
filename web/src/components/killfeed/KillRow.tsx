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
        'flex h-[40px] items-center justify-center gap-3 rounded-full border border-white/[0.03] px-2.5',
        myKill && 'shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]',
        myDeath && 'shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]',
      )}
      style={{
        background: myDeath
          ? 'linear-gradient(90deg, rgba(159,58,58,0.95) 0%, rgba(20,22,25,0.85) 100%)'
          : myKill
            ? 'linear-gradient(90deg, rgba(52,211,153,0.3) 0%, rgba(20,22,25,0.9) 100%)'
            : 'linear-gradient(90deg, rgba(20,22,25,0.95) 0%, rgba(20,22,25,0.45) 100%)',
      }}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <div
        className={cn(
          'flex h-[26px] min-w-[56px] items-center justify-center rounded-full px-2',
          myKill ? 'bg-emerald-500/15' : 'bg-white/[0.04]',
        )}
      >
        <span className="text-[14px] font-bold tabular-nums flex items-center">
          {(() => {
            const m = props.meters.toString().padStart(3, '0')
            const leadingZerosLength = m.match(/^0+/)?.[0].length || 0
            const prefix = m.substring(0, leadingZerosLength)
            const body = m.substring(leadingZerosLength)

            return (
              <>
                <span className={cn(myKill ? 'text-emerald-500/40' : 'text-white/20')}>{prefix}</span>
                <span className={cn(myKill ? 'text-emerald-300' : 'text-white')}>{body}</span>
              </>
            )
          })()}
          <span className={cn(myKill ? 'text-emerald-300' : 'text-white', 'ml-[1px]')}>m</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <img
          src={props.killer.image}
          alt=""
          className={cn(
            'size-[24px] rounded-[5px] border object-cover',
            myKill ? 'border-emerald-500/50' : 'border-transparent',
          )}
        />
        <span
          className={cn(
            'max-w-[120px] truncate text-[16px] font-bold tracking-wide uppercase',
            myKill ? 'text-emerald-200' : 'text-white',
          )}
        >
          {props.killer.name}
        </span>
      </div>
      <div className="flex items-center gap-0.5 text-zinc-500 mx-1">
        <Crosshair className="size-[24px] text-[#ff3a3a]" strokeWidth={2} />
        {props.headshot && <span className="text-[13px] font-black text-[#ff3a3a] leading-none ml-0.5">HS</span>}
      </div>
      <div className="flex items-center gap-2 pr-1">
        <img
          src={props.victim.image}
          alt=""
          className={cn(
            'size-[24px] rounded-[5px] border object-cover',
            myDeath ? 'border-red-500/50' : 'border-transparent',
          )}
        />
        <span className="max-w-[120px] truncate text-[16px] font-bold tracking-wide uppercase text-[#ff3a3a]">
          {props.victim.name}
        </span>
      </div>
    </motion.div>
  )
}
