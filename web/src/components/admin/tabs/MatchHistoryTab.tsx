import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PaginationPageStrip } from '@/components/admin/PaginationPageStrip'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import type { GetMatchHistoryResponse, MatchHistoryDetail, MatchHistoryRow } from '@/types/admin'
import { getMockMatchHistory, getMockMatchHistoryDetail } from '@/dev/mockData'
import { nuiGetMatchHistory, nuiGetMatchHistoryDetail } from '@/utils/kosMenuNui'
import { useLocale } from '@/hooks/useLocale'

export function MatchHistoryTab() {
  const { t } = useLocale()
  const PER_PAGE = 25
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<MatchHistoryRow[]>([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  const totalPages = useMemo(() => Math.ceil((total || 0) / PER_PAGE), [total])

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [details, setDetails] = useState<MatchHistoryDetail | null>(null)

  const asNumber = (v: unknown): number => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0
    if (typeof v === 'string') {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }
    return 0
  }

  const formatEndedAt = (value: string | number | null | undefined): string => {
    if (!value) return '—'

    let normalized: string | number = value
    if (typeof value === 'string') {
      const trimmed = value.trim()
      const numeric = Number(trimmed)
      if (Number.isFinite(numeric)) {
        normalized = numeric < 1e12 ? numeric * 1000 : numeric
      } else {
        normalized = trimmed
      }
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      normalized = value < 1e12 ? value * 1000 : value
    }

    const d = new Date(normalized)
    if (Number.isNaN(d.getTime())) return String(value)
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const loserTeamFromWinner = (winnerTeam: string | null | undefined): string | null => {
    if (winnerTeam === 'teamA') return 'teamB'
    if (winnerTeam === 'teamB') return 'teamA'
    return null
  }

  const openDetails = async (matchId: number) => {
    setDetailsOpen(true)
    setDetailsLoading(true)
    setDetailsError(null)
    setDetails(null)

    const mock = getMockMatchHistoryDetail(matchId)

    try {
      const resp = await nuiGetMatchHistoryDetail(matchId, mock)
      setDetails(resp)
      if (!resp) setDetailsError(t('match_not_found'))
    } catch (e) {
      setDetailsError(e instanceof Error ? e.message : t('match_details_load_failed'))
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    let alive = true

    const load = async () => {
      const offset = page * PER_PAGE
      setLoading(true)
      setError(null)

      const mockResp: GetMatchHistoryResponse = getMockMatchHistory(PER_PAGE, offset)

      try {
        const resp = await nuiGetMatchHistory({ limit: PER_PAGE, offset }, mockResp)

        if (!alive) return
        setRows(resp.rows ?? [])
        setTotal(typeof resp.total === 'number' ? resp.total : 0)
      } catch (e) {
        if (!alive) return
        setError(e instanceof Error ? e.message : t('match_history_load_failed'))
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [page])

  useEffect(() => {
    if (totalPages === 0) {
      setPage(0)
      return
    }
    setPage((p) => Math.min(p, totalPages - 1))
  }, [totalPages])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('match_history_title')}</CardTitle>
        <CardDescription>{t('match_history_description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('loading')}
          </div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t('ended')}</TableHead>
              <TableHead>{t('winner')}</TableHead>
              <TableHead>{t('loser')}</TableHead>
              <TableHead className="text-right">{t('manage')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const loserTeam = loserTeamFromWinner(r.winnerTeam)

              return (
                <TableRow key={r.id}>
                  <TableCell className="tabular-nums">{r.id}</TableCell>
                  <TableCell className="text-muted-foreground">{formatEndedAt(r.endedAt)}</TableCell>
                  <TableCell>{r.winnerGang?.label ?? r.winnerTeam ?? '—'}</TableCell>
                  <TableCell>{r.loserGang?.label ?? loserTeam ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => void openDetails(r.id)} disabled={detailsLoading}>
                      {t('manage')}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {total === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  {t('no_matches_recorded')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex w-full min-w-0 items-center gap-3">
          <div className="min-w-[110px] text-xs tabular-nums text-muted-foreground">{t('results_count', total)}</div>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <div className="min-w-[140px] text-right text-xs tabular-nums text-muted-foreground">
              {t('page_fraction', totalPages === 0 ? 0 : page + 1, totalPages)}
            </div>
            <Pagination className="w-auto justify-end mx-0 shrink-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    disabled={page <= 0 || loading}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.max(0, p - 1))
                    }}
                  />
                </PaginationItem>
                <PaginationPageStrip
                  idPrefix="match-history"
                  totalPages={totalPages}
                  currentPage={page}
                  onPageChange={setPage}
                />
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    disabled={totalPages === 0 || page >= totalPages - 1 || loading}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => p + 1)
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{t('match_data_title')}</DialogTitle>
              <DialogDescription>{t('match_data_description')}</DialogDescription>
            </DialogHeader>

            {detailsLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('loading')}
              </div>
            )}
            {detailsError && <div className="text-sm text-destructive">{detailsError}</div>}

            {details && (
              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <div className="text-sm">
                    <div className="text-muted-foreground">{t('ended')}</div>
                    <div>{formatEndedAt(details.endedAt)}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">{t('winner')}</div>
                    <div>{details.winnerGang?.label ?? details.winnerTeam ?? '—'}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">{t('loser')}</div>
                    <div>{details.loserGang?.label ?? loserTeamFromWinner(details.winnerTeam) ?? '—'}</div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('team')}</TableHead>
                      <TableHead>{t('player')}</TableHead>
                      <TableHead>{t('gang')}</TableHead>
                      <TableHead className="text-center">{t('kills_short')}</TableHead>
                      <TableHead className="text-center">{t('deaths_short')}</TableHead>
                      <TableHead className="text-center">{t('kd_short')}</TableHead>
                      <TableHead className="text-center">{t('headshots_short')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.participants.map((p) => {
                      const kills = asNumber(p.stats?.kills)
                      const deaths = asNumber(p.stats?.deaths)
                      const headshots = asNumber(p.stats?.headshots)
                      const kd = kills / Math.max(1, deaths)
                      return (
                        <TableRow key={p.source}>
                          <TableCell className="text-muted-foreground">{p.team ?? '—'}</TableCell>
                          <TableCell className="font-medium">{p.name ?? p.identifier}</TableCell>
                          <TableCell className="text-muted-foreground">{p.gang?.label ?? '—'}</TableCell>
                          <TableCell className="text-center tabular-nums">{kills}</TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">{deaths}</TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">{kd.toFixed(2)}</TableCell>
                          <TableCell className="text-center tabular-nums text-muted-foreground">{headshots}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
