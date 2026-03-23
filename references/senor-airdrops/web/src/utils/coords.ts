import { fetchNui } from './fetchNui'
import { Vector3 } from '@/types'

interface GetCoordsResponse {
  success: boolean
  data: Vector3
}

interface GetStreetResponse {
  success: boolean
  data: string
}

export const getCurrentPosition = async (): Promise<Vector3> => {
  const retval: GetCoordsResponse = await fetchNui('airdrops.client.GetCoords', null, {
    success: true,
    data: { x: 0, y: 0, z: 0 },
  })

  if (retval.success) {
    return retval.data
  }
  throw new Error('Failed to get current position')
}

export const getCurrentStreet = async (): Promise<string> => {
  const retval: GetStreetResponse = await fetchNui('airdrops.client.GetStreet', null, {
    success: true,
    data: 'Senora Freeway'
  })

  if (retval.success) {
    return retval.data
  }
  throw new Error('Failed to get current street')
}
