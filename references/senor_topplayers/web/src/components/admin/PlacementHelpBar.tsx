import React from 'react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/useLocale'

function KeyChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[1.75rem] items-center justify-center rounded-md border border-input bg-muted px-2 py-0.5 text-xs font-medium text-foreground',
        className
      )}
    >
      {children}
    </span>
  )
}

function KeyRow({ label, keys }: { label: string; keys: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">{keys}</div>
    </div>
  )
}

export function PlacementHelpBar() {
  const { t } = useLocale()
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-4 py-2.5 shadow-lg">
      <KeyRow
        label={t('placement_movement')}
        keys={
          <>
            <KeyChip>W</KeyChip>
            <KeyChip>A</KeyChip>
            <KeyChip>S</KeyChip>
            <KeyChip>D</KeyChip>
          </>
        }
      />
      <KeyRow
        label={t('placement_up_down')}
        keys={
          <>
            <KeyChip>Q</KeyChip>
            <KeyChip>E</KeyChip>
          </>
        }
      />
      <KeyRow label={t('placement_slow')} keys={<KeyChip>CTRL</KeyChip>} />
      <KeyRow label={t('placement_speed')} keys={<KeyChip>SHIFT</KeyChip>} />
      <KeyRow
        label={t('placement_zone_height')}
        keys={
          <>
            <KeyChip>↑</KeyChip>
            <KeyChip>↓</KeyChip>
          </>
        }
      />
      <KeyRow
        label={t('placement_rotate')}
        keys={
          <>
            <KeyChip>←</KeyChip>
            <KeyChip>→</KeyChip>
          </>
        }
      />
      <KeyRow label={t('placement_snap_ground')} keys={<KeyChip>G</KeyChip>} />
      <KeyRow label={t('placement_lock')} keys={<KeyChip>L</KeyChip>} />
      <KeyRow label={t('placement_ignore_mouse')} keys={<KeyChip>M</KeyChip>} />
      <KeyRow label={t('placement_complete')} keys={<KeyChip>ENTER</KeyChip>} />
      <KeyRow label={t('placement_cancel')} keys={<KeyChip>ESC</KeyChip>} />
    </div>
  )
}
