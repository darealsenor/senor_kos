import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  confirmVariant?: 'destructive' | 'primary'
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmVariant = 'destructive',
}) => {
  return (
    <AnimatePresence>
      {open && (
      <motion.div
        key="confirm-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={onCancel}
          aria-hidden
        />
        <motion.div
          className="relative w-full max-w-md rounded-lg py-4 px-4 flex flex-col gap-4"
          style={{
            background: 'var(--container-bg, linear-gradient(360deg, #0B0B0B 0%, #101A17 100%))',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col gap-2">
            <span className="text-white font-gilroy font-semibold text-base">{title}</span>
            <span className="text-white text-opacity-70 font-gilroy font-medium text-sm">{message}</span>
          </div>
          <div className="flex gap-2 justify-end">
            <motion.button
              type="button"
              className="py-2.5 px-4 rounded-md font-gilroy font-semibold text-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--primary-color)',
              }}
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cancelLabel}
            </motion.button>
            <motion.button
              type="button"
              className="py-2.5 px-4 rounded-md font-gilroy font-semibold text-sm"
              style={
                confirmVariant === 'destructive'
                  ? {
                      backgroundColor: 'var(--back-accent, rgba(255, 0, 0, 0.05))',
                      color: '#FF0000',
                    }
                  : {
                      backgroundColor: 'var(--button-bg, #00CB8A)',
                      color: '#fff',
                    }
              }
              onClick={onConfirm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {confirmLabel}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmModal
