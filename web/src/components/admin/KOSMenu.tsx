import { useEffect, useMemo, useState } from 'react'
import { fetchNui } from '@/utils/fetchNui'
import { Button } from '@/components/ui/button'
import { isEnvBrowser } from '@/utils/misc'
import { MatchCreationTab } from '@/components/admin/tabs/MatchCreationTab'
import { LeaderboardTab } from '@/components/admin/tabs/LeaderboardTab'
import { MatchHistoryTab } from '@/components/admin/tabs/MatchHistoryTab'
import { ActiveMatchesTab } from '@/components/admin/tabs/ActiveMatchesTab'
import { Watermark } from '@/components/Watermark'
import { useNuiStore } from '@/store/nuiStore'
import { useLocale } from '@/hooks/useLocale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
      <DialogContent className="pointer-events-auto flex max-h-[85vh] flex-col w-[min(940px,calc(100vw-2rem))] max-w-none p-0 overflow-hidden">
        <div className="border-b border-border bg-muted/20 px-6 py-5">
          <DialogHeader>
            <DialogTitle>{t('menu_title')}</DialogTitle>
            <DialogDescription>{t('menu_description')}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant={activeTab === t.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'admin' ? <MatchCreationTab enabled={isAdmin} menuOpen={open} maps={menuMaps} /> : null}
          {activeTab === 'leaderboards' ? <LeaderboardTab /> : null}
          {activeTab === 'active' ? <ActiveMatchesTab isAdmin={isAdmin} /> : null}
          {activeTab === 'history' ? <MatchHistoryTab /> : null}
        </div>

        <div className="border-t border-border bg-muted/20 px-6 py-4">
          <DialogFooter className="flex items-center justify-between gap-3 sm:justify-between">
            <Watermark className="justify-start" />
            <Button type="button" variant="secondary" onClick={requestClose}>
              {t('close')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
