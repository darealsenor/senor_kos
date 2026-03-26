import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { KosMap, OnlinePlayerRow } from '@/types/admin'
import { isEnvBrowser } from '@/utils/misc'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import { getMockOnlinePlayers } from '@/dev/mockData'
import { nuiCreateMatch, nuiGetOnlinePlayers } from '@/utils/kosMenuNui'
import type { CreateMatchResponse } from '@/utils/kosMenuNui'
import { useLocale } from '@/hooks/useLocale'

interface MatchCreationTabProps {
  enabled: boolean
  menuOpen: boolean
  maps: KosMap[]
}

type ModeKey = 'kill_limit' | 'time_limit' | 'competitive'

export function MatchCreationTab({ enabled, menuOpen, maps }: MatchCreationTabProps) {
  const { t } = useLocale()

  const [modeKey, setModeKey] = useState<ModeKey>('competitive')
  const [players, setPlayers] = useState<OnlinePlayerRow[]>([])
  const [mapId, setMapId] = useState('')
  const [killsToWinRound, setKillsToWinRound] = useState(10)
  const [roundSeconds, setRoundSeconds] = useState(600)
  const [rounds, setRounds] = useState(3)
  const [teamAIds, setTeamAIds] = useState<number[]>([])
  const [teamBIds, setTeamBIds] = useState<number[]>([])
  const [playerSearch, setPlayerSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<CreateMatchResponse | null>(null)
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const debouncedPlayerSearch = useDebounce(playerSearch, 200)

  const assignTeamA = (playerId: number) => {
    setTeamAIds((prev) => (prev.includes(playerId) ? prev : [...prev, playerId]))
    setTeamBIds((prev) => prev.filter((x) => x !== playerId))
  }

  const assignTeamB = (playerId: number) => {
    setTeamBIds((prev) => (prev.includes(playerId) ? prev : [...prev, playerId]))
    setTeamAIds((prev) => prev.filter((x) => x !== playerId))
  }

  const unassign = (playerId: number) => {
    setTeamAIds((prev) => prev.filter((x) => x !== playerId))
    setTeamBIds((prev) => prev.filter((x) => x !== playerId))
  }

  const selectedTeamIds = useMemo(() => new Set([...teamAIds, ...teamBIds]), [teamAIds, teamBIds])
  const unassignedPlayers = useMemo(() => players.filter((p) => !selectedTeamIds.has(p.id)), [players, selectedTeamIds])
  const filteredAvailablePlayers = useMemo(() => {
    const q = debouncedPlayerSearch.trim().toLowerCase()
    if (!q) return unassignedPlayers
    return unassignedPlayers.filter((p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q))
  }, [unassignedPlayers, debouncedPlayerSearch])

  useEffect(() => {
    if (!enabled || !menuOpen) return
    setSetupLoading(true)
    setSetupError(null)
    setResult(null)
    setTeamAIds([])
    setTeamBIds([])
    setPlayerSearch('')
    setModeKey('competitive')
    setMapId('')
    setKillsToWinRound(10)
    setRoundSeconds(600)
    setRounds(3)

    let alive = true

    const load = async () => {
      try {
        const playersResp = await nuiGetOnlinePlayers(getMockOnlinePlayers())
        if (!alive) return
        setPlayers(playersResp.players ?? [])
        setSetupError(null)
      } catch (e) {
        if (!alive) return
        setSetupError(e instanceof Error ? e.message : t('failed_to_load_form_data'))
      } finally {
        if (!alive) return
        setSetupLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [enabled, menuOpen])

  const submit = async () => {
    setSubmitting(true)
    setResult(null)
    try {
      const resp = await nuiCreateMatch({
        modeKey,
        mapId: mapId.trim(),
        ...(modeKey === 'kill_limit' ? { killsToWinRound } : { roundSeconds }),
        rounds,
        teamAPlayerIds: teamAIds,
        teamBPlayerIds: teamBIds,
      })
      setResult(resp)
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : t('create_match_failed') })
    } finally {
      setSubmitting(false)
    }
  }

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('match_creation_admin_title')}</CardTitle>
          <CardDescription>{t('match_creation_no_permission')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('match_creation_title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="kos-mode" className="text-xs">
            {t('mode')}
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={modeKey === 'kill_limit' ? 'bg-muted' : undefined}
              onClick={() => setModeKey('kill_limit')}
            >
              {t('mode_kill_limit')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={modeKey === 'time_limit' ? 'bg-muted' : undefined}
              onClick={() => setModeKey('time_limit')}
            >
              {t('mode_time_limit')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={modeKey === 'competitive' ? 'bg-muted' : undefined}
              onClick={() => setModeKey('competitive')}
            >
              {t('mode_competitive')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="kos-map" className="text-xs">
              {t('map')}
            </Label>
            <select
              id="kos-map"
              value={mapId}
              onChange={(e) => setMapId(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">{t('default')}</option>
              {maps.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          {modeKey === 'kill_limit' ? (
            <div className="grid gap-1.5">
              <Label htmlFor="kos-kills" className="text-xs">
                {t('kills_to_win_round')}
              </Label>
              <input
                id="kos-kills"
                value={killsToWinRound}
                onChange={(e) => setKillsToWinRound(Number(e.target.value))}
                type="number"
                min={1}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
              />
            </div>
          ) : (
            <div className="grid gap-1.5">
              <Label htmlFor="kos-round-seconds" className="text-xs">
                {t('round_seconds')}
              </Label>
              <input
                id="kos-round-seconds"
                value={roundSeconds}
                onChange={(e) => setRoundSeconds(Number(e.target.value))}
                type="number"
                min={1}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
              />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="kos-rounds" className="text-xs">
              {t('rounds')}
            </Label>
            <input
              id="kos-rounds"
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              type="number"
              min={1}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">{t('team_a')}</Label>
              <div className="text-xs text-muted-foreground">{t('results_count', teamAIds.length)}</div>
            </div>
            <div className="max-h-48 overflow-auto">
            <Table className="table-fixed text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8 text-xs">{t('player')}</TableHead>
                    <TableHead className="h-8 text-xs text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamAIds.map((id) => {
                    const p = players.find((x) => x.id === id)
                    return (
                      <TableRow key={id} className="bg-red-500/10">
                        <TableCell className="p-1 text-xs font-medium">
                          <div className="flex items-center gap-2">
                            {p?.avatar ? <img src={p.avatar} alt="" className="size-5 rounded-full border border-white/20 object-cover" /> : null}
                            <span>{p?.name ?? `#${id}`}</span>
                          </div>
                        </TableCell>
                        <TableCell className="p-1 text-xs text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button type="button" size="sm" variant="ghost" onClick={() => unassign(id)} disabled={setupLoading}>
                              X
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
                              onClick={() => assignTeamB(id)}
                              disabled={setupLoading}
                            >
                              B
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {teamAIds.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="p-1 text-xs text-muted-foreground">
                        {t('no_players_selected')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs">{t('team_b')}</Label>
              <div className="text-xs text-muted-foreground">{t('results_count', teamBIds.length)}</div>
            </div>
            <div className="max-h-48 overflow-auto">
            <Table className="table-fixed text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8 text-xs">{t('player')}</TableHead>
                    <TableHead className="h-8 text-xs text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamBIds.map((id) => {
                    const p = players.find((x) => x.id === id)
                    return (
                    <TableRow key={id} className="bg-blue-500/10">
                        <TableCell className="p-1 text-xs font-medium">
                          <div className="flex items-center gap-2">
                            {p?.avatar ? <img src={p.avatar} alt="" className="size-5 rounded-full border border-white/20 object-cover" /> : null}
                            <span>{p?.name ?? `#${id}`}</span>
                          </div>
                        </TableCell>
                        <TableCell className="p-1 text-xs text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button type="button" size="sm" variant="ghost" onClick={() => unassign(id)} disabled={setupLoading}>
                              X
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 border-red-500/40 text-red-300 hover:bg-red-500/10"
                              onClick={() => assignTeamA(id)}
                              disabled={setupLoading}
                            >
                              A
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {teamBIds.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="p-1 text-xs text-muted-foreground">
                        {t('no_players_selected')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs">{t('available_players')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  placeholder={t('search_players')}
                  className="w-[220px]"
                />
                <div className="text-xs text-muted-foreground">{t('available_count', filteredAvailablePlayers.length)}</div>
              </div>
          </div>
          {setupLoading && <div className="text-sm text-muted-foreground">{t('loading_players')}</div>}
          {setupError && <div className="text-sm text-destructive">{setupError}</div>}
          {!setupLoading && !setupError && (
            <div className="max-h-80 overflow-auto">
            <Table className="table-fixed text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8 text-xs">{t('player')}</TableHead>
                    <TableHead className="h-8 text-xs text-right">{t('assign')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAvailablePlayers.map((p) => (
                  <TableRow key={p.id}>
                      <TableCell className="p-1 text-xs font-medium">
                        <div className="flex items-center gap-2">
                          {p.avatar ? <img src={p.avatar} alt="" className="size-5 rounded-full border border-white/20 object-cover" /> : null}
                          <span>{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-1 text-xs text-right">
                        <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                          onClick={() => assignTeamA(p.id)}
                          disabled={setupLoading}
                        >
                            A
                          </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
                          onClick={() => assignTeamB(p.id)}
                          disabled={setupLoading}
                        >
                            B
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAvailablePlayers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="p-1 text-xs text-muted-foreground">
                        {t('everyone_assigned')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            disabled={submitting || setupLoading || teamAIds.length === 0 || teamBIds.length === 0}
            onClick={submit}
          >
            {submitting ? t('creating_match') : t('create_match')}
          </Button>
          {result?.ok && result.matchId && <div className="text-sm text-muted-foreground">{t('created_match_label', result.matchId)}</div>}
          {result?.ok === false && <div className="text-sm text-destructive">{result.error ?? t('failed')}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

