'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { FadeIn } from '../ui/motion'

const ROLES = ['Directores', 'Actores', 'Músicos', 'Fotógrafos', 'Editores', 'Productores']

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video/Image background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(255,107,0,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(139,0,255,0.12) 0%, transparent 60%), #0A0A0A'
        }} />
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,107,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </motion.div>

      {/* Floating orbs */}
      <motion.div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 -left-24 top-1/4"
        style={{ background: 'radial-gradient(circle, #FF6B00, transparent)' }}
        animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 -right-16 bottom-1/4"
        style={{ background: 'radial-gradient(circle, #8B00FF, transparent)' }}
        animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div style={{ opacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <FadeIn delay={0.1}>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 neon-border"
            style={{ background: 'rgba(255,107,0,0.08)' }}
            animate={{ boxShadow: ['0 0 0 0 rgba(255,107,0,0)', '0 0 20px 4px rgba(255,107,0,0.15)', '0 0 0 0 rgba(255,107,0,0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gray-300">Plataforma abierta para artistas latinoamericanos</span>
          </motion.div>
        </FadeIn>

        {/* Headline */}
        <FadeIn delay={0.2}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Donde el{' '}
            <span className="toon-gradient-text">talento</span>
            <br />
            se vuelve{' '}
            <span className="toon-gradient-text">obra.</span>
          </h1>
        </FadeIn>

        {/* Rotating roles */}
        <FadeIn delay={0.35}>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {ROLES.map((role, i) => (
              <motion.span
                key={role}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.06, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.08, y: -2 }}
                className="px-3 py-1 rounded-full text-sm font-medium bg-[#1E1E1E] border border-[#2E2E2E] text-gray-300 cursor-default"
              >
                {role}
              </motion.span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.5}>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            La plataforma donde creadores publican su trabajo, colaboran con otros artistas
            y monetizan su arte. Sin intermediarios.
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={0.65}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/auth/signin"
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(255,107,0,0.35)' }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-full text-white font-bold text-base toon-gradient-bg shadow-lg"
            >
              Crear perfil gratis
            </motion.a>
            <motion.a
              href="/explore"
              whileHover={{ scale: 1.04, borderColor: 'rgba(255,107,0,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-full text-white font-semibold text-base border border-[#2E2E2E] bg-[#111] hover:bg-[#1A1A1A] transition-all"
            >
              Explorar artistas →
            </motion.a>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.8}>
          <div className="flex justify-center gap-12 mt-16 pt-10 border-t border-[#1E1E1E]">
            {[
              { label: 'Artistas', value: '12,000+' },
              { label: 'Obras publicadas', value: '48,000+' },
              { label: 'Colaboraciones', value: '3,200+' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black toon-gradient-text">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 border border-gray-600 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full toon-gradient-bg" />
        </div>
      </motion.div>
    </section>
  )
}
