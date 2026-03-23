import React from 'react'
import { Input } from '@/components/ui/input'
import { IInput } from '@/types'
import { useAtom } from 'jotai'
import { mapAtom } from '@/store/map.state'

interface CoordsPreviewProps {
  input: IInput
}

export const CoordsPreview: React.FC<CoordsPreviewProps> = ({ input }) => {
  const [mapState, setMapState] = useAtom(mapAtom)

  React.useEffect(() => {
    if (input.coords) {
      setMapState(prev => ({
        ...prev,
        center: [input.coords.y - 80, input.coords.x + 100] as [number, number]
      }))
    }
  }, [input.coords, setMapState])

  return (
    <Input
      type="text"
      value={`vector3(${input.coords.x.toFixed(2)}, ${input.coords.y.toFixed(2)}, ${input.coords.z.toFixed(2)})`}
      className="w-[240px]"
      disabled
    />
  )
} 