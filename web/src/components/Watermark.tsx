import { cn } from '@/lib/utils'

interface WatermarkProps {
  className?: string
}

export function Watermark({ className }: WatermarkProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 text-sm font-medium text-muted-foreground/70 transition-opacity hover:text-muted-foreground',
        className
      )}
    >
      <img
        src="https://avatars.githubusercontent.com/u/71390173?v=4"
        alt="Senor Scripts"
        className="h-5 w-5 rounded-full"
      />
      <span>Senor Scripts</span>
    </div>
  )
}
