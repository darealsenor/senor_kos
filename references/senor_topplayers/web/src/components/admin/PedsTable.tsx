import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { Ped } from '@/types/admin'

interface PedsTableProps {
  peds: Ped[]
  selectedId: number | null
  onSelect: (ped: Ped) => void
  onDelete: (ped: Ped) => void
}

export function PedsTable({ peds, selectedId, onSelect, onDelete }: PedsTableProps) {
  if (peds.length === 0) {
    return (
      <p className="py-2 text-xs text-muted-foreground">No peds. Add one below.</p>
    )
  }
  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto">
      {peds.map((ped) => (
        <div
          key={ped.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(ped)}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(ped)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-left text-xs transition-colors ${
            selectedId === ped.id
              ? 'border-primary bg-primary/10'
              : 'border-border bg-muted/20 hover:bg-primary/10 hover:border-primary/30'
          }`}
        >
          <span className="min-w-0 flex-1 truncate">
            {ped.label ? (
              <span title={`#${ped.id} ${ped.category} rank ${ped.categoryRanking}`}>{ped.label}</span>
            ) : (
              <>#{ped.id} {ped.category} rank {ped.categoryRanking}</>
            )}
            {ped.identifier && ' (player)'}
            {!ped.enabled && ' (off)'}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(ped)
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  )
}
