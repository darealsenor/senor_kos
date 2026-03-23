import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Trophy, Medal, User } from 'lucide-react'
import { TableCell, TableHead } from '@/components/ui/table'
import type { LeaderboardEntry, LeaderboardCategory } from '@/types/leaderboard'
import { LEADERBOARD_CATEGORIES } from '@/types/leaderboard'
import { CATEGORY_ICONS } from '@/components/leaderboard/category-icons'
import { formatLeaderboardValue } from '@/utils/formatLeaderboardValue'

export type TranslateFn = (key: string) => string

function formatRank(rank: number): string {
  return String(rank).padStart(2, '0')
}

function RankCell({ rank, className }: { rank: number; className?: string }) {
  const padded = formatRank(rank)
  if (rank === 1) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold text-amber-500 ${className ?? ''}`}>
        <Trophy className="h-4 w-4" />
        {padded}
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold text-slate-400 ${className ?? ''}`}>
        <Medal className="h-4 w-4" />
        {padded}
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold text-amber-700 ${className ?? ''}`}>
        <Medal className="h-4 w-4" />
        {padded}
      </span>
    )
  }
  return <span className={className ?? ''}>{padded}</span>
}

function makeStatColumn(cat: LeaderboardCategory, t: TranslateFn): ColumnDef<LeaderboardEntry & { _rank: number }> {
  const Icon = CATEGORY_ICONS[cat]
  const label = t(cat)
  return {
    accessorKey: cat,
    header: () => (
      <TableHead className="min-w-[88px] text-center">
        <span className="inline-flex items-center justify-center gap-2 text-base">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {label}
        </span>
      </TableHead>
    ),
    cell: ({ row }) => {
      const v = row.original[cat]
      const num = typeof v === 'number' ? v : v != null ? Number(v) : null
      const display = num != null ? formatLeaderboardValue(num, cat) : '—'
      return <TableCell className="text-center text-base tabular-nums">{display}</TableCell>
    },
  }
}

export function getLeaderboardColumns(t: TranslateFn): ColumnDef<LeaderboardEntry & { _rank: number }>[] {
  return [
    {
      accessorKey: '_rank',
      header: () => <TableHead className="w-20 text-base">{t('rank')}</TableHead>,
      cell: ({ row }) => (
        <TableCell className="text-base">
          <RankCell rank={row.original._rank} />
        </TableCell>
      ),
    },
    {
      accessorKey: 'rp_name',
      header: () => (
        <TableHead className="w-[160px] min-w-[160px] max-w-[160px] text-base">
          <span className="inline-flex items-center gap-2">
            <User className="h-5 w-5 shrink-0 text-muted-foreground" />
            {t('name')}
          </span>
        </TableHead>
      ),
      cell: ({ row }) => {
        const avatar = row.original.avatar
        const name = row.original.rp_name || row.original.steam_name || '—'
        return (
          <TableCell className="w-[160px] min-w-[160px] max-w-[160px] overflow-hidden text-base font-medium">
            <span className="flex min-w-0 items-center gap-2.5">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate" title={name}>
                {name}
              </span>
            </span>
          </TableCell>
        )
      },
    },
    ...LEADERBOARD_CATEGORIES.map((cat) => makeStatColumn(cat, t)),
  ]
}
