import React from 'react';
import Content from './Content';
import useStateSlice from '../stores/stateSlice';
import { motion } from 'framer-motion';
import useSettingsStore from '../stores/settingsSlice';
import usePlayerStore from '../stores/playerSlice';

const BackButton = (props: { title: string }) => {
  const { setCurrentPage } = useStateSlice();
  const { editHud, toggleEditHud } = useSettingsStore()
  const { setSquadEdit } = usePlayerStore()

  const handleBack = () => {
    if (editHud) {
      toggleEditHud(false)
      return
    }
    setCurrentPage('Browse')
    setSquadEdit(false)
  }

  return (
    <Content className="flex gap-2 items-center rounded-md mb-3">
      <motion.div
        className="bg-white bg-opacity-5 rounded-sm w-6 h-6 flex items-center justify-center p-2 hover:cursor-pointer"
        onClick={handleBack}
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <img src="./icons/leftArrow.svg" className="object-contain" alt="back" />
      </motion.div>
      <span className="text-white font-semibold text-base">{props.title}</span>
    </Content>
  );
};

export default BackButton;