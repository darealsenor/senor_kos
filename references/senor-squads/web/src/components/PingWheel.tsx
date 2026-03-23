import React, { useCallback, useEffect, useRef, useState } from 'react'
import { fetchNui } from '../utils/fetchNui'

interface PingSegment {
  id: string
  label: string
  color: string
  icon: string
}

const SEGMENTS: PingSegment[] = [
  { id: 'go',     label: 'Go Here',          color: '#63c000', icon: './pings/go.png'     },
  { id: 'enemy',  label: 'Enemy',            color: '#DC2828', icon: './pings/enemy.png'  },
  { id: 'danger', label: 'Danger',           color: '#E67800', icon: './pings/danger.png' },
  { id: 'loot',   label: 'Loot',             color: '#DCB400', icon: './pings/loot.png'   },
  { id: 'defend', label: 'Defend',           color: '#0078E6', icon: './pings/defend.png' },
  { id: 'car',    label: 'Vehicle Spotted',  color: '#B464FF', icon: './pings/car.png'    },
]

const OUTER_R     = 148
const INNER_R     = 54
const HOVER_EXTRA = 14
const GAP_DEG     = 4
const SIZE        = 360
const CX          = SIZE / 2
const CY          = SIZE / 2
const TOTAL       = SEGMENTS.length

function polarToCart(r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function segmentPath(inner: number, outer: number, startDeg: number, endDeg: number) {
  const o1 = polarToCart(outer, startDeg)
  const o2 = polarToCart(outer, endDeg)
  const i1 = polarToCart(inner, endDeg)
  const i2 = polarToCart(inner, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ')
}

interface Props {
  visible: boolean
  onClose: () => void
}

const DEAD_ZONE = 24

const PingWheel: React.FC<Props> = ({ visible, onClose }) => {
  const [hovered, setHovered] = useState<string | null>(null)
  const hoveredRef = useRef<string | null>(null)
  const wheelRef   = useRef<HTMLDivElement>(null)

  const close = useCallback((type?: string) => {
    if (type) fetchNui('pingSelected', { type })
    else fetchNui('closePingWheel')
    setHovered(null)
    hoveredRef.current = null
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!visible) { setHovered(null); hoveredRef.current = null; return }

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }

    const onMove = (e: MouseEvent) => {
      if (!wheelRef.current) return
      const rect = wheelRef.current.getBoundingClientRect()
      const dx   = e.clientX - (rect.left + rect.width  / 2)
      const dy   = e.clientY - (rect.top  + rect.height / 2)

      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        setHovered(null)
        hoveredRef.current = null
        return
      }

      const sliceDeg = 360 / TOTAL
      let angleDeg   = (Math.atan2(dy, dx) * 180) / Math.PI + 90
      if (angleDeg < 0) angleDeg += 360

      const id = SEGMENTS[Math.floor(angleDeg / sliceDeg) % TOTAL].id
      setHovered(id)
      hoveredRef.current = id
    }

    const onUp = () => close(hoveredRef.current ?? undefined)

    window.addEventListener('keydown', onKey)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [visible, close])

  if (!visible) return null

  const sliceDeg = 360 / TOTAL
  const hoveredSeg = SEGMENTS.find((s) => s.id === hovered)

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div
        ref={wheelRef}
        className="relative select-none"
        style={{ width: SIZE, height: SIZE }}
      >

        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ position: 'absolute', inset: 0 }}
        >
          {SEGMENTS.map((seg, i) => {
            const startDeg  = i * sliceDeg + GAP_DEG / 2
            const endDeg    = (i + 1) * sliceDeg - GAP_DEG / 2
            const isHovered = hovered === seg.id
            const outerR    = isHovered ? OUTER_R + HOVER_EXTRA : OUTER_R
            const midAngle  = (startDeg + endDeg) / 2
            const iconR     = (outerR + INNER_R) / 2

            const iconPos   = polarToCart(iconR, midAngle)
            const labelPos  = polarToCart(outerR - 18, midAngle)

            return (
              <g key={seg.id} style={{ cursor: 'pointer' }}>
                <path
                  d={segmentPath(INNER_R, outerR, startDeg, endDeg)}
                  fill={isHovered ? `${seg.color}22` : 'rgba(8,10,9,0.86)'}
                  stroke={isHovered ? seg.color : 'rgba(255,255,255,0.08)'}
                  strokeWidth={isHovered ? 1.5 : 1}
                  style={{ transition: 'fill 0.08s ease, stroke 0.08s ease' }}
                />

                {isHovered && (
                  <path
                    d={segmentPath(OUTER_R + HOVER_EXTRA - 3, OUTER_R + HOVER_EXTRA, startDeg, endDeg)}
                    fill={seg.color}
                    style={{ transition: 'opacity 0.08s ease' }}
                  />
                )}

                <foreignObject
                  x={iconPos.x - 20}
                  y={iconPos.y - 20}
                  width={40}
                  height={40}
                  style={{ pointerEvents: 'none', overflow: 'visible' }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={seg.icon}
                      alt={seg.label}
                      style={{
                        width: isHovered ? 36 : 28,
                        height: isHovered ? 36 : 28,
                        objectFit: 'contain',
                        filter: isHovered ? 'none' : 'brightness(0.55) saturate(0.4)',
                        transition: 'width 0.08s ease, height 0.08s ease, filter 0.08s ease',
                      }}
                    />
                  </div>
                </foreignObject>

                {isHovered && (
                  <foreignObject
                    x={labelPos.x - 52}
                    y={labelPos.y - 10}
                    width={104}
                    height={20}
                    style={{ pointerEvents: 'none', overflow: 'visible' }}
                  >
                    <div
                      style={{
                        width: 104,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Gilroy, Arial, sans-serif',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#fff',
                          background: seg.color,
                          padding: '2px 7px',
                          borderRadius: 3,
                          whiteSpace: 'nowrap',
                          lineHeight: 1.4,
                        }}
                      >
                        {seg.label}
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
            )
          })}

          <circle
            cx={CX} cy={CY} r={INNER_R}
            fill="rgba(8,10,9,0.92)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />

          <circle
            cx={CX} cy={CY} r={INNER_R - 6}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        </svg>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {hoveredSeg ? (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: hoveredSeg.color,
                boxShadow: `0 0 8px 2px ${hoveredSeg.color}88`,
              }}
            />
          ) : (
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          )}
        </div>
      </div>
    </div>
  )
}

export default PingWheel
