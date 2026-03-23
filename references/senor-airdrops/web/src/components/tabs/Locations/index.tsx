import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import GTAMap from '@/components/Map/Map'
import { useAtom } from 'jotai'
import { configAtom } from '@/store/config.state'
import { airdropsAtom } from '@/store/drop.state'
import LocationsHeader from './components/LocationsHeader'
import LocationsTable from './components/LocationsTable'
import EditLocationDialog from './components/EditLocationDialog'
import AddLocation from './components/Locations.AddLocation'
import { ILocation } from '@/types'
import { fetchNui } from '@/utils/fetchNui'
import { inputAtom } from '@/store/input.state'
import { getCurrentPosition, getCurrentStreet } from '@/utils/coords'
import { toMapCoords } from '@/components/Map/map.constants'
import { useLocale } from '@/providers/LocaleProvider'

function Locations() {
  const [config, setConfig] = useAtom(configAtom)
  // const [airdrops] = useAtom(airdropsAtom)
  const [input, setInput] = useAtom(inputAtom)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined)
  const { t } = useLocale()

  useEffect(() => {
    const setInputFields = async () => {
      try {
        const GetCoords = await getCurrentPosition()
        const GetStreet = await getCurrentStreet()
        setInput((prev) => ({
          ...prev,
          newDropCoords: GetCoords,
          newDropName: GetStreet
        }))
      } catch (error) {
        console.error(error)
      }
    }

    setInputFields()
  }, [setInput])

  const locationMarkers = useMemo(() => {
    if (!config?.coords) return []
    return config.coords.map((location) => ({
      x: location.coords.x,
      y: location.coords.y,
      color: 'blue',
      label: location.name,
      onClick: () => setSelectedLocation(location),
    }))
  }, [config?.coords])

  const handleEdit = (location: ILocation) => {
    setSelectedLocation(location)
  }

  const handleDelete = async (location: ILocation) => {
    const result: {success: boolean, locations: ILocation[]} = await fetchNui('airdrops.deleteLocation', location)

    if (result.success) {
      setConfig((prevState) => ({
        ...prevState,
        coords: result.locations,
      }))
    }
  }

  const handleTableRowClick = (location: ILocation) => {
    const [lat, lng] = toMapCoords(location.coords.x, location.coords.y)
    setMapCenter([lat, lng])
  }

  const saveLocation = async (location: ILocation) => {
    const result: { success: boolean; locations: ILocation[] } = await fetchNui('airdrops.saveLocation', location)

    if (result.success) {
      setConfig((prevState) => ({
        ...prevState,
        coords: result.locations,
      }))
    }

    setSelectedLocation(null)
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-[50%_50%] p-0">
        <div className="flex flex-col overflow-y-auto">
          <LocationsHeader />
          <div className="pt-3 px-4 flex flex-col">
            <div className="basis-[15%] mb-4">
              <h2 className="text-2xl font-semibold mb-2">{t('ui_add_new_drop')}</h2>
              <AddLocation />
            </div>
            <div className="basis-[85%]">
              <h2 className="text-2xl font-semibold mb-2">{t('ui_available_locations')}</h2>
              <LocationsTable
                locations={config.coords || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRowClick={handleTableRowClick}
              />
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0">
            <GTAMap markers={locationMarkers} center={mapCenter} />
          </div>
        </div>
      </CardContent>
      {selectedLocation && (
        <EditLocationDialog
          location={selectedLocation}
          open={!!selectedLocation}
          onOpenChange={(open) => !open && setSelectedLocation(null)}
          onSave={saveLocation}
        />
      )}
    </Card>
  )
}

export default Locations
