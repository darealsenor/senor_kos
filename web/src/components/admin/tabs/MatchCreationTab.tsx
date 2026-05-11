import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { KosLoadout, KosMap, OnlinePlayerRow } from '@/types/admin'
import { isEnvBrowser } from '@/utils/misc'
import { useDebounce } from '@/hooks/useDebounce'
import { Search } from 'lucide-react'
import { getMockOnlinePlayers } from '@/dev/mockData'
import { nuiCreateMatch, nuiGetOnlinePlayers } from '@/utils/kosMenuNui'
import type { CreateMatchResponse } from '@/utils/kosMenuNui'
import { useLocale } from '@/hooks/useLocale'
import { PickerButton } from '@/components/admin/PickerButton'
import { NumberButton } from '@/components/admin/NumberButton'
import { cn } from '@/lib/utils'

interface MatchCreationTabProps {
  enabled: boolean
  menuOpen: boolean
  maps: KosMap[]
  loadouts: KosLoadout[]
}

type ModeKey = 'kill_limit' | 'time_limit' | 'competitive'

function TeamBanner({ team }: { team: 'A' | 'B' }) {
  const isA = team === 'A'
  return (
    <div className="relative h-[168px] overflow-hidden rounded-[10px] border border-white/10 bg-[rgba(200,215,239,0.03)]">
      <img
        src={isA ? './images/red_gang.png' : './images/green_gang.png'}
        alt=""
        className={cn(
          'absolute h-[296px] w-[286px] object-contain opacity-100',
          isA ? 'right-[10px] top-[-44px]' : 'left-[10px] top-[-44px]'
        )}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,35,48,0.05)_0%,rgba(34,35,48,0.16)_55%,rgba(12,12,18,0.5)_100%)]"
      />
      <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.02)_0_12px,rgba(255,255,255,0)_12px_24px)]" />
      <div
        aria-hidden
        className={cn(
          'absolute h-[202px] w-[713px] left-[-93px] top-[90px] blur-[69.6px]',
          isA
            ? 'bg-[rgba(255,58,58,0.4)]'
            : 'bg-[rgba(58,155,71,0.4)]'
        )}
      />

      <div
        className={cn(
          'absolute top-4 z-10 text-[24px] font-bold leading-none text-white',
          isA ? 'left-[18px] text-left' : 'right-[18px] text-right'
        )}
        style={{ fontFamily: 'Bebas Neue' }}
      >
        {isA ? 'TEAM | A' : 'B | TEAM'}
      </div>
      <div
        className={cn('absolute top-[39px] z-10 text-[60px] leading-none uppercase', isA ? 'left-[18px] text-left' : 'right-[18px] text-right')}
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

function TeamPlayerCard({
  team,
  player,
  onRemove,
  disabled,
}: {
  team: 'A' | 'B'
  player: OnlinePlayerRow
  onRemove: () => void
  disabled?: boolean
}) {
  const isA = team === 'A'
  const subtitle = player.gang?.label?.trim() || player.gang?.name?.trim() || 'No Gang'
  const subtitleIsOwner = subtitle.toLowerCase().includes('owner')
  const initials =
    player.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase() ?? '')
      .join('') || '?'

  return (
    <div
      className={cn(
        'relative flex h-[58px] items-center rounded-[10px] px-[10px] py-[9px]',
        isA
          ? 'bg-[rgba(255,0,0,0.1)]'
          : 'bg-[rgba(58,155,71,0.1)]'
      )}
    >
      {player.avatar ? (
        <img src={player.avatar} alt="" className="h-[40px] w-[40px] rounded-[5px] object-cover" />
      ) : (
        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[5px] bg-black/35 text-[12px] font-bold text-white/85">
          {initials}
        </div>
      )}

      <div className="min-w-0 px-3">
        <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
          {player.name}
        </div>
        <div
          className={cn(
            'truncate text-[16px] leading-[0.95]',
            subtitleIsOwner ? 'text-[#E2BE47]' : 'text-white/50'
          )}
          style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}
        >
          {subtitle}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="ml-auto flex h-[34px] w-[34px] items-center justify-center rounded-[5px] bg-[#FF3A3A] text-[25px] leading-none text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(255,90,90,0.35),0_0_18px_rgba(255,58,58,0.42)] transition hover:brightness-110 disabled:opacity-60"
        aria-label="Remove player"
      >
        ×
      </button>
    </div>
  )
}

function GangCard({
  gangLabel,
  count,
  onAssignA,
  onAssignB,
  disabled,
}: {
  gangLabel: string
  count: number
  onAssignA: () => void
  onAssignB: () => void
  disabled?: boolean
}) {
  const initials =
    gangLabel
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase() ?? '')
      .join('') || 'G'

  return (
    <div className="relative flex h-[58px] items-center rounded-[10px] bg-[rgba(200,215,239,0.03)] px-[10px] py-[9px]">
      <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[5px] bg-black/35 text-[13px] font-bold text-white/85">
        {initials}
      </div>
      <div className="min-w-0 px-3">
        <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
          {gangLabel}
        </div>
        <div className="truncate text-[16px] leading-[0.95] text-white/50" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}>
          {count} players
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onAssignA}
          disabled={disabled}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[5px] bg-[#FF3A3A] text-[15px] font-bold leading-none text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(255,90,90,0.35),0_0_18px_rgba(255,58,58,0.42)] transition hover:brightness-110 disabled:opacity-60"
        >
          A
        </button>
        <button
          type="button"
          onClick={onAssignB}
          disabled={disabled}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[5px] bg-[#3A9B47] text-[15px] font-bold leading-none text-[#1f2f22] shadow-[inset_0_0_8px_rgba(125,214,120,0.32),0_0_18px_rgba(58,155,71,0.4)] transition hover:brightness-110 disabled:opacity-60"
        >
          B
        </button>
      </div>
    </div>
  )
}

function AvailablePlayerCard({
  player,
  onAssignA,
  onAssignB,
  disabled,
}: {
  player: OnlinePlayerRow
  onAssignA: () => void
  onAssignB: () => void
  disabled?: boolean
}) {
  const subtitle = player.gang?.label?.trim() || player.gang?.name?.trim() || 'No Gang'
  const initials =
    player.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase() ?? '')
      .join('') || '?'

  return (
    <div className="relative flex h-[58px] items-center rounded-[10px] bg-[rgba(217,217,217,0.04)] px-[10px] py-[9px]">
      {player.avatar ? (
        <img src={player.avatar} alt="" className="h-[40px] w-[40px] rounded-[5px] object-cover" />
      ) : (
        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[5px] bg-black/35 text-[13px] font-bold text-white/85">
          {initials}
        </div>
      )}
      <div className="min-w-0 px-3">
        <div className="truncate text-[16px] leading-[0.95] text-white" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
          {player.name}
        </div>
        <div className="truncate text-[16px] leading-[0.95] text-white/50" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 500 }}>
          {subtitle}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onAssignA}
          disabled={disabled}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[5px] bg-[#FF3A3A] text-[15px] font-bold leading-none text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(255,90,90,0.35),0_0_18px_rgba(255,58,58,0.42)] transition hover:brightness-110 disabled:opacity-60"
        >
          A
        </button>
        <button
          type="button"
          onClick={onAssignB}
          disabled={disabled}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[5px] bg-[#3A9B47] text-[15px] font-bold leading-none text-[#1f2f22] shadow-[inset_0_0_8px_rgba(125,214,120,0.32),0_0_18px_rgba(58,155,71,0.4)] transition hover:brightness-110 disabled:opacity-60"
        >
          B
        </button>
      </div>
    </div>
  )
}

export function MatchCreationTab({ enabled, menuOpen, maps, loadouts }: MatchCreationTabProps) {
  const { t } = useLocale()

  const [modeKey] = useState<ModeKey>('competitive')
  const [players, setPlayers] = useState<OnlinePlayerRow[]>([])
  const [mapId, setMapId] = useState('')
  const [loadoutId, setLoadoutId] = useState('')
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

  const assignManyToTeam = (targetTeam: 'teamA' | 'teamB', playerIds: number[]) => {
    const uniqueIds = Array.from(new Set(playerIds))
    if (targetTeam === 'teamA') {
      setTeamAIds((prev) => Array.from(new Set([...prev, ...uniqueIds])))
      setTeamBIds((prev) => prev.filter((id) => !uniqueIds.includes(id)))
      return
    }

    setTeamBIds((prev) => Array.from(new Set([...prev, ...uniqueIds])))
    setTeamAIds((prev) => prev.filter((id) => !uniqueIds.includes(id)))
  }

  const selectedTeamIds = useMemo(() => new Set([...teamAIds, ...teamBIds]), [teamAIds, teamBIds])
  const teamAPlayers = useMemo(() => teamAIds.map((id) => players.find((x) => x.id === id)).filter(Boolean) as OnlinePlayerRow[], [players, teamAIds])
  const teamBPlayers = useMemo(() => teamBIds.map((id) => players.find((x) => x.id === id)).filter(Boolean) as OnlinePlayerRow[], [players, teamBIds])
  const unassignedPlayers = useMemo(() => players.filter((p) => !selectedTeamIds.has(p.id)), [players, selectedTeamIds])
  const filteredAvailablePlayers = useMemo(() => {
    const q = debouncedPlayerSearch.trim().toLowerCase()
    if (!q) return unassignedPlayers
    return unassignedPlayers.filter((p) => {
      const gangLabel = p.gang?.label?.toLowerCase() ?? ''
      const gangName = p.gang?.name?.toLowerCase() ?? ''
      return p.name.toLowerCase().includes(q) || String(p.id).includes(q) || gangLabel.includes(q) || gangName.includes(q)
    })
  }, [unassignedPlayers, debouncedPlayerSearch])
  const gangGroups = useMemo(() => {
    const groups = new Map<string, { key: string; label: string; players: number[] }>()

    players.forEach((player) => {
      const key = player.gang?.name?.trim()
      if (!key) return
      const existing = groups.get(key)
      if (existing) {
        existing.players.push(player.id)
        return
      }
      groups.set(key, {
        key,
        label: player.gang?.label?.trim() || key,
        players: [player.id],
      })
    })

    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [players])

  const mapOptions = useMemo(() => [{ id: '', name: t('default') }, ...maps], [maps, t])
  const loadoutOptions = useMemo(() => [{ id: '', name: t('none') }, ...loadouts], [loadouts, t])

  const cycleOption = (currentId: string, options: Array<{ id: string }>, step: -1 | 1): string => {
    if (options.length === 0) return currentId
    const currentIndex = Math.max(0, options.findIndex((o) => o.id === currentId))
    const nextIndex = (currentIndex + step + options.length) % options.length
    return options[nextIndex]?.id ?? currentId
  }

  const selectedMapLabel = mapOptions.find((m) => m.id === mapId)?.name ?? t('default')
  const selectedLoadoutLabel = loadoutOptions.find((l) => l.id === loadoutId)?.name ?? t('none')

  useEffect(() => {
    if (!enabled || !menuOpen) return
    setSetupLoading(true)
    setSetupError(null)
    setResult(null)
    setTeamAIds([])
    setTeamBIds([])
    setPlayerSearch('')
    setMapId('')
    setLoadoutId('')
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
        loadoutId: loadoutId.trim(),
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
      <div className="flex w-full h-full flex-col text-white font-kos-condensed items-center justify-center min-h-0 text-center">
        <h2 className="text-xl font-bold">{t('match_creation_admin_title')}</h2>
        <p className="text-white/50">{t('match_creation_no_permission')}</p>
      </div>
    )
  }

  return (
    <div className="flex w-full h-full flex-col text-white font-kos-condensed overflow-y-auto overflow-x-hidden scrollbar-hide">
      <div className="grid gap-[8px]">
        <div className="mx-auto grid w-[1086px] max-w-full grid-cols-4 gap-[30px]">
          <PickerButton
            label={selectedMapLabel}
            onPrev={() => setMapId((prev) => cycleOption(prev, mapOptions, -1))}
            onNext={() => setMapId((prev) => cycleOption(prev, mapOptions, 1))}
            prevAriaLabel={t('map')}
            nextAriaLabel={t('map')}
          />

          <PickerButton
            label={selectedLoadoutLabel}
            onPrev={() => setLoadoutId((prev) => cycleOption(prev, loadoutOptions, -1))}
            onNext={() => setLoadoutId((prev) => cycleOption(prev, loadoutOptions, 1))}
            prevAriaLabel={t('loadout')}
            nextAriaLabel={t('loadout')}
          />

          <NumberButton
            label={t('round_seconds')}
            value={String(roundSeconds)}
            displayValue={`${Math.floor(roundSeconds)}`}
            onChange={(next) => {
              const sanitized = next.replace(/[^0-9]/g, '')
              const parsed = Number(sanitized)
              setRoundSeconds(Math.max(1, Number.isFinite(parsed) ? parsed : 1))
            }}
            inputAriaLabel={t('round_seconds')}
          />

          <NumberButton
            label={t('rounds')}
            value={String(rounds)}
            displayValue={`${rounds}`}
            onChange={(next) => {
              const sanitized = next.replace(/[^0-9]/g, '')
              const parsed = Number(sanitized)
              setRounds(Math.max(1, Number.isFinite(parsed) ? parsed : 1))
            }}
            inputAriaLabel={t('rounds')}
          />
        </div>

        <div className="mx-auto grid w-[1086px] max-w-full grid-cols-2 gap-[30px]">
          <div className="grid gap-2">
            <TeamBanner team="A" />
            <div className="grid max-h-[124px] grid-cols-2 gap-2 overflow-auto scrollbar-hide">
              {teamAPlayers.map((player) => (
                <TeamPlayerCard
                  key={player.id}
                  team="A"
                  player={player}
                  onRemove={() => unassign(player.id)}
                  disabled={setupLoading}
                />
              ))}
              {teamAPlayers.length === 0 && (
                <div className="col-span-2 flex h-[58px] items-center rounded-[10px] border border-white/10 px-3 text-xs text-muted-foreground">
                  {t('no_players_selected')}
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <TeamBanner team="B" />
            <div className="grid max-h-[124px] grid-cols-2 gap-2 overflow-auto scrollbar-hide">
              {teamBPlayers.map((player) => (
                <TeamPlayerCard
                  key={player.id}
                  team="B"
                  player={player}
                  onRemove={() => unassign(player.id)}
                  disabled={setupLoading}
                />
              ))}
              {teamBPlayers.length === 0 && (
                <div className="col-span-2 flex h-[58px] items-center rounded-[10px] border border-white/10 px-3 text-xs text-muted-foreground">
                  {t('no_players_selected')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          {gangGroups.length > 0 && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs">{t('gangs')}</Label>
                <div className="text-xs text-muted-foreground">{t('results_count', gangGroups.length)}</div>
              </div>
              <div className="grid gap-2 md:grid-cols-4">
                {gangGroups.map((group) => (
                  <GangCard
                    key={group.key}
                    gangLabel={group.label}
                    count={group.players.length}
                    onAssignA={() => assignManyToTeam('teamA', group.players)}
                    onAssignB={() => assignManyToTeam('teamB', group.players)}
                    disabled={setupLoading}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="mx-auto flex h-[58px] w-[1086px] max-w-full items-center rounded-[10px] bg-[rgba(217,217,217,0.04)] px-3">
            <div className="flex min-w-0 flex-1 items-center">
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[5px] bg-[#dfdfdf] text-[#2c2c2c] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)]">
                <Search className="h-[14px] w-[14px]" strokeWidth={2.2} />
              </div>
              <div className="ml-3 text-[16px] leading-none text-white/85" style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}>
                {t('search_players')}
              </div>
            </div>
            <div className="ml-3 flex h-[34px] w-[294px] items-center rounded-[5px] border border-white/10 bg-[rgba(217,217,217,0.04)] px-3">
              <input
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder={t('search_players')}
                className="h-full w-full !border-0 !bg-transparent p-0 text-[14px] text-white placeholder:text-white/35 outline-none ring-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
          {setupLoading && <div className="text-sm text-muted-foreground">{t('loading_players')}</div>}
          {setupError && <div className="text-sm text-destructive">{setupError}</div>}
          {!setupLoading && !setupError && (
            <div className="mx-auto grid max-h-[188px] w-[1086px] max-w-full grid-cols-4 gap-2 overflow-auto scrollbar-hide">
              {filteredAvailablePlayers.map((player) => (
                <AvailablePlayerCard
                  key={player.id}
                  player={player}
                  onAssignA={() => assignTeamA(player.id)}
                  onAssignB={() => assignTeamB(player.id)}
                  disabled={setupLoading}
                />
              ))}
              {filteredAvailablePlayers.length === 0 && (
                <div className="col-span-4 flex h-[58px] items-center rounded-[10px] border border-white/10 px-3 text-xs text-muted-foreground">
                  {t('everyone_assigned')}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mx-auto grid w-[1086px] max-w-full gap-2">
          <Button
            type="button"
            disabled={submitting || setupLoading || teamAIds.length === 0 || teamBIds.length === 0}
            onClick={submit}
            className="h-[58px] w-full rounded-[10px] bg-[#dfdfdf] text-[20px] uppercase tracking-[0.02em] text-[#2c2c2c] shadow-[inset_0_0_14px_rgba(89,89,89,0.45),0_4px_24px_rgba(223,223,223,0.28)] transition hover:brightness-105 disabled:opacity-60"
            style={{ fontFamily: 'Akrobat, sans-serif', fontWeight: 700 }}
          >
            {submitting ? t('creating_match') : t('create_match')}
          </Button>
          {result?.ok && result.matchId && <div className="text-sm text-center text-muted-foreground">{t('created_match_label', result.matchId)}</div>}
          {result?.ok === false && <div className="text-sm text-center text-destructive">{result.error ?? t('failed')}</div>}
        </div>
      </div>
    </div>
  )
}
