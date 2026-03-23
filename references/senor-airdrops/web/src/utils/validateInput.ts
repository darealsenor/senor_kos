import { IInput } from '@/types'

export const validateInput = (input: IInput) => {
  return (
    input.coords &&
    input.lockTime > 0 &&
    input.distance > 0 &&
    input.interaction &&
    input.weapons &&
    input.settings
  )
} 