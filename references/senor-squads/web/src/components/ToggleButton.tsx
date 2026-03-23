import React from 'react';
import { useLocales } from '../providers/LocaleProvider';
import { motion } from 'framer-motion';

interface ToggleButtonInterface {
  active?: boolean;
  onClick?: () => void;
}

const ToggleButton = ({ active, onClick }: ToggleButtonInterface) => {
  const { locale } = useLocales();

  return (
    <motion.div
      className="py-[0.2vw] px-[1.5vw] rounded-md font-gilroy font-semibold text-sm hover:cursor-pointer"
      initial={{
        backgroundColor: active
          ? 'var(--bg-accent)'
          : 'rgba(255, 255, 255, 0.05)',
        color: active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.5)',
      }}
      animate={{
        backgroundColor: active
          ? 'var(--bg-accent)'
          : 'rgba(255, 255, 255, 0.05)',
        color: active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.5)',
      }}
      whileHover={{
        backgroundColor: !active ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-accent)',
        color: !active ? 'rgba(255, 255, 255, 0.7)' : 'var(--primary-color)',
      }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {active ? locale.ui_toggle_active : locale.ui_toggle_disable}
    </motion.div>
  );
};

export default ToggleButton;