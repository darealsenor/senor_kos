import { cn } from '@/lib/utils'

interface PickerButtonProps {
  label: string
  onPrev: () => void
  onNext: () => void
  className?: string
  widthClassName?: string
  disabled?: boolean
  prevAriaLabel?: string
  nextAriaLabel?: string
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="7"
      height="12"
      viewBox="0 0 7 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(direction === 'left' ? '' : 'rotate-180')}
      aria-hidden
    >
      <path d="M5.28052 0.624755L1.28052 5.62476L5.28052 10.6248" stroke="#2C2C2C" strokeWidth="2" />
    </svg>
  )
}

export function PickerButton({
  label,
  onPrev,
  onNext,
  className,
  widthClassName,
  disabled,
  prevAriaLabel,
  nextAriaLabel,
}: PickerButtonProps) {
  return (
    <div
      className={cn(
        'relative h-[58px] w-[249px] rounded-[10px] border border-white/10 bg-[rgba(217,217,217,0.04)]',
        widthClassName,
        className
      )}
    >
      <button
        type="button"
        className="absolute left-3 top-1/2 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-[5px] bg-[#dfdfdf] shadow-[inset_0_0_21px_rgba(89,89,89,0.55),0_4px_36px_rgba(223,223,223,0.25)] active:bg-[#dfdfdf] disabled:opacity-50"
        onClick={onPrev}
        aria-label={prevAriaLabel ?? 'Previous'}
        disabled={disabled}
      >
        <ArrowIcon direction="left" />
      </button>

      <div className="flex h-full items-center justify-center px-12 text-center font-['Akrobat'] text-[18px] font-bold leading-[174.5%] tracking-[0.01em] text-white/50">
        {label}
      </div>

      <button
        type="button"
        className="absolute right-3 top-1/2 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-[5px] bg-[#dfdfdf] shadow-[inset_0_0_21px_rgba(89,89,89,0.55),0_4px_36px_rgba(223,223,223,0.25)] active:bg-[#dfdfdf] disabled:opacity-50"
        onClick={onNext}
        aria-label={nextAriaLabel ?? 'Next'}
        disabled={disabled}
      >
        <ArrowIcon direction="right" />
      </button>
    </div>
  )
}
