import { useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import GTAMap from '@/components/Map/Map'
import { useAtom } from 'jotai'
import { configAtom } from '@/store/config.state'
import { inputAtom } from '@/store/input.state'
import { airdropsAtom } from '@/store/drop.state'
import { mapAtom } from '@/store/map.state'
import { LeftDropForm } from './LeftDropForm'
import { Separator } from '@/components/ui/separator'
import { toGameCoords, toMapCoords } from '@/components/Map/map.constants'
import { getCurrentStreet } from '@/utils/coords'
import { getCurrentPosition } from '@/utils/coords'

function CreationHeader() {
  return (
    <div className="flex flex-col">
      <h1 className="text-4xl pb-3">Create Airdrop</h1>
      <Separator />
    </div>
  )
}

function Creation() {
  const [config] = useAtom(configAtom)
  const [input, setInput] = useAtom(inputAtom)
  const [airdrops, setAirdrops] = useAtom(airdropsAtom)
  const [mapState, setMapState] = useAtom(mapAtom)

  const handleMapClick = (lat: number, lng: number) => {
    const [x, y] = toGameCoords(lat, lng)
    setInput((prev) => ({
      ...prev,
      coords: {
        ...prev.coords,
        x,
        y,
      },
    }))
    setMapState({
      coords: [lat, lng],
    })
  }

  useEffect(() => {
    const setInputCoords = async () => {
      try {
        const GetCoords = await getCurrentPosition()
        setInput((prev) => ({
          ...prev,
          coords: GetCoords
        }))
      } catch (error) {
        console.error(error)
      }
    }

    setInputCoords()
  }, [setInput])

  const selectedLocationMarker = useMemo(() => {
    if (!input.coords) return []
    return [
      {
        x: input.coords.x,
        y: input.coords.y,
        color: 'purple',
        label: 'Selected Location',
      },
    ]
  }, [input.coords, input.distance])

  const selectedLocationCircle = useMemo(() => {
    if (!input.coords) return []

    return [
      {
        center: [input.coords.x, input.coords.y],
        radius: input.distance,
        pathOptions: {
          color: 'purple',
          fillColor: 'purple',
          fillOpacity: 0.2,
          weight: 1,
        },
      },
    ]
  }, [input.coords, input.distance])

  useEffect(() => {
    if (input.coords) {
      const [lat, lng] = toMapCoords(input.coords.x, input.coords.y)
      setMapState({
        coords: [lat, lng],
      })
    }
  }, [input.coords, setMapState])

  return (
    <Card>
      <CardContent className="grid grid-cols-[50%_50%] p-0">
        <div className="flex flex-col overflow-y-auto">
          <CreationHeader />
          <div className="pt-3">
            <LeftDropForm
              input={input}
              setInput={setInput}
              config={config}
              airdrops={airdrops}
              setAirdrops={setAirdrops}
            />
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0">
            <GTAMap
              onMapClick={handleMapClick}
              showAirdrops={true}
              markers={selectedLocationMarker}
              center={mapState.coords as [number, number]}
              circles={selectedLocationCircle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Creation
