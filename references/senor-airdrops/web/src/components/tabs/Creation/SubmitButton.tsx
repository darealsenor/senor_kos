import React from 'react'
import { Button } from '@/components/ui/button'
import { IInput, Airdrop } from '@/types'
import { fetchNui } from '@/utils/fetchNui'
import { isEnvBrowser } from '@/utils/misc'
import { debugData } from '@/utils/debugData'

interface SubmitButtonProps {
  disabled: boolean
  input: IInput
  airdrops: Airdrop[]
  setAirdrops: React.Dispatch<React.SetStateAction<Airdrop[]>>
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ disabled, input, airdrops, setAirdrops }) => {
  const handleClick = async () => {
    if (disabled) return
    const newDrop: { success: boolean; data: Airdrop[]; message: string } = await fetchNui(
      'airdrops.createDrop',
      input,
      {
        success: true,
        message: 'New drop has been added',
        data: [
          ...(airdrops ?? []),
          {
            playerId: 0,
            coords: input.newDropCoords,
            lockTime: input.lockTime,
            distance: input.distance,
            weapons: input.weapons ?? 'Regular',
            settings: input.settings ?? {},
            interaction: input.interaction ?? 'Interaction',
            dropState: 0,
            startTime: Date.now(),
            timeLeft: input.lockTime,
            id: Math.random().toString(36).substring(2, 10),
            prizes: [],
          },
        ],
      },
    )

    if (newDrop.success) {
      setAirdrops(newDrop.data)
    }

    if (isEnvBrowser()) {
      debugData([
        {
          action: 'JoinedAirdrop',
          data: newDrop.data
        },
        {
          action: 'setVisibleCountdown',
          data: true
        }
      ])
    }
  }

  return (
    <Button className="mt-auto w-[95%]" disabled={disabled} onClick={handleClick}>
      CREATE DROP
    </Button>
  )
}
