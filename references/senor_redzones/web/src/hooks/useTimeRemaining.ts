import { useState, useEffect } from 'react'
import type { ZoneLeaderboard } from '@/types'

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Returns current seconds remaining for time-based zones.
 * When leaderboard has endTime, derives countdown locally and updates every second.
 */
export function useTimeRemaining(leaderboard: ZoneLeaderboard | null): number | null {
  const endTime = leaderboard?.endTime
  const isTime = leaderboard?.durationType === 'time' && (leaderboard?.duration ?? 0) > 0

  const [remaining, setRemaining] = useState<number | null>(() => {
    if (!isTime || endTime == null) return null
    return Math.max(0, endTime - nowSeconds())
  })

  useEffect(() => {
    if (!isTime || endTime == null) {
      setRemaining(null)
      return
    }
    const tick = () => {
      const secs = Math.max(0, endTime - nowSeconds())
      setRemaining(secs)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isTime, endTime])

  return remaining
}
