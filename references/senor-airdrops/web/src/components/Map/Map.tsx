import React, { FC, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAtom } from 'jotai'
import { airdropsAtom } from '@/store/drop.state'
import { waypointAtom } from '@/store/waypoint.state'
import { setWaypoint } from '@/utils/misc'
import { ComponentResize, MapClickHandler } from './map.helpers'
import {
  createCircleMarkerHtml,
  createLocationMarkerHtml,
  getAirdropMarkerColor,
  IMapCircles,
  IMapMarker,
} from './map.marker'
import { CUSTOM_CRS, MAX_BOUNDS, toGameCoords, toMapCoords } from './map.constants'
import { Watermark } from '../Watermark'

interface IMapProps {
  size?: 'small' | 'default'
  hideAvatarInMarker?: boolean
  zoom?: number
  center?: [number, number]
  coordsToView?: [number, number]
  animateView?: boolean
  onMapClick?: (lat: number, lng: number) => void
  selectedCoords?: { x: number; y: number }
  markers?: IMapMarker[]
  circles?: IMapCircles[]
  showAirdrops?: boolean
  autoCenterOnLowestTimeDrop?: boolean
}

const GTAMap: FC<IMapProps> = ({
  size = 'default',
  zoom = 5,
  onMapClick,
  selectedCoords,
  center,
  markers = [],
  showAirdrops = false,
  autoCenterOnLowestTimeDrop = false,
  circles = [],
}) => {
  const [airdrops] = useAtom(airdropsAtom)
  const [waypoint, setWaypointState] = useAtom(waypointAtom)
  const mapRef = useRef<L.Map | null>(null)
  const hasCenteredRef = useRef(false)

  const lowestTimeDrop = useMemo(() => {
    if (!autoCenterOnLowestTimeDrop || !airdrops.length) return null
    return airdrops.reduce((a, b) => (a.timeLeft < b.timeLeft ? a : b))
  }, [airdrops, autoCenterOnLowestTimeDrop])

  const initialCenter = useMemo(() => {
    if (autoCenterOnLowestTimeDrop && lowestTimeDrop && !hasCenteredRef.current) {
      hasCenteredRef.current = true
      const [lat, lng] = toMapCoords(lowestTimeDrop.coords.x, lowestTimeDrop.coords.y)
      return [lat, lng] as [number, number]
    }
    return center || ([0, 0] as [number, number])
  }, [autoCenterOnLowestTimeDrop, lowestTimeDrop, center])

  useEffect(() => {
    if (autoCenterOnLowestTimeDrop && lowestTimeDrop && mapRef.current && !hasCenteredRef.current) {
      hasCenteredRef.current = true
      const [lat, lng] = toMapCoords(lowestTimeDrop.coords.x, lowestTimeDrop.coords.y)
      mapRef.current.setView([lat, lng] as [number, number], zoom, {
        animate: true,
      })
    }
  }, [lowestTimeDrop, autoCenterOnLowestTimeDrop, zoom])

  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.setView(center, zoom, {
        animate: true,
      })
    }
  }, [center, zoom])

  const handleMapClick = (lat: number, lng: number) => {
    const [x, y] = toGameCoords(lat, lng)
    const waypointData = { x, y, z: 0 }
    setWaypoint(waypointData, setWaypointState)
    onMapClick?.(lat, lng)
  }

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div
        className={`relative flex-[0_0_95%] w-full h-full ${
          size === 'small' ? 'min-h-[300px]' : 'min-h-[500px]'
        } border-[2.5px] border-primary rounded-[8px] overflow-hidden`}
      >
        <MapContainer
          style={{ width: '100%', height: '100%', minHeight: size === 'small' ? '300px' : '500px' }}
          crs={CUSTOM_CRS}
          minZoom={5}
          maxZoom={5}
          center={initialCenter}
          zoom={zoom}
          zoomControl={false}
          attributionControl={false}
          maxBounds={MAX_BOUNDS}
          preferCanvas={true}
          ref={mapRef}
          whenReady={() => setTimeout(() => mapRef.current?.invalidateSize(), 0)}
        >
          <ComponentResize size={size} center={initialCenter} />
          <TileLayer url="https://www.gtamap.xyz/mapStyles/styleAtlas/{z}/{x}/{y}.jpg" noWrap />
          {selectedCoords &&
            (() => {
              const [lat, lng] = toMapCoords(selectedCoords.x, selectedCoords.y)
              return <Marker position={[lat, lng]} icon={createCircleMarkerHtml('blue')} />
            })()}
          {waypoint &&
            (() => {
              const [lat, lng] = toMapCoords(waypoint.x, waypoint.y)
              return (
                <Marker
                  position={[lat, lng]}
                  icon={L.divIcon({
                    className: '',
                    html: `<div class="w-[20px] h-[20px] rounded-full border-[3px] border-white shadow-lg" style="background-color: hsl(var(--primary))"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })}
                />
              )
            })()}
          {markers.map((m, i) => {
            const [lat, lng] = toMapCoords(m.x, m.y)
            return (
              <Marker
                key={i}
                position={[lat, lng]}
                icon={
                  m.label ? createLocationMarkerHtml(m.color || 'blue', m.label) : createCircleMarkerHtml(m.color || 'red')
                }
                eventHandlers={{ click: () => m.onClick?.() }}
              />
            )
          })}

          {circles.length
            ? circles.map((m, i) => {
                const [lat, lng] = toMapCoords(m.center[0], m.center[1])
                return (
                  <Circle
                    center={[lat, lng]}
                    radius={m.radius ?? 200}
                    pathOptions={m.pathOptions}
                    key={i}
                  />
                )
              })
            : null}

          {showAirdrops &&
            airdrops.map((drop) => {
              const [lat, lng] = toMapCoords(drop.coords.x, drop.coords.y)
              const pos: [number, number] = [lat, lng]
              const color = getAirdropMarkerColor(drop.timeLeft)
              const markerColor = color === '#00c853' ? 'green' : color === '#ff5e00' ? 'orange' : 'red'
              return (
                <React.Fragment key={drop.id}>
                  <Circle
                    center={pos}
                    radius={drop.distance ?? 200}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 1 }}
                  />
                  <Marker
                    position={pos}
                    icon={createCircleMarkerHtml(markerColor)}
                    eventHandlers={{
                      click: () => {
                        const waypointData = { x: drop.coords.x, y: drop.coords.y, z: drop.coords.z }
                        setWaypoint(waypointData, setWaypointState)
                      },
                    }}
                  />
                </React.Fragment>
              )
            })}
          <MapClickHandler onClick={handleMapClick} />
        </MapContainer>
      </div>
      <div className="flex flex-[0_0_5%] items-center justify-end">
        <Watermark />
      </div>
    </div>
  )
}

export default GTAMap
