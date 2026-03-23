import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface WatermarkProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'inline' | 'floating'
}

export function Watermark({ className, variant = 'inline', ...props }: WatermarkProps) {
  const baseClasses = 'flex items-center gap-2 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity'
  const variantClasses =
    variant === 'floating'
      ? 'absolute right-4 translate-y-full pt-3 text-muted-foreground pointer-events-none'
      : 'mt-3 justify-end text-muted-foreground'

  return (
    <div className={cn(baseClasses, variantClasses, className)} {...props}>
      <img
        src="https://avatars.githubusercontent.com/u/71390173?v=4"
        alt="Senor Scripts"
        className="w-6 h-6 rounded-full"
      />
      <span>Senor Scripts</span>
    </div>
  )
}


