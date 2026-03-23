import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNuiEvent } from '../hooks/useNuiEvent'
import { fetchNui } from '../utils/fetchNui'

const VisibilityCtx = createContext<VisibilityProviderValue | null>(null)

interface VisibilityProviderValue {
  setVisible: (visible: boolean) => void
  visible: boolean
}

interface VisibilityProviderProps {
  children: ReactNode
}

export const VisibilityProvider = ({ children }: VisibilityProviderProps) => {
  const [visible, setVisible] = useState(false)

  useNuiEvent<boolean>('setVisible', setVisible)

  useEffect(() => {
    if (!visible) return

    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        fetchNui('hideFrame')
      }
    }

    window.addEventListener("keydown", keyHandler)

    return () => window.removeEventListener("keydown", keyHandler)
  }, [visible])

  return (
    <VisibilityCtx.Provider
      value={{
        visible,
        setVisible
      }}
    >
    <div style={{ visibility: visible ? 'visible' : 'hidden', height: '100%' }}>
      {children}
    </div>
  </VisibilityCtx.Provider>
  )
}

export const useVisibility = () => useContext(VisibilityCtx)
