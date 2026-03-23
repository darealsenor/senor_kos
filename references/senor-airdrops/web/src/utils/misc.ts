import { Vector3 } from '@/types'
import { fetchNui } from './fetchNui'

// Will return whether the current environment is in a regular browser
// and not CEF
export const isEnvBrowser = (): boolean => !(window as any).invokeNative;

export const setWaypoint = async (coords: Vector3, setWaypointState?: (coords: Vector3) => void) => {
  await fetchNui('setWaypoint', coords)
  if (setWaypointState) {
    setWaypointState(coords)
  }
}

