import { useEffect, useState } from 'react'
import { Loader2, Crown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'
import type { GetLeaderboardGangsResponse, GetLeaderboardPlayersResponse, LeaderboardGangRow, LeaderboardPlayerRow } from '@/types/admin'
import { makeMockLeaderboardGangs, makeMockLeaderboardPlayers } from '@/dev/mockData'
import { nuiGetLeaderboardGangs, nuiGetLeaderboardPlayers } from '@/utils/kosMenuNui'

function StatBlock({ label, value, isUpper }: { label: string, value: string, isUpper?: boolean }) {
  return (
    <div className="flex w-[60px] flex-col text-left">
      <span className={cn("text-[15px] font-bold text-white tracking-[0.02em]", isUpper ? "uppercase" : "capitalize")}>{label}</span>
      <span className="text-[13px] font-medium text-white/50">{value}</span>
    </div>
  )
}

function CustomPagination({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null

  // calculate display pages (up to 9 pages like image 1)
  let start = Math.max(0, page - 4);
  let end = Math.min(totalPages - 1, start + 8);
  if (end - start < 8) {
    start = Math.max(0, end - 8);
  }
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Active state styling for the 34x34 square matching the provided Figma JSON
  const activeBtnClasses = "bg-[#cfcfcf] text-[#000] shadow-[inset_0_0_21px_rgba(90,90,90,0.55),0_4px_36px_rgba(223,223,223,0.25)]"

  return (
    <div className="flex w-full h-[48px] items-center justify-between rounded-[8px] bg-white/[0.04] px-[16px]">
      <button 
        disabled={page <= 0}
        onClick={() => onPageChange(Math.max(0, page - 1))}
        className={cn(
          "flex h-[32px] w-[32px] items-center justify-center rounded-[5px] transition-all disabled:opacity-30",
          activeBtnClasses
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-[8px]">
        {pages.map((p) => {
          const isActive = p === page;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "flex h-[32px] min-w-[32px] items-center justify-center rounded-[5px] text-[14px] font-bold transition-all px-1",
                isActive ? activeBtnClasses : "text-white/40 hover:text-white"
              )}
            >
              {p + 1}
            </button>
          )
        })}
      </div>

      <button 
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        className={cn(
          "flex h-[32px] w-[32px] items-center justify-center rounded-[5px] transition-all disabled:opacity-30",
          activeBtnClasses
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export function LeaderboardTab() {
  const { t } = useLocale()
  const [view, setView] = useState<'players' | 'gangs'>('players')
  const [playerQuery, setPlayerQuery] = useState('')
  const [gangQuery, setGangQuery] = useState('')
  const debouncedPlayerQuery = useDebounce(playerQuery, 350)
  const debouncedGangQuery = useDebounce(gangQuery, 350)

  const [playerPage, setPlayerPage] = useState(0)
  const [gangPage, setGangPage] = useState(0)

  const PER_PAGE = 7

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
    <div className="flex w-full h-full flex-col text-white font-kos-condensed overflow-x-hidden scrollbar-hide">
      {/* Header section */}
      <div className="mb-[16px] flex h-[58px] w-full shrink-0 items-center justify-between rounded-[10px] bg-[rgba(217,217,217,0.04)] px-3">
        
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[5px] bg-[#dfdfdf] text-[#1e1e1e] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)]">
            <Crown className="h-[18px] w-[18px] fill-current" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[24px] font-bold leading-none tracking-[0.01em]">{t('leaderboard', 'Leaderboard')}</h2>
            <span className="text-[14px] font-medium leading-none text-white/50 mt-1">
              {view === 'players' ? t('top_players', 'Top Players') : t('top_gangs', 'Top Gangs')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-[38px] items-center rounded-[6px] bg-white/5 p-1 border border-white/5">
            <button
              type="button"
              className={cn(
                'h-full min-w-[100px] rounded-[4px] px-[16px] text-[14px] font-semibold transition-all',
                view === 'players'
                  ? 'bg-[#dfdfdf] text-[#111] shadow-[0_4px_24px_rgba(223,223,223,0.15)]'
                  : 'text-white/40 hover:text-white/80'
              )}
              onClick={() => setView('players')}
            >
              {t('players', 'Players')}
            </button>
            <button
              type="button"
              className={cn(
                'h-full min-w-[100px] rounded-[4px] px-[16px] text-[14px] font-semibold transition-all',
                view === 'gangs'
                  ? 'bg-[#dfdfdf] text-[#111] shadow-[0_4px_24px_rgba(223,223,223,0.15)]'
                  : 'text-white/40 hover:text-white/80'
              )}
              onClick={() => setView('gangs')}
            >
              {t('gangs', 'Gangs')}
            </button>
          </div>

          <div className="relative">
            <Input
              value={view === 'players' ? playerQuery : gangQuery}
              onChange={(e) => (view === 'players' ? setPlayerQuery(e.target.value) : setGangQuery(e.target.value))}
              placeholder={t('search_name_or_gang', 'Search by Name or Gang...')}
              className="h-[38px] w-[280px] rounded-[6px] border-0 bg-[#252528] px-[16px] text-[14px] font-medium text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/20"
            />
          </div>
        </div>

      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-white/50 mb-2 shrink-0">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('loading')}
        </div>
      )}
      {error && <div className="text-sm text-[#ff3a3a] mb-2 shrink-0">{error}</div>}

      {/* Content List aligned naturally */}
      <div className="flex flex-col gap-[8px] w-full flex-1 min-h-0 justify-start overflow-y-auto scrollbar-hide overflow-x-hidden">
        {view === 'players' && playerRows.map((p, i) => {
          const rank = playerPage * PER_PAGE + i + 1
          const isTop1 = rank === 1;
          const isTop2 = rank === 2;
          const isTop3 = rank === 3;
          let rankColorClass = 'text-white'
          if (isTop1) rankColorClass = 'text-[#ffc933]'
          else if (isTop2) rankColorClass = 'text-[#ff4747]'
          else if (isTop3) rankColorClass = 'text-[#da8135]'

          return (
            <div key={p.identifier} className="flex h-[58px] shrink-0 items-center justify-between rounded-[8px] bg-[#161618] px-[16px]">
              <div className="flex items-center w-[260px]">
                <div className="mr-[16px] flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[6px] bg-[#242427] overflow-hidden border border-white/5">
                  {p.avatar ? (
                    <img src={p.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[16px] font-bold text-white/50">{(p.name ?? p.identifier ?? 'P').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className={cn('text-[18px] font-bold uppercase leading-none tracking-[0.02em]', rankColorClass)}>
                    {p.name ?? p.identifier ?? 'Unknown'}
                  </span>
                  <span className="text-[12px] font-medium leading-none text-white/40 mt-[4px]">
                    #{rank}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-1 items-center justify-end gap-[20px]">
                <div className="flex w-fit min-w-[70px] max-w-[120px] flex-col text-left">
                  <span className="text-[15px] font-bold text-white tracking-[0.02em] capitalize">{t('gang', 'Gang')}</span>
                  <span className="text-[13px] font-medium text-white/50 truncate" title={p.gang?.label ?? 'None'}>{p.gang?.label ?? 'None'}</span>
                </div>
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('wins', 'Wins')} value={p.wins.toString()} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('losses', 'Losses')} value={p.losses.toString()} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('kills', 'Kills')} value={p.kills.toString()} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('deaths', 'Deaths')} value={p.deaths.toString()} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('kd', 'KD')} value={kd(p.kills, p.deaths).toFixed(2)} isUpper />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('headshots', 'HeadShots')} value={p.headshots.toString()} />
              </div>
            </div>
          )
        })}

        {view === 'gangs' && gangRows.map((g, i) => {
          const rank = gangPage * PER_PAGE + i + 1
          const isTop1 = rank === 1;
          const isTop2 = rank === 2;
          const isTop3 = rank === 3;
          let rankColorClass = 'text-white'
          if (isTop1) rankColorClass = 'text-[#ffc933]'
          else if (isTop2) rankColorClass = 'text-[#ff4747]'
          else if (isTop3) rankColorClass = 'text-[#da8135]'

          return (
            <div key={g.gangKey} className="flex h-[58px] shrink-0 items-center justify-between rounded-[8px] bg-[#161618] px-[16px]">
              <div className="flex items-center w-[260px]">

                <div className="flex flex-col justify-center">
                  <span className={cn('text-[18px] font-bold uppercase leading-none tracking-[0.02em]', rankColorClass)}>
                    {g.gangName}
                  </span>
                  <span className="text-[12px] font-medium leading-none text-white/40 mt-[4px]">
                    #{rank}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-1 items-center justify-end gap-[20px]">
                <StatBlock label={t('wins', 'Wins')} value={g.wins.toString()} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('losses', 'Losses')} value={g.losses.toString()} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('kills', 'Kills')} value={g.kills.toString()} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('deaths', 'Deaths')} value={g.deaths.toString()} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('matches', 'Matches')} value={g.matchesPlayed.toString()} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('kd', 'KD')} value={kd(g.kills, g.deaths).toFixed(2)} isUpper />
              </div>
            </div>
          )
        })}

        {/* Dynamic empty rows for visual consistency */}
        {!loading && (view === 'players' ? playerRows.length : gangRows.length) < PER_PAGE &&
           Array.from({ length: Math.max(0, PER_PAGE - (view === 'players' ? playerRows.length : gangRows.length)) }).map((_, i) => (
             <div key={`empty-${i}`} className="flex h-[58px] shrink-0 items-center justify-between rounded-[8px] bg-[#161618]/30 border border-[#161618] px-[16px]">
             </div>
           ))
        }
      </div>

      {/* Pagination Container */}
      <div className="mt-auto shrink-0 pb-1 pt-[8px]">
         <CustomPagination 
           page={view === 'players' ? playerPage : gangPage}
           totalPages={view === 'players' ? playerTotalPages : gangTotalPages}
           onPageChange={p => view === 'players' ? setPlayerPage(p) : setGangPage(p)}
         />
      </div>

    </div>
  )
}
