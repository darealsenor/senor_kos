import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ComponentResize, MapClickHandler } from './map.helpers'
import { createCircleMarkerIcon, createZoneMarkerIcon, markerColourToHex } from './map.marker'
import { CUSTOM_CRS, MAX_BOUNDS, toGameCoords, toMapCoords } from './map.constants'
import { getThemePrimary } from '@/utils/theme'
import type { Zone } from '@/types'

interface ZoneMapProps {
  zones: Zone[]
  selectedCoords?: { x: number; y: number; z?: number }
  selectedZoneId?: string | number
  center?: [number, number]
  createPreviewRadius?: number
  onMapClick?: (x: number, y: number) => void
  onZoneClick?: (zone: Zone) => void
  size?: 'small' | 'default'
}

const MAP_SCALE = 1.5

export const ZoneMap = ({
  zones,
  selectedCoords,
  selectedZoneId,
  center,
  createPreviewRadius,
  onMapClick,
  onZoneClick,
  size = 'default',
}: ZoneMapProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const initialCenter = center || ([0, 0] as [number, number])

  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.setView(center, 5, { animate: true })
    }
  }, [center])

  const handleMapClick = (lat: number, lng: number) => {
    const [x, y] = toGameCoords(lat, lng)
    onMapClick?.(x, y)
  }

  const minH = size === 'small' ? 300 : 400

  return (
    <div
      className={`relative flex-1 min-h-0 w-full border-2 border-rz-primary/30 rounded overflow-hidden ${size === 'small' ? 'min-h-[300px]' : ''}`}
    >
      <MapContainer
        style={{ width: '100%', height: '100%', minHeight: minH }}
        crs={CUSTOM_CRS}
        minZoom={5}
        maxZoom={5}
        center={initialCenter}
        zoom={5}
        zoomControl={false}
        attributionControl={false}
        maxBounds={MAX_BOUNDS}
        preferCanvas
        ref={(ref) => {
          if (ref) mapRef.current = ref
        }}
        whenReady={() => setTimeout(() => mapRef.current?.invalidateSize(), 0)}
      >
        <ComponentResize size={size} center={initialCenter} />
        <TileLayer url="https://www.gtamap.xyz/mapStyles/styleAtlas/{z}/{x}/{y}.jpg" noWrap />
        {selectedCoords && (
          <>
            <Marker
              position={toMapCoords(selectedCoords.x, selectedCoords.y)}
              icon={createCircleMarkerIcon(getThemePrimary())}
            />
            {createPreviewRadius != null && createPreviewRadius > 0 && (
              <Circle
                center={toMapCoords(selectedCoords.x, selectedCoords.y)}
                radius={createPreviewRadius * MAP_SCALE}
                pathOptions={{
                  color: getThemePrimary(),
                  fillColor: getThemePrimary(),
                  fillOpacity: 0.15,
                  weight: 2,
                  dashArray: '8,8',
                }}
              />
            )}
          </>
        )}
        {zones.map((zone) => {
          const c = zone.coords
          const [lat, lng] = toMapCoords(c.x, c.y)
          const hex = markerColourToHex(zone.markerColour, getThemePrimary())
          const isSelected = zone.id === selectedZoneId
          const mapRadius = zone.radius * MAP_SCALE
          return (
            <React.Fragment key={String(zone.id)}>
              <Circle
                center={[lat, lng]}
                radius={mapRadius}
                pathOptions={{
                  color: hex,
                  fillColor: hex,
                  fillOpacity: isSelected ? 0.35 : 0.2,
                  weight: isSelected ? 3 : 1,
                }}
                eventHandlers={{
                  click: () => onZoneClick?.(zone),
                }}
              />
              <Marker
                position={[lat, lng]}
                icon={createZoneMarkerIcon(hex, zone.blipName || zone.name)}
                eventHandlers={{
                  click: () => onZoneClick?.(zone),
                }}
              />
            </React.Fragment>
          )
        })}
        <MapClickHandler onClick={handleMapClick} />
      </MapContainer>
    </div>
  )
}
