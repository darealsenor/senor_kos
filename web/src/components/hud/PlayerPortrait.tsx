import { Skull } from 'lucide-react'
import { cn } from '@/lib/utils'

const BLANK_AVATAR =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2264%22%20height%3D%2264%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22%23110f12%22/%3E%3Cpath%20d%3D%22M18%2044%20c10-12%2018-12%2028%200%20c7%209%206%2012%20-1%2016%20H19%20c-7-4%20-8-7%20-1-16z%22%20fill%3D%22%232a262d%22/%3E%3C/svg%3E'

export type TeamColor = 'red' | 'blue'

interface PlayerPortraitProps {
  name?: string
  image?: string | null
  dead: boolean
  team: TeamColor
  size?: number
  showAliveDot?: boolean
}

/**
 * Small player portrait used in scoreboard and top HUD.
 * Dead players show a skull overlay and a stronger team-colored glow line.
 */
export function PlayerPortrait({
  image,
  dead,
  team,
  size = 42,
  showAliveDot = false,
}: PlayerPortraitProps) {
  const avatarSrc = image || BLANK_AVATAR

  const teamBase =
    team === 'red'
      ? { ring: 'border-red-500/30', line: 'bg-red-500/22' }
      : { ring: 'border-blue-500/30', line: 'bg-blue-500/22' }

  const deadRing = dead ? 'border-white/10' : teamBase.ring

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative overflow-hidden rounded-sm border bg-transparent text-card-foreground',
          dead ? 'filter grayscale opacity-80' : 'opacity-100',
          dead ? 'border-border' : deadRing
        )}
        style={{ width: size, height: size }}
      >
        <img
          src={avatarSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {dead && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/70 p-2">
              <Skull className={cn('size-6', team === 'red' ? 'text-red-300' : 'text-blue-300')} />
            </div>
          </div>
        )}
        {!dead && showAliveDot && (
          <span
            className={cn(
              'absolute bottom-1 right-1 size-2 rounded-full',
              team === 'red' ? 'bg-red-500' : 'bg-blue-500',
              'shadow-[0_0_8px_rgba(255,255,255,0.12)]'
            )}
          />
        )}
      </div>
      <div
        className={cn(
          'mt-[6px] h-[3px] w-[70%] rounded-full',
          dead ? 'bg-muted-foreground/20' : teamBase.line
        )}
      />
    </div>
  )
}

