import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type {
  ActiveMatchRow,
  OnlinePlayerRow,
} from '@/types/admin'
import { getMockActiveMatchAction, getMockActiveMatches, getMockOnlinePlayers } from '@/dev/mockData'
import { nuiActiveMatchAction, nuiGetActiveMatches, nuiGetOnlinePlayers } from '@/utils/kosMenuNui'
import type { ActiveMatchActionPayload } from '@/utils/kosMenuNui'
import { useLocale } from '@/hooks/useLocale'

interface ActiveMatchesTabProps {
  isAdmin: boolean
}

export function ActiveMatchesTab({ isAdmin }: ActiveMatchesTabProps) {
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<ActiveMatchRow[]>([])
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayerRow[]>([])
  const [canPlayerSpectate, setCanPlayerSpectate] = useState(false)
  const [busyMatchId, setBusyMatchId] = useState<string | null>(null)
  const [messageByMatch, setMessageByMatch] = useState<Record<string, string>>({})
  const [winsAByMatch, setWinsAByMatch] = useState<Record<string, string>>({})
  const [winsBByMatch, setWinsBByMatch] = useState<Record<string, string>>({})
  const [addPlayerByMatch, setAddPlayerByMatch] = useState<Record<string, string>>({})
  const [addTeamByMatch, setAddTeamByMatch] = useState<Record<string, 'teamA' | 'teamB'>>({})
  const [manageMatchId, setManageMatchId] = useState<string | null>(null)

  const canUseSpectate = isAdmin || canPlayerSpectate

  const onlineOptions = useMemo(() => {
    return onlinePlayers
      .map((p) => ({ value: String(p.id), label: `${p.name} (#${p.id})` }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [onlinePlayers])

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const [active, online] = await Promise.all([
        nuiGetActiveMatches(getMockActiveMatches()),
        nuiGetOnlinePlayers(getMockOnlinePlayers()),
      ])
      setMatches(active.matches ?? [])
      setCanPlayerSpectate(active.canPlayerSpectate === true)
      setOnlinePlayers(online.players ?? [])
      setWinsAByMatch((prev) => {
        const next = { ...prev }
        for (let i = 0; i < (active.matches ?? []).length; i += 1) {
          const m = active.matches[i]
          if (next[m.id] === undefined) next[m.id] = String(m.score.teamA)
        }
        return next
      })
      setWinsBByMatch((prev) => {
        const next = { ...prev }
        for (let i = 0; i < (active.matches ?? []).length; i += 1) {
          const m = active.matches[i]
          if (next[m.id] === undefined) next[m.id] = String(m.score.teamB)
        }
        return next
      })
      setAddTeamByMatch((prev) => {
        const next = { ...prev }
        for (let i = 0; i < (active.matches ?? []).length; i += 1) {
          const m = active.matches[i]
          if (next[m.id] === undefined) next[m.id] = 'teamA'
        }
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : t('active_matches_load_failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const runAction = async (payload: ActiveMatchActionPayload) => {
    const matchId = String(payload.matchId ?? '')
    setBusyMatchId(matchId)
    setError(null)
    try {
      const resp = await nuiActiveMatchAction(payload, getMockActiveMatchAction())
      if (!resp.ok) {
        setError(resp.error ?? t('action_failed'))
        return
      }
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('action_failed'))
    } finally {
      setBusyMatchId(null)
    }
  }

  const openManage = (matchId: string) => {
    setManageMatchId(matchId)
  }

  const selectedMatch = useMemo(() => matches.find((m) => m.id === manageMatchId) ?? null, [matches, manageMatchId])

  const spectateMatch = async (match: ActiveMatchRow) => {
    const target = match.players.find((p) => p.alive)?.id ?? match.players[0]?.id
    if (!target) {
      setError(t('active_matches_no_spectate_target'))
      return
    }
    await runAction({ matchId: match.id, action: 'spectate', targetPlayerId: target })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('active_matches_title')}</CardTitle>
        <CardDescription>{t('active_matches_description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => void reload()} disabled={loading}>
            {t('refresh')}
          </Button>
          {canUseSpectate ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void runAction({ matchId: '', action: 'stop_spectate' })}
              disabled={loading}
            >
              {t('leave_spectate')}
            </Button>
          ) : null}
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {t('loading')}
            </div>
          ) : null}
        </div>

        {error ? <div className="text-sm text-destructive">{error}</div> : null}
        {matches.length === 0 && !loading ? <div className="text-sm text-muted-foreground">{t('active_matches_none')}</div> : null}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('match')}</TableHead>
              <TableHead>{t('state')}</TableHead>
              <TableHead>{t('round')}</TableHead>
              <TableHead>{t('score')}</TableHead>
              <TableHead>{t('players')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((m) => {
              const busy = busyMatchId === m.id
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.id}
                    {m.mapName ? <span className="ml-2 text-xs text-muted-foreground">{m.mapName}</span> : null}
                  </TableCell>
                  <TableCell>{m.state}</TableCell>
                  <TableCell className="tabular-nums">
                    {m.roundIndex}/{m.roundTotal}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {m.score.teamA}:{m.score.teamB}
                  </TableCell>
                  <TableCell className="tabular-nums">{m.players.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {isAdmin ? (
                        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => openManage(m.id)}>
                          {t('manage')}
                        </Button>
                      ) : null}
                      {canUseSpectate ? (
                        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void spectateMatch(m)}>
                          {t('spectate')}
                        </Button>
                      ) : null}
                      {isAdmin ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={busy}
                          onClick={() => void runAction({ matchId: m.id, action: 'cancel' })}
                        >
                          {t('remove_match')}
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <Dialog open={manageMatchId !== null} onOpenChange={(next) => (!next ? setManageMatchId(null) : undefined)}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{t('manage_match_title', selectedMatch?.id ?? '')}</DialogTitle>
              <DialogDescription>{t('manage_match_description')}</DialogDescription>
            </DialogHeader>

            {selectedMatch ? (
              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    placeholder={t('message_this_match')}
                    value={messageByMatch[selectedMatch.id] ?? ''}
                    onChange={(e) => setMessageByMatch((s) => ({ ...s, [selectedMatch.id]: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyMatchId === selectedMatch.id || !(messageByMatch[selectedMatch.id] ?? '').trim()}
                    onClick={() =>
                      void runAction({ matchId: selectedMatch.id, action: 'send_message', message: messageByMatch[selectedMatch.id] ?? '' })
                    }
                  >
                    {t('send')}
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('player')}</TableHead>
                      <TableHead className="text-center">{t('team')}</TableHead>
                      <TableHead className="text-center">{t('alive')}</TableHead>
                      <TableHead className="text-center">{t('kills_short')}</TableHead>
                      <TableHead className="text-center">{t('deaths_short')}</TableHead>
                      <TableHead className="text-right">{t('manage_players')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMatch.players.map((p) => (
                      <TableRow key={`${selectedMatch.id}-${p.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {p.avatar ? <img src={p.avatar} alt="" className="size-5 rounded-full border border-white/20 object-cover" /> : null}
                            <span>{p.name ?? `#${p.id}`}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{p.team}</TableCell>
                        <TableCell className="text-center">{p.alive ? t('yes') : t('no')}</TableCell>
                        <TableCell className="text-center tabular-nums">{p.kills}</TableCell>
                        <TableCell className="text-center tabular-nums">{p.deaths}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyMatchId === selectedMatch.id}
                              onClick={() =>
                                void runAction({
                                  matchId: selectedMatch.id,
                                  action: 'change_team',
                                  playerId: p.id,
                                  team: p.team === 'teamA' ? 'teamB' : 'teamA',
                                })
                              }
                            >
                              {t('move')}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busyMatchId === selectedMatch.id}
                              onClick={() => void runAction({ matchId: selectedMatch.id, action: 'remove_player', playerId: p.id })}
                            >
                              {t('remove')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
                  <select
                    value={addPlayerByMatch[selectedMatch.id] ?? ''}
                    onChange={(e) => setAddPlayerByMatch((s) => ({ ...s, [selectedMatch.id]: e.target.value }))}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="">{t('select_online_player_to_add')}</option>
                    {onlineOptions.map((opt) => (
                      <option key={`${selectedMatch.id}-${opt.value}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={addTeamByMatch[selectedMatch.id] ?? 'teamA'}
                    onChange={(e) =>
                      setAddTeamByMatch((s) => ({ ...s, [selectedMatch.id]: e.target.value === 'teamB' ? 'teamB' : 'teamA' }))
                    }
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="teamA">{t('team_a')}</option>
                    <option value="teamB">{t('team_b')}</option>
                  </select>
                  <Button
                    type="button"
                    disabled={busyMatchId === selectedMatch.id || !(addPlayerByMatch[selectedMatch.id] ?? '')}
                    onClick={() =>
                      void runAction({
                        matchId: selectedMatch.id,
                        action: 'add_player',
                        playerId: Number(addPlayerByMatch[selectedMatch.id]),
                        team: addTeamByMatch[selectedMatch.id] ?? 'teamA',
                      })
                    }
                  >
                    {t('add_player')}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-[auto_auto_auto_auto_1fr]">
                  <Input
                    value={winsAByMatch[selectedMatch.id] ?? String(selectedMatch.score.teamA)}
                    onChange={(e) => setWinsAByMatch((s) => ({ ...s, [selectedMatch.id]: e.target.value }))}
                  />
                  <span className="self-center text-sm text-muted-foreground">{t('team_a_wins')}</span>
                  <Input
                    value={winsBByMatch[selectedMatch.id] ?? String(selectedMatch.score.teamB)}
                    onChange={(e) => setWinsBByMatch((s) => ({ ...s, [selectedMatch.id]: e.target.value }))}
                  />
                  <span className="self-center text-sm text-muted-foreground">{t('team_b_wins')}</span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyMatchId === selectedMatch.id}
                    onClick={() =>
                      void runAction({
                        matchId: selectedMatch.id,
                        action: 'change_score',
                        winsA: Number(winsAByMatch[selectedMatch.id] ?? selectedMatch.score.teamA),
                        winsB: Number(winsBByMatch[selectedMatch.id] ?? selectedMatch.score.teamB),
                      })
                    }
                  >
                    {t('change_score')}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busyMatchId === selectedMatch.id}
                    onClick={() => void runAction({ matchId: selectedMatch.id, action: 'restart_round' })}
                  >
                    {t('restart_round')}
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

