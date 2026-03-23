import { cn } from '@/lib/utils'
import { useState } from 'react'
import Browse from './tabs/Browse'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TTabs } from '@/types'
import Creation from './tabs/Creation'
import Locations from './tabs/Locations'
import Prizes from './tabs/Prizes'
import History from './tabs/History'
import { useAtom } from 'jotai'
import { configAtom } from '@/store/config.state'
import { useLocale } from '@/providers/LocaleProvider'

export function MainCard({ className, ...props }: React.ComponentProps<'div'>) {
  const [currentTab, setCurrentTab] = useState<TTabs>('browse')
  const [config] = useAtom(configAtom)
  const isAdmin = config.isAdmin
  const { t } = useLocale()

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Tabs value={currentTab} onValueChange={(val: TTabs) => setCurrentTab(val)}>
        <TabsList>
          <TabsTrigger value="browse">{t('ui_tab_browse')}</TabsTrigger>
          {isAdmin ? (
            <>
              <TabsTrigger value="creation">{t('ui_tab_create')}</TabsTrigger>
              <TabsTrigger value="locations">{t('ui_tab_locations')}</TabsTrigger>
              <TabsTrigger value="prizes">{t('ui_tab_prizes')}</TabsTrigger>
            </>
          ) : null}

          <TabsTrigger value="history">{t('ui_tab_history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <Browse />
        </TabsContent>
        <TabsContent value="creation">
          <Creation />
        </TabsContent>
        <TabsContent value="locations">
          <Locations />
        </TabsContent>
        <TabsContent value="prizes">
          <Prizes />
        </TabsContent>
        <TabsContent value="history">
          <History />
        </TabsContent>
      </Tabs>
    </div>
  )
}
