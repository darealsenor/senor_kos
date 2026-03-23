import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { Prop } from '@/types/admin'
import type { PropOption } from '@/store/admin.state'

interface PropsTableProps {
  props: Prop[]
  propList: PropOption[]
  selectedId: number | null
  onSelect: (prop: Prop) => void
  onDelete: (prop: Prop) => void
}

function getLabelForModel(propList: PropOption[], model: string | null): string {
  if (!model) return '(no model)'
  const opt = propList.find((o) => o.model === model)
  return opt ? String(opt.label ?? opt.model) : model
}

export function PropsTable({ props: list, propList, selectedId, onSelect, onDelete }: PropsTableProps) {
  if (list.length === 0) {
    return (
      <p className="py-2 text-xs text-muted-foreground">No props. Add one below.</p>
    )
  }
  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto">
      {list.map((prop) => {
        const modelStr = prop.prop ?? '(no model)'
        const displayLabel = prop.label != null && prop.label !== '' ? String(prop.label) : getLabelForModel(propList, prop.prop)
        return (
        <div
          key={prop.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(prop)}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(prop)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-left text-xs transition-colors ${
            selectedId === prop.id
              ? 'border-primary bg-primary/10'
              : 'border-border bg-muted/20 hover:bg-primary/10 hover:border-primary/30'
          }`}
        >
          <span className="min-w-0 flex-1 truncate" title={`#${prop.id} ${modelStr}`}>
            #{prop.id} {displayLabel}
            {!prop.enabled && ' (off)'}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(prop)
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        )
      })}
    </div>
  )
}
