'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Splash() {
  const [visible, setVisible] = useState(true)
  useEffect(() => { const t = setTimeout(() => setVisible(false), 2200); return () => clearTimeout(t) }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: '#0A0A0A' }}
        >
          {/* BG image */}
          <div className="absolute inset-0 opacity-20">
            <Image src="/hf/cinematic.webp" alt="" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

          {/* Glow */}
          <motion.div className="absolute w-64 h-64 rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, #FF6B00, transparent)' }}
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />

          {/* Logo */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <span className="text-4xl font-black toon-gradient-text" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
                TOONIMATICS
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="text-xs tracking-widest uppercase mt-2" style={{ color: '#888' }}
            >
              Plataforma artística
            </motion.p>
            <motion.div className="mt-6 w-32 mx-auto h-0.5 rounded-full overflow-hidden" style={{ background: '#222' }}>
              <motion.div className="h-full toon-gradient-bg" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.8, ease: 'linear' }} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
