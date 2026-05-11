import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
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

function TeamBanner({ team }: { team: 'A' | 'B' }) {
  const isA = team === 'A'
  return (
    <div className="relative h-[120px] overflow-hidden rounded-[10px] border border-white/10 bg-[rgba(200,215,239,0.03)]">
      <img
        src={isA ? './images/red_gang.png' : './images/green_gang.png'}
        alt=""
        className={cn(
          'absolute h-[210px] w-[220px] object-contain opacity-100',
          isA ? 'right-[-2px] top-[-45px]' : 'left-[-2px] top-[-45px]'
        )}
      />
      <div
        aria-hidden
        className={cn(
          'absolute h-[150px] w-[500px] left-[-80px] top-[60px] blur-[55px]',
          isA ? 'bg-[rgba(255,58,58,0.38)]' : 'bg-[rgba(58,155,71,0.38)]'
        )}
      />
      <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.02)_0_12px,rgba(255,255,255,0)_12px_24px)]" />
      <div className={cn('absolute top-3 z-10 text-[20px] leading-none text-white', isA ? 'left-4' : 'right-4')} style={{ fontFamily: 'Bebas Neue' }}>
        {isA ? 'TEAM | A' : 'B | TEAM'}
      </div>
      <div
        className={cn('absolute top-[30px] z-10 text-[50px] leading-none uppercase', isA ? 'left-4' : 'right-4')}
        style={{
          fontFamily: 'Bebas Neue',
          backgroundImage: isA
            ? 'linear-gradient(180deg, rgba(255,58,58,1) 0%, rgba(255,58,58,0.5) 100%)'
            : 'linear-gradient(180deg, rgba(58,155,71,1) 0%, rgba(58,155,71,0.5) 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {isA ? 'RED' : 'GREEN'}
      </div>
    </div>
  )
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
  const [addPlayerSearchByMatch, setAddPlayerSearchByMatch] = useState<Record<string, string>>({})
  const [addTeamByMatch, setAddTeamByMatch] = useState<Record<string, 'teamA' | 'teamB'>>({})
  const [manageMatchId, setManageMatchId] = useState<string | null>(null)

  const canUseSpectate = isAdmin || canPlayerSpectate
  const lightBtnClass =
    'flex h-[34px] min-w-[120px] items-center justify-center rounded-[5px] bg-[#dfdfdf] px-3 text-[16px] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)] transition hover:brightness-105 disabled:opacity-60'
  const dangerBtnClass =
    'flex h-[34px] min-w-[120px] items-center justify-center rounded-[5px] bg-[#ff3a3a] px-3 text-[16px] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(78,48,48,0.55),0_4px_20px_rgba(255,58,58,0.25)] transition hover:brightness-105 disabled:opacity-60'
  const sectionClass = 'rounded-[10px] bg-[rgba(217,217,217,0.04)] p-3'
  const inputClass =
    'h-[34px] rounded-[5px] border border-white/10 bg-[rgba(217,217,217,0.04)] px-3 text-[14px] text-white placeholder:text-white/40 focus-visible:ring-0'
  const smallLightBtnClass =
    'flex h-[34px] items-center justify-center rounded-[5px] bg-[#dfdfdf] px-3 text-[14px] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)] transition hover:brightness-105 disabled:opacity-60'
  const smallDangerBtnClass =
    'flex h-[34px] items-center justify-center rounded-[5px] bg-[#ff3a3a] px-3 text-[14px] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(78,48,48,0.55),0_4px_20px_rgba(255,58,58,0.25)] transition hover:brightness-105 disabled:opacity-60'

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
  const teamAPlayers = useMemo(() => (selectedMatch?.players ?? []).filter((p) => p.team === 'teamA'), [selectedMatch])
  const teamBPlayers = useMemo(() => (selectedMatch?.players ?? []).filter((p) => p.team === 'teamB'), [selectedMatch])
  const filteredOnlineOptions = useMemo(() => {
    if (!manageMatchId) return onlineOptions
    const q = (addPlayerSearchByMatch[manageMatchId] ?? '').trim().toLowerCase()
    if (!q) return onlineOptions
    return onlineOptions.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [onlineOptions, manageMatchId, addPlayerSearchByMatch])

  const spectateMatch = async (match: ActiveMatchRow) => {
    const target = match.players.find((p) => p.alive)?.id ?? match.players[0]?.id
    if (!target) {
      setError(t('active_matches_no_spectate_target'))
      return
    }
    await runAction({ matchId: match.id, action: 'spectate', targetPlayerId: target })
  }

  return (
    <div className="flex w-full h-full flex-col text-white font-kos-condensed min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
      <div className="grid gap-[8px] overflow-x-hidden scrollbar-hide">
        <div className="mx-auto flex h-[58px] w-[1086px] max-w-full items-center rounded-[10px] bg-[rgba(217,217,217,0.04)] px-3">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[5px] bg-[#dfdfdf] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)]">
            <svg viewBox="0 0 11 12" width="11" height="12" aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.0792 4.41185C10.3573 4.5651 10.5899 4.79386 10.7521 5.07363C10.9143 5.35339 11 5.67362 11 6.00001C11 6.32639 10.9143 6.64662 10.7521 6.92639C10.5899 7.20615 10.3573 7.43492 10.0792 7.58816L2.66151 11.7682C1.4671 12.442 0 11.566 0 10.1807V1.81993C0 0.433972 1.4671 -0.441402 2.66151 0.231178L10.0792 4.41185Z" fill="#2C2C2C" />
            </svg>
          </div>
          <div className="ml-3 capitalize text-[16px] leading-[0.95] text-white/85" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
            {t('active')}
            <br />
            {t('matches')}
          </div>
          <div className="ml-auto flex items-center gap-3">
            {canUseSpectate ? (
              <button
                type="button"
                onClick={() => void runAction({ matchId: '', action: 'stop_spectate' })}
                disabled={loading}
                className="flex h-[34px] w-[120px] items-center justify-center rounded-[5px] bg-[#dfdfdf] text-[16px] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)] transition hover:brightness-105 disabled:opacity-60"
                style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
              >
                {t('leave_spectate')}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="flex h-[34px] w-[120px] items-center justify-center rounded-[5px] bg-[#dfdfdf] text-[16px] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)] transition hover:brightness-105 disabled:opacity-60"
              style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
            >
              {t('refresh')}
            </button>
          </div>
        </div>

        {error ? <div className="text-sm text-destructive">{error}</div> : null}
        {matches.length === 0 && !loading ? <div className="text-sm text-muted-foreground">{t('active_matches_none')}</div> : null}
        {loading ? (
          <div className="mx-auto flex w-[1086px] max-w-full items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {t('loading')}
          </div>
        ) : null}

        <div className="mx-auto grid w-[1086px] max-w-full gap-2">
          {matches.map((m) => {
            const busy = busyMatchId === m.id
            const scoreLabel = `${m.score.teamA} - ${m.score.teamB}`
            return (
              <div key={m.id} className="flex h-[58px] shrink-0 items-center rounded-[8px] bg-[#161618] px-[16px]">
                <div className="w-[122px] min-w-0 border-r border-white/10 pr-3">
                  <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
                    {m.id}
                  </div>
                  <div className="truncate text-[16px] leading-[0.95] text-white/50" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}>
                    {m.mapName ?? '—'}
                  </div>
                </div>

                <div className="w-[103px] min-w-0 border-r border-white/10 px-3">
                  <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
                    {t('state')}
                  </div>
                  <div className="truncate text-[16px] leading-[0.95] text-white/50" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}>
                    {m.state}
                  </div>
                </div>

                <div className="w-[112px] min-w-0 border-r border-white/10 px-3">
                  <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
                    {t('round')}
                  </div>
                  <div className="truncate text-[16px] leading-[0.95] text-white/50" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}>
                    {m.roundIndex} of {m.roundTotal} rounds
                  </div>
                </div>

                <div className="w-[140px] min-w-0 border-r border-white/10 px-3">
                  <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
                    {t('score')}
                  </div>
                  <div className="truncate text-[16px] leading-[0.95] text-white/50" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}>
                    {scoreLabel}
                  </div>
                </div>

                <div className="w-[152px] min-w-0 px-3">
                  <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
                    {t('players')}
                  </div>
                  <div className="truncate text-[16px] leading-[0.95] text-white/50" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}>
                    {m.players.length}/{m.players.length} players
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  {isAdmin ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openManage(m.id)}
                      className="flex h-[34px] w-[120px] items-center justify-center rounded-[5px] bg-[#dfdfdf] text-[16px] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)] transition hover:brightness-105 disabled:opacity-60"
                      style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                    >
                      {t('manage')}
                    </button>
                  ) : null}
                  {canUseSpectate ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void spectateMatch(m)}
                      className="flex h-[34px] w-[120px] items-center justify-center rounded-[5px] bg-[#dfdfdf] text-[16px] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)] transition hover:brightness-105 disabled:opacity-60"
                      style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                    >
                      {t('spectate')}
                    </button>
                  ) : null}
                  {isAdmin ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void runAction({ matchId: m.id, action: 'cancel' })}
                      className="flex h-[34px] w-[120px] items-center justify-center rounded-[5px] bg-[#ff3a3a] text-[16px] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(78,48,48,0.55),0_4px_20px_rgba(255,58,58,0.25)] transition hover:brightness-105 disabled:opacity-60"
                      style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                    >
                      {t('remove_match')}
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        <Dialog open={manageMatchId !== null} onOpenChange={(next) => (!next ? setManageMatchId(null) : undefined)}>
          <DialogContent className="kos-menu-theme flex max-h-[85vh] max-w-5xl flex-col overflow-hidden border-white/10 bg-[#0E0E11] text-white">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-kos-condensed text-[28px] font-bold leading-none text-white">
                {t('manage_match_title', selectedMatch?.id ?? '')}
              </DialogTitle>
              <DialogDescription className="font-kos-condensed text-[16px] text-white/65">
                {t('manage_match_description')}
              </DialogDescription>
            </DialogHeader>

            {selectedMatch ? (
              <div className="grid min-h-0 gap-4 overflow-y-auto pr-1">
                <div className={sectionClass}>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
                    <Input
                      placeholder={t('message_this_match')}
                      value={messageByMatch[selectedMatch.id] ?? ''}
                      onChange={(e) => setMessageByMatch((s) => ({ ...s, [selectedMatch.id]: e.target.value }))}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      className={lightBtnClass}
                      style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                      disabled={busyMatchId === selectedMatch.id || !(messageByMatch[selectedMatch.id] ?? '').trim()}
                      onClick={() =>
                        void runAction({ matchId: selectedMatch.id, action: 'send_message', message: messageByMatch[selectedMatch.id] ?? '' })
                      }
                    >
                      {t('send')}
                    </button>
                  </div>
                </div>

                <div className={sectionClass}>
                  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                    <div className="grid gap-2">
                      <TeamBanner team="A" />
                      <div className="max-h-[240px] overflow-auto pr-1">
                        <div className="grid gap-2">
                          {teamAPlayers.map((p) => (
                            <div
                              key={`${selectedMatch.id}-${p.id}`}
                              className="relative flex h-[58px] items-center rounded-[10px] bg-[rgba(255,0,0,0.1)] px-[10px] py-[9px]"
                            >
                              {p.avatar ? (
                                <img src={p.avatar} alt="" className="h-[40px] w-[40px] rounded-[5px] object-cover" />
                              ) : (
                                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[5px] bg-black/35 text-[12px] font-bold text-white/85">
                                  {(p.name ?? `#${p.id}`).slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 px-3">
                                <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
                                  {p.name ?? `#${p.id}`}
                                </div>
                                <div className="truncate text-[16px] leading-[0.95] text-white/50" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}>
                                  #{p.id} · {t('alive')}: {p.alive ? t('yes') : t('no')} · {t('kills_short')}: {p.kills} · {t('deaths_short')}: {p.deaths}
                                </div>
                              </div>
                              <div className="ml-auto flex items-center gap-1.5">
                                <button
                                  type="button"
                                  className={smallLightBtnClass}
                                  style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                                  disabled={busyMatchId === selectedMatch.id}
                                  onClick={() =>
                                    void runAction({
                                      matchId: selectedMatch.id,
                                      action: 'change_team',
                                      playerId: p.id,
                                      team: 'teamB',
                                    })
                                  }
                                >
                                  {t('move')}
                                </button>
                                <button
                                  type="button"
                                  className={smallDangerBtnClass}
                                  style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                                  disabled={busyMatchId === selectedMatch.id}
                                  onClick={() => void runAction({ matchId: selectedMatch.id, action: 'remove_player', playerId: p.id })}
                                >
                                  {t('remove')}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <TeamBanner team="B" />
                      <div className="max-h-[240px] overflow-auto pr-1">
                        <div className="grid gap-2">
                          {teamBPlayers.map((p) => (
                            <div
                              key={`${selectedMatch.id}-${p.id}`}
                              className="relative flex h-[58px] items-center rounded-[10px] bg-[rgba(58,155,71,0.1)] px-[10px] py-[9px]"
                            >
                              {p.avatar ? (
                                <img src={p.avatar} alt="" className="h-[40px] w-[40px] rounded-[5px] object-cover" />
                              ) : (
                                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[5px] bg-black/35 text-[12px] font-bold text-white/85">
                                  {(p.name ?? `#${p.id}`).slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 px-3">
                                <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
                                  {p.name ?? `#${p.id}`}
                                </div>
                                <div className="truncate text-[16px] leading-[0.95] text-white/50" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}>
                                  #{p.id} · {t('alive')}: {p.alive ? t('yes') : t('no')} · {t('kills_short')}: {p.kills} · {t('deaths_short')}: {p.deaths}
                                </div>
                              </div>
                              <div className="ml-auto flex items-center gap-1.5">
                                <button
                                  type="button"
                                  className={smallLightBtnClass}
                                  style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                                  disabled={busyMatchId === selectedMatch.id}
                                  onClick={() =>
                                    void runAction({
                                      matchId: selectedMatch.id,
                                      action: 'change_team',
                                      playerId: p.id,
                                      team: 'teamA',
                                    })
                                  }
                                >
                                  {t('move')}
                                </button>
                                <button
                                  type="button"
                                  className={smallDangerBtnClass}
                                  style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                                  disabled={busyMatchId === selectedMatch.id}
                                  onClick={() => void runAction({ matchId: selectedMatch.id, action: 'remove_player', playerId: p.id })}
                                >
                                  {t('remove')}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={sectionClass}>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
                    <div className="grid gap-2">
                      <Input
                        value={addPlayerSearchByMatch[selectedMatch.id] ?? ''}
                        onChange={(e) => setAddPlayerSearchByMatch((s) => ({ ...s, [selectedMatch.id]: e.target.value }))}
                        placeholder={t('search_players')}
                        className={inputClass}
                      />
                      <div className="max-h-[170px] overflow-auto rounded-[8px] border border-white/10 bg-[rgba(217,217,217,0.04)] p-1">
                        {filteredOnlineOptions.slice(0, 120).map((opt) => {
                          const selected = (addPlayerByMatch[selectedMatch.id] ?? '') === opt.value
                          return (
                            <button
                              key={`${selectedMatch.id}-${opt.value}`}
                              type="button"
                              onClick={() => setAddPlayerByMatch((s) => ({ ...s, [selectedMatch.id]: opt.value }))}
                              className={`mb-1 flex w-full items-center rounded-[6px] px-2 py-1 text-left text-[13px] transition ${
                                selected ? 'bg-white/20 text-white' : 'bg-transparent text-white/75 hover:bg-white/10'
                              }`}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                        {filteredOnlineOptions.length === 0 ? (
                          <div className="px-2 py-2 text-[12px] text-white/50">{t('no_players_selected')}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setAddTeamByMatch((s) => ({ ...s, [selectedMatch.id]: 'teamA' }))}
                        className={`${lightBtnClass} ${addTeamByMatch[selectedMatch.id] === 'teamA' ? 'ring-2 ring-red-400/60' : ''}`}
                        style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                      >
                        {t('team_a')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddTeamByMatch((s) => ({ ...s, [selectedMatch.id]: 'teamB' }))}
                        className={`${lightBtnClass} ${addTeamByMatch[selectedMatch.id] === 'teamB' ? 'ring-2 ring-green-400/60' : ''}`}
                        style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                      >
                        {t('team_b')}
                      </button>
                    </div>
                    <button
                      type="button"
                      className={lightBtnClass}
                      style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
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
                    </button>
                  </div>
                </div>

                <div className={sectionClass}>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
                    <div className="rounded-[8px] border border-red-400/25 bg-[rgba(255,0,0,0.08)] p-2">
                      <div className="mb-1 text-[13px] font-semibold text-red-200">{t('team_a_wins')}</div>
                      <Input
                        value={winsAByMatch[selectedMatch.id] ?? String(selectedMatch.score.teamA)}
                        onChange={(e) => setWinsAByMatch((s) => ({ ...s, [selectedMatch.id]: e.target.value.replace(/[^0-9]/g, '') }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="rounded-[8px] border border-green-400/25 bg-[rgba(58,155,71,0.12)] p-2">
                      <div className="mb-1 text-[13px] font-semibold text-green-200">{t('team_b_wins')}</div>
                      <Input
                        value={winsBByMatch[selectedMatch.id] ?? String(selectedMatch.score.teamB)}
                        onChange={(e) => setWinsBByMatch((s) => ({ ...s, [selectedMatch.id]: e.target.value.replace(/[^0-9]/g, '') }))}
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      className={lightBtnClass}
                      style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
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
                    </button>
                  </div>
                </div>

                <div className={sectionClass}>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={lightBtnClass}
                      style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700, lineHeight: '174.5%' }}
                      disabled={busyMatchId === selectedMatch.id}
                      onClick={() => void runAction({ matchId: selectedMatch.id, action: 'restart_round' })}
                    >
                      {t('restart_round')}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
