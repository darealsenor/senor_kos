import { IInput, OpenMenuData, Airdrop } from '@/types'
import { DropLockTime } from './DropLockTime'
import { DropDistance } from './DropDistance'
import { SelectInteraction } from './SelectInteraction'
import { SelectModes } from './SelectModes'
import { SelectWeapons } from './SelectWeapons'
import CoordPreset from './CoordPreset'
import { CoordsPreview } from './CoordsPreview'
import { SubmitButton } from './SubmitButton'
import { validateInput } from '../../../utils/validateInput'

interface LeftDropFormProps {
  input: IInput
  setInput: (input: IInput | ((prev: IInput) => IInput)) => void
  config: OpenMenuData
  airdrops: Airdrop[]
  setAirdrops: (airdrops: Airdrop[] | ((prev: Airdrop[]) => Airdrop[])) => void
}

export function LeftDropForm({ input, setInput, config, airdrops, setAirdrops }: LeftDropFormProps) {
  const isValid = validateInput(input)

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 flex-grow">
        <CoordPreset config={config} input={input} setInput={setInput} />
        <CoordsPreview input={input} />
        <DropLockTime input={input} setInput={setInput} />
        <DropDistance input={input} setInput={setInput} />
        <SelectInteraction config={config} input={input} setInput={setInput} />
        <SelectWeapons config={config} input={input} setInput={setInput} />
        <SelectModes config={config} input={input} setInput={setInput} />
      </div>
      <div className="mt-4">
        <SubmitButton disabled={!isValid} input={input} airdrops={airdrops} setAirdrops={setAirdrops} />
      </div>
    </div>
  )
} 