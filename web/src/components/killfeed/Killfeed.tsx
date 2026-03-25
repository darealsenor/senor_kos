import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNuiEvent } from '@/hooks/useNuiEvent'
import { isEnvBrowser } from '@/utils/misc'
import { KillRow } from './KillRow'
import type { KillfeedEntry, KillfeedPlayer } from '@/types/killfeed'

const MOCK_PLAYERS: KillfeedPlayer[] = [
  { playerId: 1, name: 'Alpha', image: 'https://cdn.discordapp.com/embed/avatars/0.png' },
  { playerId: 2, name: 'Bravo', image: 'https://cdn.discordapp.com/embed/avatars/1.png' },
  { playerId: 3, name: 'Charlie', image: 'https://cdn.discordapp.com/embed/avatars/2.png' },
]

function randomPlayer(): KillfeedPlayer {
  return MOCK_PLAYERS[Math.floor(Math.random() * MOCK_PLAYERS.length)]
}

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

  useEffect(() => {
    if (!isEnvBrowser()) return
    const id = window.setInterval(() => {
      addKill({
        killer: randomPlayer(),
        victim: randomPlayer(),
        headshot: Math.random() > 0.5,
        meters: Math.floor(Math.random() * 200),
        killId: Math.random(),
      })
    }, 2800)
    return () => window.clearInterval(id)
  }, [addKill])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    []
  )

  return (
    <motion.div
      className="pointer-events-none fixed right-[3%] top-[14%] z-hud flex w-[min(420px,38vw)] flex-col items-end justify-start gap-1 bg-transparent p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <AnimatePresence mode="popLayout">
        {kills.map((k) => (
          <motion.div
            key={String(k.killId)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
          >
            <KillRow {...k} localPlayerId={localPlayerId} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
