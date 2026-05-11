import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface NumberButtonProps {
  label: string
  value: string
  displayValue?: string
  onChange: (value: string) => void
  inputAriaLabel?: string
  widthClassName?: string
  className?: string
}

export function NumberButton({
  label,
  value,
  displayValue,
  onChange,
  inputAriaLabel,
  widthClassName,
  className,
}: NumberButtonProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editing])

  const commit = () => {
    onChange(draft)
    setEditing(false)
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        'relative flex h-[58px] w-[249px] items-center rounded-[10px] border border-white/10 bg-[rgba(217,217,217,0.04)] px-4 focus-visible:outline-none',
        widthClassName,
        className
      )}
    >
      <span className="truncate pr-2 font-['Akrobat'] text-[18px] font-bold leading-[174.5%] tracking-[0.01em] text-white/50">
        {label} |
      </span>
      {!editing ? (
        <span className="min-w-0 flex-1 truncate text-right font-['Akrobat'] text-[18px] font-bold leading-[174.5%] tracking-[0.01em] text-white/80">
          {displayValue ?? value}
        </span>
      ) : null}

      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        aria-label={inputAriaLabel ?? label}
        className={cn(
          'absolute right-4 top-1/2 min-w-0 -translate-y-1/2 bg-transparent text-right font-[Akrobat] text-[18px] font-bold leading-[174.5%] tracking-[0.01em] text-white/85 outline-none focus:bg-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          editing ? 'w-[48%] opacity-100' : 'pointer-events-none w-0 opacity-0'
        )}
      />
    </button>
  )
}
