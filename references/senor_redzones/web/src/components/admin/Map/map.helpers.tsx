import { useEffect } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

export const MapClickHandler = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng
      onClick(lat, lng)
    },
  })
  return null
}

export const ComponentResize = ({ size }: { size?: 'small' | 'default'; center: [number, number] }) => {
  const map = useMap()

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 0)
  }, [map, size])

  return null
}
