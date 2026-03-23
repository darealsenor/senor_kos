import React from 'react';
import { motion } from 'framer-motion';
import { ExitIcon, PlusIcon } from './icons';

interface ButtonProps {
  text: string;
  color: string;
  icon: 'plus' | 'exit';
  textColor: string;
  bgColor: string;
  onClick?: () => void;
}

const Button = (props: ButtonProps) => {
  return (
    <motion.div
      className={`w-full flex items-center justify-center ${props.color} rounded-md py-3 relative cursor-pointer`}
      style={{
        backgroundColor: props.bgColor,
      }}
      onClick={props.onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <button className={`${props.textColor} font-gilroy font-semibold text-[.9vw]`}>
        {props.text}
      </button>
      <div
        className={`absolute left-0 p-2 top-1/2 transform -translate-y-1/2 translate-x-2.5 rounded ${
          props.icon === 'plus' ? 'bg-white bg-opacity-5' : 'bg-[#FF0000]'
        } bg-opacity-10 flex items-center justify-center`}
      >
        {props.icon === 'plus' ? <PlusIcon /> : <ExitIcon />}
      </div>
    </motion.div>
  );
};

export default Button;