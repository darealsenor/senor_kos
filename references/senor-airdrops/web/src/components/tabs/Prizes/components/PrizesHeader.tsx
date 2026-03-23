import { Separator } from '@/components/ui/separator'
import { useLocale } from '@/providers/LocaleProvider'

const PrizesHeader = () => {
  const { t } = useLocale()
  return (
    <div className="flex flex-col">
      <h1 className="text-4xl pb-3">{t('ui_available_prizes')}</h1>
      <Separator />
    </div>
  )
}

export default PrizesHeader 