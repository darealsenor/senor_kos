import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { airdropsAtom } from '@/store/drop.state'
import { fetchNui } from '@/utils/fetchNui'
import { Airdrop } from '@/types'
import Drop from './Drop'
import { Separator } from '../ui/separator'
import { configAtom } from '@/store/config.state'
import { useLocale } from '@/providers/LocaleProvider'

interface DropsProps {
  onAirdropSelect?: (coords: [number, number]) => void
}

function Drops({ onAirdropSelect }: DropsProps) {
  const [airdrops, setAirdrops] = useAtom(airdropsAtom)
  const [config] = useAtom(configAtom)
  const { t } = useLocale()
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAirdrops((prev) =>
        prev.map((drop) => ({
          ...drop,
          timeLeft: Math.max(drop.timeLeft - 1, 0)
        })),
      )
    }, 1000)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [setAirdrops])

  const handleDeleteDrop = async (drop: Airdrop) => {
    const result = await fetchNui('airdrops.DeleteDrop', drop.id, {
      success: true,
      message: `Airdrop ${drop.id} was deleted successfuly`,
      drops: [...(airdrops ?? []).filter((_drop: Airdrop) => _drop.id !== drop.id)],
    })

    if (result.success) {
      setAirdrops(result.drops)
    }
  }

  const sortedAirdrops = [...airdrops].sort((a, b) => a.timeLeft - b.timeLeft)

  return (
    <div className="flex flex-col w-full overflow-auto">
      <h1 className="text-4xl pb-3">{t('ui_available_airdrops')}</h1>
      <Separator />
      <div className="flex gap-4 flex-wrap pt-3">
        {sortedAirdrops.length ? (
          sortedAirdrops.map((drop, index) => (
            <Drop {...drop} key={index} onSelect={onAirdropSelect} onDelete={handleDeleteDrop} isAdmin={config.isAdmin} />
          ))
        ) : (
          <h1>{t('ui_no_airdrops')}</h1>
        )}
      </div>
    </div>
  )
}

export default Drops
