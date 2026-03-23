import { Card, CardContent } from '@/components/ui/card'
import GTAMap from '@/components/Map/Map'
import LocationsHeader from '../Locations/components/LocationsHeader'
import AddItemPrizes from './components/prizes.AddItem'
import PrizesItemTable from './components/prizes.ItemTable'
import { useAtom } from 'jotai'
import { configAtom } from '@/store/config.state'
import { Prize, PrizeWithId } from '@/types'
import { fetchNui } from '@/utils/fetchNui'
import { useLocale } from '@/providers/LocaleProvider'

function Prizes() {
  const [config, setConfig] = useAtom(configAtom)
  const { t } = useLocale()

  const handlePrizeAdd = async (Prize: Prize) => {
    const retval = await fetchNui<{
      success: boolean
      message: string
      prizes: PrizeWithId[]
    }>('airdrops.AddPrize', Prize, {
      success: true,
      message: 'New prize added',
      prizes: [...(config.prizes ?? []), { ...Prize, id: Math.floor(Math.random() * 999) }],
    })

    if (retval.success) {
      setConfig((prev) => ({ ...prev, prizes: retval.prizes }))
    }
  }

  const handlePrizeRemove = async (Prize: Prize) => {
    const retval = await fetchNui<{
      success: boolean
      message: string
      prizes: PrizeWithId[]
    }>('airdrops.RemovePrize', Prize, {
      success: true,
      message: 'Prize removed',
      prizes: [...(config.prizes ?? []).filter((prize) => prize.name !== Prize.name)],
    })

    if (retval.success) {
      setConfig((prev) => ({ ...prev, prizes: retval.prizes }))
    }
  }

  const handlePrizeEdit = async (updatedPrize: PrizeWithId) => {
    const updatedList = (config.prizes ?? []).map((prize) => (prize.name === updatedPrize.name ? updatedPrize : prize))

    const retval = await fetchNui<{
      success: boolean
      message: string
      prizes: PrizeWithId[]
    }>('airdrops.EditPrize', updatedPrize, {
      success: true,
      message: 'Prize edited',
      prizes: updatedList,
    })

    if (retval.success) {
      setConfig((prev) => ({ ...prev, prizes: retval.prizes }))
    }
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-[50%_50%] p-0">
        <div className="flex flex-col overflow-y-auto">
          <LocationsHeader />
          <div className="pt-3 px-2 flex flex-col space-y-4">
            <AddItemPrizes
              inventoryItems={config.inventoryItems ?? []}
              prizes={config.prizes ?? []}
              handlePrizeAdd={handlePrizeAdd}
            />

            {(config.prizes?.length ?? 0) > 0 ? (
              <PrizesItemTable prizes={config.prizes} onEdit={handlePrizeEdit} onDelete={handlePrizeRemove} />
            ) : (
              <div className="text-center text-muted-foreground py-6 text-sm">{t('ui_no_prize_items')}</div>
            )}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0">
            <GTAMap />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Prizes
