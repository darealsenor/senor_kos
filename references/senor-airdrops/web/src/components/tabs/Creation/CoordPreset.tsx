import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCurrentPosition } from '@/utils/coords'
import { toast } from '@/hooks/use-toast'
import { OpenMenuData } from '@/types'
import { useAtom } from 'jotai'
import { mapAtom } from '@/store/map.state'
import { toMapCoords } from '@/components/Map/map.constants'
import { useLocale } from '@/providers/LocaleProvider'

interface CoordPresetProps {
  input: {
    coords: {
      x: number
      y: number
      z: number
    }
  }
  setInput: (input: any | ((prev: any) => any)) => void
  config: OpenMenuData
}

function CoordPreset({ input, setInput, config }: CoordPresetProps) {
  const [mapState, setMapState] = useAtom(mapAtom)
  const { t } = useLocale()

  useEffect(() => {
    // Set first location as default if no coordinates are set
    if (!input.coords && config.coords?.length) {
      const firstLocation = config.coords[0]
      setInput((prev: any) => ({
        ...prev,
        coords: firstLocation.coords,
      }))
      // Center map on first location
      const [lat, lng] = toMapCoords(firstLocation.coords.x, firstLocation.coords.y)
      setMapState(prev => ({
        ...prev,
        center: [lat, lng] as [number, number]
      }))
    }
  }, [config.coords, input.coords, setInput, setMapState])

  const setMyCoords = async () => {
    try {
      const currentCoords = await getCurrentPosition()
      setInput((prev: any) => ({
        ...prev,
        coords: currentCoords,
      }))
      // Center map on current position
      const [lat, lng] = toMapCoords(currentCoords.x, currentCoords.y)
      setMapState(prev => ({
        ...prev,
        center: [lat, lng] as [number, number]
      }))
    } catch (error) {
      toast({
        title: t('ui_error'),
        description: t('ui_error_get_position'),
        variant: "destructive",
      })
    }
  }

  const handleLocationChange = (locationName: string) => {
    const selectedLocation = config.coords?.find(loc => loc.name === locationName)
    if (selectedLocation) {
      setInput((prev: any) => ({
        ...prev,
        coords: selectedLocation.coords,
      }))
      // Center map on selected location
      const [lat, lng] = toMapCoords(selectedLocation.coords.x, selectedLocation.coords.y)
      setMapState(prev => ({
        ...prev,
        center: [lat, lng] as [number, number]
      }))
    }
  }

  const getSelectedLocationName = () => {
    if (!input.coords) return undefined
    return config.coords?.find(loc => 
      loc.coords.x === input.coords.x && 
      loc.coords.y === input.coords.y && 
      loc.coords.z === input.coords.z
    )?.name
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Select
          value={getSelectedLocationName()}
          onValueChange={handleLocationChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('ui_select_location')} />
          </SelectTrigger>
          <SelectContent>
            {config.coords?.map((location) => (
              <SelectItem key={location.id} value={location.name}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={setMyCoords}>{t('ui_my_coords')}</Button>
      </div>
    </div>
  )
}

export default CoordPreset 