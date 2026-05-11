import { useEffect, useMemo, useState } from 'react'
import { fetchNui } from '@/utils/fetchNui'
import { isEnvBrowser } from '@/utils/misc'
import { MatchCreationTab } from '@/components/admin/tabs/MatchCreationTab'
import { LeaderboardTab } from '@/components/admin/tabs/LeaderboardTab'
import { MatchHistoryTab } from '@/components/admin/tabs/MatchHistoryTab'
import { ActiveMatchesTab } from '@/components/admin/tabs/ActiveMatchesTab'
import { useNuiStore } from '@/store/nuiStore'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type KOSMenuTab = 'admin' | 'active' | 'leaderboards' | 'history'

interface KOSMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdmin: boolean
}

export function KOSMenu({ open, onOpenChange, isAdmin }: KOSMenuProps) {
  const { t } = useLocale()
  const menuMaps = useNuiStore((s) => s.menuMaps)
  const menuLoadouts = useNuiStore((s) => s.menuLoadouts)
  const tabs = useMemo(() => {
    const base: { id: KOSMenuTab; label: string; adminOnly?: boolean }[] = [
      { id: 'active', label: t('menu_tab_active_matches') },
      { id: 'leaderboards', label: t('menu_tab_leaderboards') },
      { id: 'history', label: t('menu_tab_match_history') },
    ]
    if (isAdmin) base.unshift({ id: 'admin', label: t('menu_tab_admin'), adminOnly: true })
    return base
  }, [isAdmin, t])

  const defaultTab: KOSMenuTab = tabs[0]?.id ?? 'leaderboards'
  const [activeTab, setActiveTab] = useState<KOSMenuTab>(defaultTab)

  useEffect(() => {
    if (open) return
    if (activeTab === defaultTab) return
    setActiveTab(defaultTab)
  }, [activeTab, defaultTab, open])

  const requestClose = () => {
    if (!open) return
    onOpenChange(false)
    if (!isEnvBrowser()) fetchNui('hideFrame')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) requestClose()
      }}
    >
      <DialogContent className="kos-menu-theme pointer-events-auto relative flex h-[min(901px,90vh)] w-[min(1180px,calc(100vw-2rem))] max-w-none flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0E0E11] p-0 text-white shadow-[0_36px_120px_rgba(0,0,0,0.68)]">
        <div aria-hidden className="pointer-events-none absolute inset-[1px] rounded-[35px] bg-[#0E0E11]" />

        <div className="relative z-10 h-[202px] shrink-0 overflow-hidden border-b border-white/10 bg-[#0E0E11]">
          <img
            aria-hidden
            src="./images/bg_full.png"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />

          <button
            type="button"
            onClick={requestClose}
            className="absolute right-[46px] top-[36px] z-20 inline-flex h-[50px] w-[50px] items-center justify-center rounded-[6px] bg-[#ff3a3a]/25 text-[#ff3a3a] transition hover:bg-[#ff3a3a]/35"
            aria-label={t('close')}
          >
            <LogOut className="h-5 w-5" />
          </button>

          <DialogHeader className="absolute left-[48px] top-[21px] z-10 h-[80px] w-[260px] space-y-0 text-left">
            <DialogTitle className="font-kos-title whitespace-nowrap text-[60px] font-black uppercase leading-[0.9] tracking-[0.01em] text-[#ff3434]">
              KILL ON SIGHT
            </DialogTitle>
            <DialogDescription className="font-kos-condensed mt-[2px] text-[32px] font-semibold uppercase leading-none tracking-[0.32em] text-white/82 ">
              CREATOR
            </DialogDescription>
          </DialogHeader>

          <div className="absolute left-1/2 top-[114px] z-10 w-[min(1086px,calc(100%-96px))] -translate-x-1/2 overflow-x-hidden">
            <div className="flex min-w-max flex-nowrap justify-start gap-[30px] md:justify-center">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={cn(
                    'h-[50px] w-[200px] shrink-0 rounded-[10px] px-4 text-center font-kos-condensed text-[16px] font-bold tracking-[0.01em] transition [line-height:174.5%]',
                    activeTab === t.id
                      ? 'bg-[#dfdfdf] text-[#2c2c2c] shadow-[inset_0_0_21px_rgba(90,90,90,0.55),0_4px_36px_rgba(223,223,223,0.25)]'
                      : 'border border-white/10 bg-[#d9d9d9]/[0.04] text-white/50 hover:bg-[#d9d9d9]/[0.08] hover:text-white/75'
                  )}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="kos-menu-body relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-12 py-7">
          {activeTab === 'admin' ? <MatchCreationTab enabled={isAdmin} menuOpen={open} maps={menuMaps} loadouts={menuLoadouts} /> : null}
          {activeTab === 'leaderboards' ? <LeaderboardTab /> : null}
          {activeTab === 'active' ? <ActiveMatchesTab isAdmin={isAdmin} /> : null}
          {activeTab === 'history' ? <MatchHistoryTab /> : null}
        </div>

      </DialogContent>
    </Dialog>
  )
}
