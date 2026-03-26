import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNuiEvent } from '@/hooks/useNuiEvent'
import { KillRow } from './KillRow'
import type { KillfeedEntry } from '@/types/killfeed'

const MAX_ROWS = 5
const CLEAR_MS = 5000

interface KillfeedProps {
  localPlayerId: number
}

/**
 * Stacks recent kills from NUI; mirrors senor-hud-2 queue and timeout behaviour.
 */
export function Killfeed({ localPlayerId }: KillfeedProps) {
  const [kills, setKills] = useState<KillfeedEntry[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addKill = useCallback((kill: KillfeedEntry) => {
    setKills((prev) => [...prev.slice(-(MAX_ROWS - 1)), kill])
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setKills([])
      timerRef.current = null
    }, CLEAR_MS)
  }, [])

  useNuiEvent<KillfeedEntry>('newKill', (kill) => {
    if (kill) addKill(kill)
  })

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  return (
    <motion.div
      className="pointer-events-none fixed right-[3%] top-[12%] z-hud flex w-[min(360px,36vw)] flex-col items-end justify-start gap-0.5 bg-transparent p-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="popLayout">
        {kills.map((k) => (
          <motion.div
            key={String(k.killId)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <KillRow {...k} localPlayerId={localPlayerId} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
