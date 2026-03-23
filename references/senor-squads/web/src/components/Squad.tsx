import React, { useEffect, useState } from 'react'
import Container from './Container'
import SettingsWithButton from './SquadPages/Settings'
import Creation from './SquadPages/Creation'
import SquadPreview from './SquadPages/SquadPreview'
import useStateSlice from '../stores/stateSlice'
import SquadBrowse from './SquadPages/SquadBrowse'
import usePlayerStore from '../stores/playerSlice'
import { motion, AnimatePresence } from 'framer-motion'

const Squad = () => {
  const { currentPage, setCurrentPage } = useStateSlice()
  const { squadEdit, setSquadEdit, mySquad, setMySquad } = usePlayerStore()


  useEffect(() => {
    if (squadEdit) {
      setCurrentPage('Creation')
    }
  }, [squadEdit, setCurrentPage])

  useEffect(() => {
    if (currentPage !== 'Creation' && squadEdit) {
      setSquadEdit(false)
    }
  }, [currentPage, squadEdit, setSquadEdit])

  useEffect(() => {
    if (mySquad && currentPage == 'Browse') {
      setCurrentPage('Squad')
    }
  }, [mySquad, currentPage, setCurrentPage])

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const pageTransition = {
    duration: 0.3,
  }

  return (
    <Container>
      <AnimatePresence mode="wait">
        {currentPage === 'Settings' && (
          <motion.div
            key="settings"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="flex flex-col flex-1 min-h-0"
          >
            <SettingsWithButton />
          </motion.div>
        )}
        {currentPage === 'Creation' && (
          <motion.div
            key="creation"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="flex flex-col flex-1 min-h-0"
          >
            <Creation editMode={squadEdit} />
          </motion.div>
        )}
        {currentPage === 'Squad' && (
          <motion.div
            key="squad"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="flex flex-col flex-1 min-h-0"
          >
            <SquadPreview />
          </motion.div>
        )}
        {currentPage === 'Browse' && (
          <motion.div
            key="browse"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
          >
            <SquadBrowse />
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}

export default Squad
