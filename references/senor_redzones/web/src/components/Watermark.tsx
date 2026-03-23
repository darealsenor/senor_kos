import { cn } from '@/lib/utils'

interface WatermarkProps {
  className?: string
}

export function Watermark({ className }: WatermarkProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 text-sm font-medium text-white/60 hover:text-white/80 transition-opacity',
        className
      )}
    >
      <img
        src="https://avatars.githubusercontent.com/u/71390173?v=4"
        alt="Senor Scripts"
        className="w-5 h-5 rounded-full"
      />
      <span>Senor Scripts</span>
    </div>
  )
}
