import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import Drops from '../Drops'
import GTAMap from '../Map/Map'

function Browse() {
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined)

  return (
    <Card>
      <CardContent className="grid grid-cols-[50%_50%] p-0">
        <Drops onAirdropSelect={setMapCenter} />
        <div className="relative">
          <div className="absolute inset-0">
            <GTAMap
              size="small"
              showAirdrops={true}
              autoCenterOnLowestTimeDrop={true}
              center={mapCenter}
              markers={[]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Browse
