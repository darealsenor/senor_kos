import { useEffect, useMemo, useState } from 'react'
import { Loader2, History, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { GetMatchHistoryResponse, MatchHistoryDetail, MatchHistoryRow } from '@/types/admin'
import { getMockMatchHistory, getMockMatchHistoryDetail } from '@/dev/mockData'
import { nuiGetMatchHistory, nuiGetMatchHistoryDetail } from '@/utils/kosMenuNui'
import { useLocale } from '@/hooks/useLocale'

function TeamBanner({ team }: { team: 'A' | 'B' }) {
  const isA = team === 'A'
  return (
    <div className="relative h-[120px] overflow-hidden rounded-[8px] border border-[#2a2a2a] bg-[#161618]">
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
          isA ? 'bg-[rgba(255,58,58,0.15)]' : 'bg-[rgba(58,155,71,0.15)]'
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

function StatBlock({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex min-w-[70px] flex-col text-left">
      <span className="text-[15px] font-bold text-white tracking-[0.02em]">{label}</span>
      <span className="text-[13px] font-medium text-white/50 truncate max-w-[150px]">{value}</span>
    </div>
  )
}

function CustomPagination({ page, totalPages, onPageChange }: { page: number, totalPages: number, onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null

  let start = Math.max(0, page - 4);
  let end = Math.min(totalPages - 1, start + 8);
  if (end - start < 8) {
    start = Math.max(0, end - 8);
  }
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const activeBtnClasses = "bg-[#cfcfcf] text-[#000] shadow-[inset_0_0_21px_rgba(90,90,90,0.55),0_4px_36px_rgba(223,223,223,0.25)]"

  return (
    <div className="flex w-full h-[48px] items-center justify-between rounded-[8px] bg-white/[0.04] px-[16px]">
      <button 
        disabled={page <= 0}
        onClick={() => onPageChange(Math.max(0, page - 1))}
        className={cn("flex h-[32px] w-[32px] items-center justify-center rounded-[5px] transition-all disabled:opacity-30", activeBtnClasses)}
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
              className={cn("flex h-[32px] min-w-[32px] items-center justify-center rounded-[5px] text-[14px] font-bold transition-all px-1", isActive ? activeBtnClasses : "text-white/40 hover:text-white")}
            >
              {p + 1}
            </button>
          )
        })}
      </div>

      <button 
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        className={cn("flex h-[32px] w-[32px] items-center justify-center rounded-[5px] transition-all disabled:opacity-30", activeBtnClasses)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export function MatchHistoryTab() {
  const { t } = useLocale()
  const PER_PAGE = 7
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
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
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
    <div className="flex w-full h-full flex-col text-white font-kos-condensed overflow-x-hidden scrollbar-hide">
      <div className="mb-[16px] flex h-[58px] w-full shrink-0 items-center justify-between rounded-[10px] bg-[rgba(217,217,217,0.04)] px-3">
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[5px] bg-[#dfdfdf] text-[#1e1e1e] shadow-[inset_0_0_8px_rgba(89,89,89,0.55),0_4px_20px_rgba(223,223,223,0.25)]">
            <History className="h-[18px] w-[18px] stroke-[2.5px]" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-[24px] font-bold leading-none tracking-[0.01em]">{t('history', 'History')}</h2>
            <span className="text-[14px] font-medium leading-none text-white/50 mt-1">
              {t('played_matches', 'Played Matches')}
            </span>
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

      <div className="flex flex-col gap-[8px] w-full flex-1 min-h-0 justify-start overflow-y-auto overflow-x-hidden scrollbar-hide">
        {rows.map((r) => {
          const loserTeam = loserTeamFromWinner(r.winnerTeam)
          return (
            <div key={r.id} className="flex h-[58px] shrink-0 items-center justify-between rounded-[8px] bg-[#161618] px-[16px]">
              <div className="flex items-center w-[200px]">
                <div className="flex flex-col justify-center">
                  <span className="text-[18px] font-bold uppercase leading-none tracking-[0.02em] text-white">
                    {t('arena', 'Arena')} #{r.id}
                  </span>
                  <span className="text-[12px] font-medium leading-none text-white/40 mt-[4px]">
                    {(r as any).arenaName ?? 'Legion Square'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-1 items-center justify-start gap-[30px]">
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('ended', 'Ended')} value={formatEndedAt(r.endedAt)} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('winner', 'Winner')} value={r.winnerGang?.label ?? r.winnerTeam ?? '—'} />
                <div className="h-[28px] w-[2px] bg-[#2a2a2a]" />
                <StatBlock label={t('loser', 'Loser')} value={r.loserGang?.label ?? loserTeam ?? '—'} />
              </div>

              <div className="ml-auto">
                 <button 
                   onClick={() => void openDetails(r.id)} 
                   disabled={detailsLoading}
                   className="h-[34px] w-[110px] rounded-[6px] bg-gradient-to-b from-[#dfdfdf] to-[#c0c0c0] text-[#111] font-bold text-[14px] flex justify-center items-center hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_4px_14px_rgba(223,223,223,0.15)]"
                 >
                   {t('manage', 'Manage')}
                 </button>
              </div>
            </div>
          )
        })}

        {!loading && rows.length < PER_PAGE &&
           Array.from({ length: Math.max(0, PER_PAGE - rows.length) }).map((_, i) => (
             <div key={`empty-${i}`} className="flex h-[58px] shrink-0 items-center justify-between rounded-[8px] bg-[#161618]/30 border border-[#161618] px-[16px]">
             </div>
           ))
        }
      </div>

      <div className="mt-auto shrink-0 pb-1 pt-[8px]">
         <CustomPagination 
           page={page}
           totalPages={totalPages}
           onPageChange={setPage}
         />
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-5xl border-[#2a2a2a] bg-[#111] text-white font-kos-condensed">
          <DialogHeader>
            <DialogTitle className="text-[24px] tracking-wide">{t('match_data_title', 'Match Data')}</DialogTitle>
            <DialogDescription className="text-white/50">{t('match_data_description', 'Detailed statistics from this arena session')}</DialogDescription>
          </DialogHeader>

          {detailsLoading && (
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('loading')}
            </div>
          )}
          {detailsError && <div className="text-sm text-[#ff4747]">{detailsError}</div>}

          {details && (
            <div className="grid gap-6">
              <div className="flex items-center justify-start gap-[60px] rounded-[8px] bg-[#1a1a1a] p-5 text-[15px] border border-[#2a2a2a]">
                <div>
                  <div className="text-white/50 font-bold uppercase tracking-wider text-[13px] mb-1">{t('ended', 'Ended')}</div>
                  <div className="font-bold text-[17px]">{formatEndedAt(details.endedAt)}</div>
                </div>
                <div>
                  <div className="text-white/50 font-bold uppercase tracking-wider text-[13px] mb-1">{t('winner', 'Winner')}</div>
                  <div className="font-bold text-[#ffc933] text-[17px] shadow-sm">{details.winnerGang?.label ?? details.winnerTeam ?? '—'}</div>
                </div>
                <div>
                  <div className="text-white/50 font-bold uppercase tracking-wider text-[13px] mb-1">{t('loser', 'Loser')}</div>
                  <div className="font-bold text-[#ff4747] text-[17px]">{details.loserGang?.label ?? loserTeamFromWinner(details.winnerTeam) ?? '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mt-2">
                <div className="grid gap-2">
                  <TeamBanner team="A" />
                  <div className="max-h-[360px] overflow-auto pr-1 flex flex-col gap-2">
                    {details.participants.filter(p => p.team === 'teamA').map((p) => {
                      const kills = asNumber(p.stats?.kills)
                      const deaths = asNumber(p.stats?.deaths)
                      const headshots = asNumber(p.stats?.headshots)
                      const kd = kills / Math.max(1, deaths)
                      return (
                        <div key={p.source} className="relative flex h-[64px] shrink-0 items-center rounded-[8px] px-[12px] border bg-[#ff3a3a]/5 border-[#ff3a3a]/10">
                          {p.avatar ? (
                            <img src={p.avatar} alt="" className="h-[40px] w-[40px] rounded-[6px] object-cover" />
                          ) : (
                            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-black/40 text-[16px] font-bold text-white/80">
                              {(p.name ?? 'P').slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 px-3 flex-1 flex flex-col justify-center">
                            <div className="truncate text-[18px] font-bold tracking-wide text-white leading-none">
                              {p.name ?? p.identifier}
                            </div>
                            <div className="truncate text-[13px] font-medium text-white/50 capitalize mt-[4px]">
                              {p.gang?.label ?? 'None'}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-[20px] mr-2">
                            <div className="text-center">
                              <div className="text-[11px] font-bold text-white/40 uppercase leading-none">{t('kills_short', 'K')}</div>
                              <div className="text-[17px] font-bold text-white leading-none mt-1.5">{kills}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] font-bold text-white/40 uppercase leading-none">{t('deaths_short', 'D')}</div>
                              <div className="text-[17px] font-bold text-white/70 leading-none mt-1.5">{deaths}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] font-bold text-white/40 uppercase leading-none">{t('kd_short', 'KD')}</div>
                              <div className="text-[17px] font-bold text-[#ffc933] leading-none mt-1.5 tabular-nums">{kd.toFixed(2)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] font-bold text-white/40 uppercase leading-none">{t('headshots_short', 'HS')}</div>
                              <div className="text-[17px] font-bold text-white/70 leading-none mt-1.5">{headshots}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-2">
                  <TeamBanner team="B" />
                  <div className="max-h-[360px] overflow-auto pr-1 flex flex-col gap-2">
                    {details.participants.filter(p => p.team === 'teamB').map((p) => {
                      const kills = asNumber(p.stats?.kills)
                      const deaths = asNumber(p.stats?.deaths)
                      const headshots = asNumber(p.stats?.headshots)
                      const kd = kills / Math.max(1, deaths)
                      return (
                        <div key={p.source} className="relative flex h-[64px] shrink-0 items-center rounded-[8px] px-[12px] border bg-[#3a9b47]/5 border-[#3a9b47]/10">
                          {p.avatar ? (
                            <img src={p.avatar} alt="" className="h-[40px] w-[40px] rounded-[6px] object-cover" />
                          ) : (
                            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[6px] bg-black/40 text-[16px] font-bold text-white/80">
                              {(p.name ?? 'P').slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 px-3 flex-1 flex flex-col justify-center">
                            <div className="truncate text-[18px] font-bold tracking-wide text-white leading-none">
                              {p.name ?? p.identifier}
                            </div>
                            <div className="truncate text-[13px] font-medium text-white/50 capitalize mt-[4px]">
                              {p.gang?.label ?? 'None'}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-[20px] mr-2">
                            <div className="text-center">
                              <div className="text-[11px] font-bold text-white/40 uppercase leading-none">{t('kills_short', 'K')}</div>
                              <div className="text-[17px] font-bold text-white leading-none mt-1.5">{kills}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] font-bold text-white/40 uppercase leading-none">{t('deaths_short', 'D')}</div>
                              <div className="text-[17px] font-bold text-white/70 leading-none mt-1.5">{deaths}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] font-bold text-white/40 uppercase leading-none">{t('kd_short', 'KD')}</div>
                              <div className="text-[17px] font-bold text-[#ffc933] leading-none mt-1.5 tabular-nums">{kd.toFixed(2)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[11px] font-bold text-white/40 uppercase leading-none">{t('headshots_short', 'HS')}</div>
                              <div className="text-[17px] font-bold text-white/70 leading-none mt-1.5">{headshots}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
