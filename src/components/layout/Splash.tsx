'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Splash() {
  const [visible, setVisible] = useState(true)
  useEffect(() => { const t = setTimeout(() => setVisible(false), 2400); return () => clearTimeout(t) }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: '#0A0A0A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // Mismo max-width que app-shell, centrado
            padding: '0 24px',
          }}
        >
          {/* BG image — collab.webp que es la que se ve bien */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <img
              src="/hf/collab.webp"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.7) 50%, rgba(10,10,10,0.95) 100%)'
            }} />
          </div>

          {/* Glow orbs */}
          <motion.div
            style={{
              position: 'absolute', width: 280, height: 280, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,107,0,0.18), transparent)',
              filter: 'blur(40px)', top: '20%', left: '50%', transform: 'translateX(-50%)'
            }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'absolute', width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,0,255,0.15), transparent)',
              filter: 'blur(40px)', bottom: '25%', left: '50%', transform: 'translateX(-50%)'
            }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Contenido centrado — relativo al container */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%' }}>

            {/* Logo — tamaño controlado para no salirse */}
            <motion.div
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(32px, 10vw, 52px)', // se adapta al ancho
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #FF6B00, #FF1493, #8B00FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block',
                whiteSpace: 'nowrap',
              }}>
                TOONIMATICS
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              style={{
                color: '#888',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginTop: 10,
              }}
            >
              Plataforma artística
            </motion.p>

            {/* Progress bar */}
            <div style={{
              marginTop: 28,
              width: 120,
              height: 2,
              background: '#1E1E1E',
              borderRadius: 2,
              overflow: 'hidden',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg, #FF6B00, #FF1493, #8B00FF)', borderRadius: 2 }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, ease: 'linear' }}
              />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
