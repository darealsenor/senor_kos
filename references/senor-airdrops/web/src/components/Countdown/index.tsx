import { useNuiEvent } from '@/hooks/useNuiEvent'
import { debugData } from '@/utils/debugData'
import { formatTime, getTimeLeft } from '@/utils/GetTimeLeft'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import type { Airdrop } from '@/types'
import CountdownBadge from './CountdownBadge'
import { useLocale } from '@/providers/LocaleProvider'

// debugData([
//   {
//     action: 'setVisibleCountdown',
//     data: true,
//   },
//   {
//     action: 'JoinedAirdrop',
//     data: {
//       playerId: 2,
//       coords: { x: 200, y: 300, z: 12.4 },
//       lockTime: 45,
//       distance: 120,
//       prizes: [{ name: 'Armor', label: 'Armor', amount: 1 }],
//       weapons: 'Snipers',
//       settings: {
//         HS: 'Headshot Only',
//         Solo: 'Solo Gameplay',
//       },
//       dropState: 1,
//       startTime: Math.floor(Date.now() / 1000),
//       timeLeft: 60 * 3.5,
//       interaction: 'Gulag',
//       id: 'cdwq1',
//     } as Airdrop,
//   },
// ])

interface CountdownData {
  startTime: number
  timeLeft: number
  lockTime: number
}

const Countdown = () => {
  const [visible, setVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useLocale()

  const cleanupCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimeLeft(0)
    setVisible(false)
  }, [])

  useNuiEvent('setVisibleCountdown', setVisible)

  useNuiEvent('JoinedAirdrop', (data: CountdownData) => {
    cleanupCountdown()
    setVisible(true)
    setTimeLeft(data.timeLeft)
  })

  useNuiEvent('CancelAirdrop', () => {
    cleanupCountdown()
  })

  useEffect(() => {
    return () => {
      cleanupCountdown()
    }
  }, [cleanupCountdown])

  useEffect(() => {
    if (!visible || !timeLeft) {
      cleanupCountdown()
      return
    }

    const updateTime = () => {
      setTimeLeft((prev) => {
        const newTime = Math.max(prev - 1, 0)
        if (newTime <= 0) {
          cleanupCountdown()
        }
        return newTime
      })
    }

    intervalRef.current = setInterval(updateTime, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timeLeft, visible, cleanupCountdown])

  if (!visible || timeLeft <= 0) return null

  return (
    <div className="absolute top-[5%] left-[50%] -translate-x-1/2 z-50">
      <div className="absolute top-[5%] left-[50%] -translate-x-1/2 z-50">
        <CountdownBadge
          label={t('ui_airdrop_unlocks_in')}
          seconds={timeLeft}
          message={timeLeft <= 0 ? t('ui_drop_is_open') : undefined}
        />
      </div>
    </div>
  )
}

export default Countdown
