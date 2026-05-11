import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNuiStore } from '@/store/nuiStore'

export function RoundAnnouncer() {
  const announcer = useNuiStore(s => s.announcer)
  const setAnnouncer = useNuiStore(s => s.setAnnouncer)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (announcer.visible) {
      setTimeLeft(announcer.seconds)
    }
  }, [announcer.visible, announcer.seconds, announcer.title])

  useEffect(() => {
    if (!announcer.visible || timeLeft <= 0) return
    
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id)
          setTimeout(() => {
             setAnnouncer({ visible: false })
          }, 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [announcer.visible, timeLeft, setAnnouncer])

  const colorMap = {
    teamA: 'from-[#ff3a3a] to-[#ff7a7a]',
    teamB: 'from-[#3a9b47] to-[#7adb87]',
    neutral: 'from-white to-white/50'
  }
  const colorClass = colorMap[announcer.colorTheme || 'neutral']

  return (
    <AnimatePresence>
      {announcer.visible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/5"
        >
          <motion.div 
            initial={{ scale: 1.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="flex flex-col items-center justify-center text-center px-4"
          >
             {announcer.subtitle && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-[20px] md:text-[28px] font-bold text-white/50 tracking-[0.2em] uppercase font-display mb-2 drop-shadow-lg"
               >
                 {announcer.subtitle}
               </motion.div>
             )}
             
             <div className={`text-[72px] md:text-[96px] font-bold uppercase leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b ${colorClass} font-display drop-shadow-[0_0_40px_rgba(0,0,0,0.5)]`}>
               {announcer.title}
             </div>

             <AnimatePresence mode="popLayout" initial={false}>
               {timeLeft > 0 && (
                 <motion.div 
                   key={timeLeft}
                   initial={{ scale: 1.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   exit={{ scale: 0.5, opacity: 0 }}
                   transition={{ duration: 0.25, ease: "easeOut" }}
                   className="mt-8 text-[120px] md:text-[160px] font-display font-bold leading-none tabular-nums"
                   style={{
                     backgroundImage: `linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.4) 100%)`,
                     WebkitBackgroundClip: 'text',
                     color: 'transparent',
                     filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.3))'
                   }}
                 >
                   {timeLeft}
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

