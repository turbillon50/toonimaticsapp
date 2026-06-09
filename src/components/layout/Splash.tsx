'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Splash() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: '#0A0A0A' }}
        >
          {/* Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 3 === 0 ? '#FF6B00' : i % 3 === 1 ? '#FF1493' : '#8B00FF',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Glow rings */}
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139,0,255,0.1) 0%, transparent 70%)' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {/* Logo text */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <span
                className="text-5xl md:text-7xl font-black toon-gradient-text select-none"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
              >
                TOONIMATICS
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-gray-400 mt-3 text-sm tracking-widest uppercase"
            >
              Plataforma Artística Colaborativa
            </motion.p>

            {/* Progress bar */}
            <motion.div className="mt-8 w-48 mx-auto h-0.5 bg-[#1E1E1E] rounded-full overflow-hidden">
              <motion.div
                className="h-full toon-gradient-bg"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
