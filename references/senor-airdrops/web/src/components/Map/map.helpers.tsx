import { FC, useEffect } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'

export const MapClickHandler: FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng
      onClick(lat, lng)
    },
  })
  return null
}

export const ComponentResize: FC<{ size?: 'small' | 'default'; center: [number, number] }> = ({ size, center }) => {
  const map = useMap()

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 0)
  }, [map, size])

  return null
}