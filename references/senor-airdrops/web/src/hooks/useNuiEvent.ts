import { useEffect } from 'react'

interface NuiMessageData<T = unknown> {
  action: string;
  data: T;
}

type NuiHandlerSignature<T> = (data: T) => void;

/**
 * A hook that manage events listeners for receiving data from the client scripts
 * @param action The specific `action` that should be listened for.
 * @param handler The callback function that will handle data relayed by this hook
 *
 * @example
 * useNuiEvent<{visibility: true, wasVisible: 'something'}>('setVisible', (data) => {
 *   // whatever logic you want
 * })
 *
 **/

export const useNuiEvent = (action: string, handler: (data: any) => void) => {
  useEffect(() => {
    const eventListener = (event: MessageEvent) => {
      const { action: eventAction, data } = event.data

      if (eventAction === action) {
        handler(data)
      }
    }

    window.addEventListener('message', eventListener)
    return () => window.removeEventListener('message', eventListener)
  }, [action, handler])
}

