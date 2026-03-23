import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { inputAtom } from '@/store/input.state'
import { useAtom } from 'jotai'
import { CoordsPreview } from '../../Creation/CoordsPreview'
import { Button } from '@/components/ui/button'
import { fetchNui } from '@/utils/fetchNui'
import { configAtom } from '@/store/config.state'
import { ILocation } from '@/types'

const AddLocation = () => {
  const [input, setInput] = useAtom(inputAtom)
  const [config, setConfig] = useAtom(configAtom)

  const handleAddLocation = async () => {
    if (!input.newDropName || !input.newDropCoords) return

    const result: { success: boolean; locations: ILocation[] } = await fetchNui(
      'airdrops.AddLocation',
      {
        name: input.newDropName,
        coords: input.newDropCoords,
      },
      {
        success: true,
        locations: [
          ...(config.coords ?? []),
          {
            id: Math.floor(Math.random() * 9999),
            name: input.newDropName,
            coords: input.newDropCoords,
          },
        ],
      },
    )

    if (result.success) {
      setConfig((prevState) => ({
        ...prevState,
        coords: result.locations,
      }))
      setInput((prevInput) => ({
        ...prevInput,
        newDropName: '',
      }))
    }
  }

  return (
    <div className="flex gap-1 items-end">
      {/* Label + Input side-by-side in a flex-col */}
      <div className="flex flex-col justify-center">
        <Label htmlFor="dropName" className="mb-1">
          Drop Name
        </Label>
        <Input
          type="text"
          id="dropName"
          placeholder="Enter drop name..."
          minLength={3}
          maxLength={16}
          value={input.newDropName}
          onChange={(e) => setInput((prev) => ({ ...prev, newDropName: e.target.value }))}
          className="h-9"
        />
      </div>

      {/* Coordinate preview */}
      <CoordsPreview input={{ coords: input.newDropCoords }} />

      <Button className="h-9" onClick={handleAddLocation}>
        Add
      </Button>
    </div>
  )
}

export default AddLocation
