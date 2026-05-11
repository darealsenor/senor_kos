import { Skull } from 'lucide-react'
import { cn } from '@/lib/utils'

const BLANK_AVATAR =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2264%22%20height%3D%2264%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20fill%3D%22%23110f12%22/%3E%3Cpath%20d%3D%22M18%2044%20c10-12%2018-12%2028%200%20c7%209%206%2012%20-1%2016%20H19%20c-7-4%20-8-7%20-1-16z%22%20fill%3D%22%232a262d%22/%3E%3C/svg%3E'

export type TeamColor = 'red' | 'blue' | 'green'

interface PlayerPortraitProps {
  name?: string
  image?: string | null
  dead: boolean
  team: TeamColor
  size?: number
  showAliveDot?: boolean
  scheme?: 'team' | 'neutral'
  showTeamLine?: boolean
  className?: string
}

/**
 * Small player portrait used in scoreboard and top HUD.
 * Dead players show a skull overlay and a stronger team-colored glow line.
 * Set `showTeamLine` false for compact rows (e.g. top HUD).
 */
export function PlayerPortrait({
  image,
  dead,
  team,
  size = 42,
  showAliveDot = false,
  scheme = 'team',
  showTeamLine = true,
  className,
}: PlayerPortraitProps) {
  const avatarSrc = image || BLANK_AVATAR

  const teamBase =
    scheme === 'neutral'
      ? { ring: 'border-border', line: 'bg-muted-foreground/25' }
      : team === 'red'
        ? { ring: 'border-[#ff3a3a]/30', line: 'bg-[#ff3a3a]/22' }
        : team === 'green'
          ? { ring: 'border-[#3a9b47]/30', line: 'bg-[#3a9b47]/22' }
          : { ring: 'border-blue-500/30', line: 'bg-blue-500/22' }

  const deadRing = dead ? 'border-white/10' : teamBase.ring

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn(
          'relative overflow-hidden border bg-transparent text-card-foreground',
          dead ? 'filter grayscale opacity-80' : 'opacity-100',
          dead ? 'border-border' : deadRing
        )}
        style={{ width: size, height: size, borderRadius: size === 40 ? 5 : size * 0.125 }}
      >
        <img
          src={avatarSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {dead && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="absolute inset-0 bg-black/50" />
             <Skull
               className={cn(
                 'absolute z-10',
                 size < 28 ? 'size-4' : 'size-8',
                 scheme === 'neutral' ? 'text-foreground/70' : team === 'red' ? 'text-[#ff3a3a]' : team === 'green' ? 'text-[#3a9b47]' : 'text-blue-300'
               )}
             />
          </div>
        )}
        {!dead && showAliveDot && (
          <span
            className={cn(
              'absolute bottom-1 right-1 size-2 rounded-full',
              scheme === 'neutral' ? 'bg-muted-foreground' : team === 'red' ? 'bg-red-500' : 'bg-blue-500',
              'shadow-[0_0_8px_rgba(255,255,255,0.12)]'
            )}
          />
        )}
      </div>
      {showTeamLine ? (
        <div
          className={cn(
            'mt-[6px] h-[3px] w-[70%] rounded-full',
            dead ? 'bg-muted-foreground/20' : teamBase.line
          )}
        />
      ) : null}
    </div>
  )
}
