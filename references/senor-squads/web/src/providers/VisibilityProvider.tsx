import React, { Context, createContext, useContext, useEffect, useState } from 'react'
import { useNuiEvent } from '../hooks/useNuiEvent'
import { fetchNui } from '../utils/fetchNui'
import { isEnvBrowser } from '../utils/misc'
import useSettingsStore from '../stores/settingsSlice'
import { motion, AnimatePresence } from 'framer-motion'

const VisibilityCtx = createContext<VisibilityProviderValue | null>(null)

interface VisibilityProviderValue {
  setVisible: (visible: boolean) => void
  visible: boolean
}

// This should be mounted at the top level of your application, it is currently set to
// apply a CSS visibility value. If this is non-performant, this should be customized.
export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false)
  const { editHud, toggleEditHud } = useSettingsStore()

  useNuiEvent<boolean>('setVisible', setVisible)

  // Handle pressing escape/backspace
  useEffect(() => {
    // Only attach listener when we are visible
    if (!visible) return

    const keyHandler = (e: KeyboardEvent) => {
      if (['Escape'].includes(e.code)) {
        if (editHud) {
          toggleEditHud(false)
          return
        }
        if (!isEnvBrowser()) fetchNui('hideFrame')
        else setVisible(!visible)
      }
    }

    window.addEventListener('keydown', keyHandler)

    return () => window.removeEventListener('keydown', keyHandler)
  }, [visible, editHud, toggleEditHud])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <VisibilityCtx.Provider
      value={{
        visible,
        setVisible,
      }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            transition={{ duration: 0.3 }}
            style={{ height: '100%', width: '100%', display: 'flex', gap: '1vh' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </VisibilityCtx.Provider>
  )
}

export const useVisibility = () =>
  useContext<VisibilityProviderValue>(VisibilityCtx as Context<VisibilityProviderValue>)
