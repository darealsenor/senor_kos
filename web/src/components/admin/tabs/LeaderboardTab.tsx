import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaginationPageStrip } from '@/components/admin/PaginationPageStrip'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useDebounce } from '@/hooks/useDebounce'
import { useLocale } from '@/hooks/useLocale'
import type { GetLeaderboardGangsResponse, GetLeaderboardPlayersResponse, LeaderboardGangRow, LeaderboardPlayerRow } from '@/types/admin'
import { makeMockLeaderboardGangs, makeMockLeaderboardPlayers } from '@/dev/mockData'
import { nuiGetLeaderboardGangs, nuiGetLeaderboardPlayers } from '@/utils/kosMenuNui'

export function LeaderboardTab() {
  const { t } = useLocale()
  const [view, setView] = useState<'players' | 'gangs'>('players')
  const [playerQuery, setPlayerQuery] = useState('')
  const [gangQuery, setGangQuery] = useState('')
  const debouncedPlayerQuery = useDebounce(playerQuery, 350)
  const debouncedGangQuery = useDebounce(gangQuery, 350)

  const [playerPage, setPlayerPage] = useState(0)
  const [gangPage, setGangPage] = useState(0)

  const PER_PAGE = 10

  const [playerRows, setPlayerRows] = useState<LeaderboardPlayerRow[]>([])
  const [playerTotal, setPlayerTotal] = useState(0)
  const [playerLoading, setPlayerLoading] = useState(false)
  const [playerError, setPlayerError] = useState<string | null>(null)

  const [gangRows, setGangRows] = useState<LeaderboardGangRow[]>([])
  const [gangTotal, setGangTotal] = useState(0)
  const [gangLoading, setGangLoading] = useState(false)
  const [gangError, setGangError] = useState<string | null>(null)

  const loading = view === 'players' ? playerLoading : gangLoading
  const error = view === 'players' ? playerError : gangError

  const kd = (kills: number, deaths: number) => {
    const d = Math.max(1, deaths)
    return kills / d
  }

  const playerTotalPages = Math.ceil(playerTotal / PER_PAGE)
  const gangTotalPages = Math.ceil(gangTotal / PER_PAGE)

  useEffect(() => {
    setPlayerPage(0)
  }, [debouncedPlayerQuery])

  useEffect(() => {
    setGangPage(0)
  }, [debouncedGangQuery])

  useEffect(() => {
    if (view === 'players') {
      setPlayerPage(0)
    } else {
      setGangPage(0)
    }
  }, [view])

  useEffect(() => {
    if (view !== 'players') return
    let alive = true

    const load = async () => {
      setPlayerLoading(true)
      setPlayerError(null)

      const limit = PER_PAGE
      const offset = playerPage * PER_PAGE
      const query = debouncedPlayerQuery

      try {
        const mockData = makeMockLeaderboardPlayers(query, limit, offset)
        const resp = await nuiGetLeaderboardPlayers({ limit, offset, query }, mockData)

        if (!alive) return
        setPlayerRows(resp.rows ?? [])
        setPlayerTotal(typeof resp.total === 'number' ? resp.total : 0)
      } catch (e) {
        if (!alive) return
        setPlayerError(e instanceof Error ? e.message : t('leaderboard_players_load_failed'))
      } finally {
        if (!alive) return
        setPlayerLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [view, playerPage, debouncedPlayerQuery])

  useEffect(() => {
    if (view !== 'gangs') return
    let alive = true

    const load = async () => {
      setGangLoading(true)
      setGangError(null)

      const limit = PER_PAGE
      const offset = gangPage * PER_PAGE
      const query = debouncedGangQuery

      try {
        const mockData = makeMockLeaderboardGangs(query, limit, offset)
        const resp = await nuiGetLeaderboardGangs({ limit, offset, query }, mockData)

        if (!alive) return
        setGangRows(resp.rows ?? [])
        setGangTotal(typeof resp.total === 'number' ? resp.total : 0)
      } catch (e) {
        if (!alive) return
        setGangError(e instanceof Error ? e.message : t('leaderboard_gangs_load_failed'))
      } finally {
        if (!alive) return
        setGangLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [view, gangPage, debouncedGangQuery])

  useEffect(() => {
    if (view !== 'players') return
    if (playerTotalPages === 0) {
      setPlayerPage(0)
      return
    }
    setPlayerPage((p) => Math.min(p, playerTotalPages - 1))
  }, [playerTotalPages, view])

  useEffect(() => {
    if (view !== 'gangs') return
    if (gangTotalPages === 0) {
      setGangPage(0)
      return
    }
    setGangPage((p) => Math.min(p, gangTotalPages - 1))
  }, [gangTotalPages, view])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('leaderboards_title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('loading')}
          </div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={view === 'players' ? 'bg-muted' : undefined}
              onClick={() => setView('players')}
            >
              {t('players')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={view === 'gangs' ? 'bg-muted' : undefined}
              onClick={() => setView('gangs')}
            >
              {t('gangs')}
            </Button>
          </div>

          {view === 'players' && (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{t('players')}</div>
                <div className="flex items-center gap-2">
                  <Input
                    value={playerQuery}
                    onChange={(e) => setPlayerQuery(e.target.value)}
                    placeholder={t('search_name_or_gang')}
                    className="w-[260px]"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('player')}</TableHead>
                    <TableHead>{t('gang')}</TableHead>
                    <TableHead className="text-center">{t('wins_short')}</TableHead>
                    <TableHead className="text-center">{t('losses_short')}</TableHead>
                    <TableHead className="text-center">{t('kills_short')}</TableHead>
                    <TableHead className="text-center">{t('deaths_short')}</TableHead>
                    <TableHead className="text-center">{t('kd_short')}</TableHead>
                    <TableHead className="text-center">{t('headshots_short')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerRows.map((p) => (
                    <TableRow key={p.identifier}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {p.avatar ? (
                            <img src={p.avatar} alt="" className="size-6 rounded-full border border-white/20 object-cover" />
                          ) : (
                            <div className="flex size-6 items-center justify-center rounded-full border border-white/20 bg-muted text-[10px] text-muted-foreground">
                              {(p.name ?? p.identifier ?? 'P').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span>{p.name ?? p.identifier ?? 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.gang?.label ?? '—'}</TableCell>
                      <TableCell className="text-center tabular-nums">{p.wins}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{p.losses}</TableCell>
                      <TableCell className="text-center tabular-nums">{p.kills}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{p.deaths}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{kd(p.kills, p.deaths).toFixed(2)}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{p.headshots}</TableCell>
                    </TableRow>
                  ))}
                  {playerTotal === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-sm text-muted-foreground">
                        {t('no_player_stats_match_search')}
                      </TableCell>
                    </TableRow>
                  )}
                  {playerTotal > 0 &&
                    Array.from({ length: Math.max(0, PER_PAGE - playerRows.length) }).map((_, i) => (
                      <TableRow key={`p-empty-${i}`} className="opacity-40">
                        <TableCell />
                        <TableCell />
                        <TableCell className="text-center tabular-nums">—</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">—</TableCell>
                        <TableCell className="text-center tabular-nums">—</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">—</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">—</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">—</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <div className="flex w-full min-w-0 items-center gap-3">
                <div className="min-w-[110px] text-xs tabular-nums text-muted-foreground">
                  {t('results_count', playerTotal)}
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <div className="min-w-[140px] text-right text-xs tabular-nums text-muted-foreground">
                    {t('page_fraction', playerTotalPages === 0 ? 0 : playerPage + 1, playerTotalPages)}
                  </div>
                  <Pagination className="w-auto justify-end mx-0 shrink-0">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          disabled={playerPage <= 0 || playerTotalPages <= 1}
                          onClick={(e) => {
                            e.preventDefault()
                            setPlayerPage((p) => Math.max(0, p - 1))
                          }}
                        />
                      </PaginationItem>
                      <PaginationPageStrip
                        idPrefix="lb-players"
                        totalPages={playerTotalPages}
                        currentPage={playerPage}
                        onPageChange={setPlayerPage}
                      />
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          disabled={playerTotalPages === 0 || playerPage >= playerTotalPages - 1 || playerTotalPages <= 1}
                          onClick={(e) => {
                            e.preventDefault()
                            setPlayerPage((p) => p + 1)
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          )}

          {view === 'gangs' && (
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{t('gangs')}</div>
                <div className="flex items-center gap-2">
                  <Input
                    value={gangQuery}
                    onChange={(e) => setGangQuery(e.target.value)}
                    placeholder={t('search_gang_name_or_key')}
                    className="w-[260px]"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('gang')}</TableHead>
                    <TableHead className="text-center">{t('wins_short')}</TableHead>
                    <TableHead className="text-center">{t('losses_short')}</TableHead>
                    <TableHead className="text-center">{t('kills_short')}</TableHead>
                    <TableHead className="text-center">{t('deaths_short')}</TableHead>
                    <TableHead className="text-center">{t('matches_played_short')}</TableHead>
                    <TableHead className="text-center">{t('kd_short')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gangRows.map((g) => (
                    <TableRow key={g.gangKey}>
                      <TableCell className="font-medium">{g.gangName}</TableCell>
                      <TableCell className="text-center tabular-nums">{g.wins}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{g.losses}</TableCell>
                      <TableCell className="text-center tabular-nums">{g.kills}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{g.deaths}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{g.matchesPlayed}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{kd(g.kills, g.deaths).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {gangTotal === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-sm text-muted-foreground">
                        {t('no_gang_stats_match_search')}
                      </TableCell>
                    </TableRow>
                  )}
                  {gangTotal > 0 &&
                    Array.from({ length: Math.max(0, PER_PAGE - gangRows.length) }).map((_, i) => (
                      <TableRow key={`g-empty-${i}`} className="opacity-40">
                        <TableCell />
                        <TableCell className="text-center tabular-nums">—</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">—</TableCell>
                        <TableCell className="text-center tabular-nums">—</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">—</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">—</TableCell>
                        <TableCell className="text-center tabular-nums text-muted-foreground">—</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <div className="flex w-full min-w-0 items-center gap-3">
                <div className="min-w-[110px] text-xs tabular-nums text-muted-foreground">
                  {t('results_count', gangTotal)}
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <div className="min-w-[140px] text-right text-xs tabular-nums text-muted-foreground">
                    {t('page_fraction', gangTotalPages === 0 ? 0 : gangPage + 1, gangTotalPages)}
                  </div>
                  <Pagination className="w-auto justify-end mx-0 shrink-0">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          disabled={gangPage <= 0 || gangTotalPages <= 1}
                          onClick={(e) => {
                            e.preventDefault()
                            setGangPage((p) => Math.max(0, p - 1))
                          }}
                        />
                      </PaginationItem>
                      <PaginationPageStrip
                        idPrefix="lb-gangs"
                        totalPages={gangTotalPages}
                        currentPage={gangPage}
                        onPageChange={setGangPage}
                      />
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          disabled={gangTotalPages === 0 || gangPage >= gangTotalPages - 1 || gangTotalPages <= 1}
                          onClick={(e) => {
                            e.preventDefault()
                            setGangPage((p) => p + 1)
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

