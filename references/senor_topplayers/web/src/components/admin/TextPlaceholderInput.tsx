import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PLACEHOLDERS = [
  { value: '{{rank}}', label: 'Rank' },
  { value: '{{name}}', label: 'Name' },
  { value: '{{category}}', label: 'Category' },
  { value: '{{value}}', label: 'Value' },
] as const

export const DEFAULT_TEMPLATE = '~w~[~y~#{{rank}}~w~] ~w~ - ~g~{{name}} ~w~ - ~r~{{category}} ~w~ - ~p~{{value}}'

const BASE_SAMPLE: Record<string, string> = {
  '{{rank}}': '1',
  '{{name}}': 'PlayerName',
}

const GTA_COLORS = [
  { code: 'r', label: 'Red', css: '#e74c3c' },
  { code: 'g', label: 'Green', css: '#2ecc71' },
  { code: 'b', label: 'Blue', css: '#3498db' },
  { code: 'w', label: 'White', css: '#ecf0f1' },
  { code: 'y', label: 'Yellow', css: '#f1c40f' },
  { code: 'o', label: 'Orange', css: '#e67e22' },
  { code: 'p', label: 'Purple', css: '#9b59b6' },
  { code: 'c', label: 'Cyan', css: '#1abc9c' },
] as const

function previewTemplate(template: string, category: string): string {
  const sample: Record<string, string> = {
    ...BASE_SAMPLE,
    '{{category}}': category.charAt(0).toUpperCase() + category.slice(1),
    '{{value}}': category === 'money' ? '$12,500' : category === 'playtime' ? '48h' : '42',
  }
  let out = template
  for (const [key, val] of Object.entries(sample)) {
    out = out.split(key).join(val)
  }
  return out || '—'
}

type PreviewSegment = { color?: string; text: string }

function parsePreviewWithColors(text: string): PreviewSegment[] {
  const segments: PreviewSegment[] = []
  const re = /~([a-z])~/g
  let lastIndex = 0
  let currentColor: string | undefined
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      const part = text.slice(lastIndex, m.index)
      if (part) segments.push({ color: currentColor, text: part })
    }
    if (m[1] === 's') {
      currentColor = undefined
    } else {
      const entry = GTA_COLORS.find((c) => c.code === m![1])
      currentColor = entry?.css
    }
    lastIndex = re.lastIndex
  }
  if (lastIndex < text.length) {
    const part = text.slice(lastIndex)
    if (part) segments.push({ color: currentColor, text: part })
  }
  return segments.length ? segments : [{ text }]
}

interface TextPlaceholderInputProps {
  value: string
  onChange: (value: string) => void
  category?: string
  className?: string
  id?: string
}

export function TextPlaceholderInput({
  value,
  onChange,
  category = 'kills',
  className,
  id,
}: TextPlaceholderInputProps) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const displayValue = value || ''
  const preview = previewTemplate(displayValue || DEFAULT_TEMPLATE, category)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  const handleInsert = (placeholder: string) => {
    onChange(displayValue + placeholder)
    setOpen(false)
    inputRef.current?.focus()
  }

  const applyColorToSelection = (code: string) => {
    const el = inputRef.current
    if (!el) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    if (start === end) return
    const before = displayValue.slice(0, start)
    const selected = displayValue.slice(start, end)
    const after = displayValue.slice(end)
    onChange(before + `~${code}~${selected}~s~` + after)
    requestAnimationFrame(() => {
      el.focus()
      const newEnd = start + 3 + selected.length + 3
      el.setSelectionRange(newEnd, newEnd)
    })
  }

  const previewSegments = parsePreviewWithColors(preview)

  return (
    <div className={cn('space-y-1', className)} ref={wrapRef}>
      <div className="flex gap-1">
        <Input
          ref={inputRef}
          id={id}
          className="flex-1 min-w-0 h-8 text-sm"
          placeholder={DEFAULT_TEMPLATE}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 shrink-0 p-0"
          onClick={() => setOpen((o) => !o)}
          aria-label="Insert placeholder"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] text-muted-foreground mr-1">Color:</span>
        {GTA_COLORS.map(({ code, label, css }) => (
          <button
            key={code}
            type="button"
            className="h-5 w-5 rounded border border-border shrink-0 hover:ring-2 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ backgroundColor: css }}
            title={`${label} (~${code}~)`}
            aria-label={`Apply ${label} to selection`}
            onClick={() => applyColorToSelection(code)}
          />
        ))}
      </div>
      {open && (
        <div className="rounded-md border border-border bg-popover p-1 shadow-md">
          {PLACEHOLDERS.map((p) => (
            <button
              key={p.value}
              type="button"
              className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-accent"
              onClick={() => handleInsert(p.value)}
            >
              {p.label} — <code className="text-muted-foreground">{p.value}</code>
            </button>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground truncate flex flex-wrap items-baseline gap-0" title={preview}>
        <span className="shrink-0 mr-1">Preview:</span>
        {previewSegments.map((seg, i) => (
          <span key={i} style={seg.color ? { color: seg.color } : undefined}>
            {seg.text}
          </span>
        ))}
      </p>
    </div>
  )
}
