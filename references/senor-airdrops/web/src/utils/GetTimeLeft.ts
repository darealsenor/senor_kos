import { Airdrop } from '@/types'

export const getTimeLeft = (airdrop: Airdrop) => {
  // Server sends timeLeft directly, which is already in seconds
  return Math.max(airdrop.timeLeft, 0)
}

export const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}