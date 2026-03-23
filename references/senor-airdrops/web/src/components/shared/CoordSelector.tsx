import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getCurrentPosition } from '@/utils/coords'
import { toast } from '@/hooks/use-toast'
import { useLocale } from '@/providers/LocaleProvider'

interface CoordSelectorProps {
  coords: { x: number; y: number; z: number }
  onCoordsChange: (coords: { x: number; y: number; z: number }) => void
}

function CoordSelector({ coords, onCoordsChange }: CoordSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLocale()

  const handleGetCurrentPosition = async () => {
    setIsLoading(true)
    try {
      const currentCoords = await getCurrentPosition()
      onCoordsChange(currentCoords)
    } catch (error) {
      toast({
        title: t('ui_error'),
        description: t('ui_error_get_position'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-medium">{t('ui_current_coordinates')}</p>
          <p className="text-sm text-muted-foreground">
            {`vector3(${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}, ${coords.z.toFixed(2)})`}
          </p>
        </div>
        <Button onClick={handleGetCurrentPosition} disabled={isLoading}>
          {isLoading ? t('ui_getting_position') : t('ui_use_current_position')}
        </Button>
      </div>
    </div>
  )
}

export default CoordSelector 