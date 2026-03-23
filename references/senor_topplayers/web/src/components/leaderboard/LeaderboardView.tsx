import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { X, Search, ChevronLeft, ChevronRight, User, Trophy } from 'lucide-react'
import { fetchNui } from '@/utils/fetchNui'
import type { LeaderboardEntry, LeaderboardResponse, LeaderboardSelf, LeaderboardCategory } from '@/types/leaderboard'
import { LEADERBOARD_CATEGORIES } from '@/types/leaderboard'
import { useLocale } from '@/hooks/useLocale'
import { CATEGORY_ICONS } from './category-icons'
import { getLeaderboardColumns } from './leaderboard-columns'
import { formatLeaderboardValue } from '@/utils/formatLeaderboardValue'

const PAGE_SIZE = 10
const DEFAULT_CATEGORY: LeaderboardCategory = 'kills'
const STAT_COLUMN_COUNT = 2 + LEADERBOARD_CATEGORIES.length

export function LeaderboardView() {
  const { t, appTitle } = useLocale()
  const [sortBy, setSortBy] = useState<LeaderboardCategory>(DEFAULT_CATEGORY)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [data, setData] = useState<LeaderboardResponse>({ entries: [], total: 0 })
  const [selfData, setSelfData] = useState<LeaderboardSelf | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    const result = await fetchNui<LeaderboardResponse>('senor_topplayers:getLeaderboard', {
      sortBy,
      limit: PAGE_SIZE,
      page,
      search: search || undefined,
    })
    setData(result ?? { entries: [], total: 0 })
    setLoading(false)
  }, [sortBy, page, search])

  const fetchSelf = useCallback(async () => {
    const result = await fetchNui<LeaderboardSelf>('senor_topplayers:getLeaderboardSelf', { sortBy })
    setSelfData(result ?? null)
  }, [sortBy])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  useEffect(() => {
    fetchSelf()
  }, [fetchSelf])

  const handleSearchSubmit = useCallback(() => {
    setSearch(searchInput.trim())
    setPage(1)
  }, [searchInput])

  const handleCategoryChange = useCallback((value: string) => {
    setSortBy(value as LeaderboardCategory)
    setPage(1)
  }, [])

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
  const canPrev = page > 1
  const canNext = page < totalPages

  const rowsWithRank: (LeaderboardEntry & { _rank: number })[] = useMemo(() => {
    return data.entries.map((entry, i) => ({
      ...entry,
      _rank: (page - 1) * PAGE_SIZE + i + 1,
    }))
  }, [data.entries, page])

  const columns = useMemo(() => getLeaderboardColumns(t), [t])

  const table = useReactTable({
    data: rowsWithRank,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleClose = useCallback(() => {
    fetchNui('hideFrame')
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="flex h-[88vh] w-full max-w-[92vw] flex-col rounded-lg border border-border bg-card text-sm shadow-xl">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
        <h1 className="text-sm font-bold text-foreground">
          {appTitle} <span className="text-primary">{t('leaderboard')}</span>
        </h1>
        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={handleClose} aria-label={t('close')}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col border-r border-border">
          <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border p-1.5">
            <Select value={sortBy} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-8 w-[160px] text-xs hover:border-primary/50 focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEADERBOARD_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat]
                  return (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2 text-xs">
                        <Icon className="h-3.5 w-3.5" />
                        {t(cat)}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <div className="flex flex-1 items-center gap-1">
              <div className="relative max-w-[160px]">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('search_placeholder')}
                  className="h-8 pl-8 text-xs focus-visible:ring-primary"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
              </div>
              <Button variant="secondary" size="sm" className="h-8 text-xs hover:bg-primary hover:text-primary-foreground" onClick={handleSearchSubmit}>
                {t('search_btn')}
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-1.5">
            {loading ? (
              <div className="flex flex-1 items-center justify-center py-8 text-xs text-muted-foreground">{t('loading')}</div>
            ) : (
              <Table className="table-fixed w-full [&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3 [&_thead_th]:h-12">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent">
                      {headerGroup.headers.map((header) =>
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="text-base hover:bg-primary/10 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <React.Fragment key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </React.Fragment>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={STAT_COLUMN_COUNT} className="h-16 text-center text-xs text-muted-foreground">
                        {t('no_results')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border px-1.5 py-1">
            <span className="text-[10px] text-muted-foreground">
              {t('page_of', String(page), String(totalPages), data.total.toLocaleString())}
            </span>
            <div className="flex gap-0.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 hover:border-primary hover:bg-primary/10 disabled:opacity-50"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 hover:border-primary hover:bg-primary/10 disabled:opacity-50"
                disabled={!canNext}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex w-[220px] shrink-0 flex-col gap-2 overflow-auto border-l border-border bg-muted/20 p-2">
          <h2 className="text-xs font-semibold text-foreground">{t('your_stats')}</h2>
          <div className="rounded border border-border bg-card p-2 shadow-sm ring-1 ring-transparent transition-colors hover:border-primary/30 hover:ring-primary/20">
            {selfData ? (
              <>
                <div className="flex items-center gap-2">
                  {selfData.avatar ? (
                    <img
                      src={selfData.avatar}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </span>
                  )}
                  <span className="min-w-0 truncate text-xs font-medium text-foreground">
                    {selfData.rp_name ?? selfData.steam_name ?? '—'}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                  <span className="text-lg font-bold text-foreground">#{String(selfData.rank).padStart(2, '0')}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{t('of_players_sorted', String(selfData.total), t(sortBy))}</p>
                <div className="mt-2 grid grid-cols-1 gap-1 border-t border-border pt-2">
                  {LEADERBOARD_CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat]
                    const raw = selfData[cat]
                    const num = typeof raw === 'number' ? raw : raw != null ? Number(raw) : null
                    const display = num != null ? formatLeaderboardValue(num, cat) : '—'
                    return (
                      <div key={cat} className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Icon className="h-3 w-3 shrink-0" />
                          {t(cat)}
                        </span>
                        <span className="tabular-nums font-medium">{display}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{t('loading_rank')}</p>
            )}
          </div>

          {data.serverStats && (
            <>
              <h2 className="text-xs font-semibold text-foreground">{t('server_stats')}</h2>
              <div className="rounded border border-border bg-card p-2 shadow-sm">
                <div className="grid grid-cols-1 gap-1">
                  {LEADERBOARD_CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat]
                    const raw = data.serverStats![cat]
                    const num = typeof raw === 'number' ? raw : raw != null ? Number(raw) : null
                    const display = num != null ? formatLeaderboardValue(num, cat) : '—'
                    return (
                      <div key={cat} className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Icon className="h-3 w-3 shrink-0" />
                          {t(cat)}
                        </span>
                        <span className="tabular-nums font-medium">{display}</span>
                      </div>
                    )
                  })}
                  <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-border pt-1.5 text-[10px]">
                    <span className="text-muted-foreground">{t('total_players')}</span>
                    <span className="tabular-nums font-medium">{Number(data.serverStats.players).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
