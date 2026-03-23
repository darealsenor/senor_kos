import { AlarmClock } from 'lucide-react'
import { formatTime } from '@/utils/GetTimeLeft'

interface CountdownBadgeProps {
  label: string
  seconds?: number
  message?: string
}

function CountdownBadge({ label, seconds, message }: CountdownBadgeProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-black/80 rounded-full text-white shadow-lg whitespace-nowrap">
      <AlarmClock className="w-5 h-5 shrink-0" />
      {message ? (
        <span className="font-bold text-sm">{message}</span>
      ) : (
        <>
          <span className="uppercase font-semibold text-sm">{label}</span>
          <span className="font-bold text-xl">{seconds !== undefined ? formatTime(seconds) : '0:00'}</span>
        </>
      )}
    </div>
  )
}

export default CountdownBadge
