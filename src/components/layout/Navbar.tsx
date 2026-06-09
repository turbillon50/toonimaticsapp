'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const DEMO_MODES = ['public', 'user', 'admin'] as const
type DemoMode = typeof DEMO_MODES[number]

export default function Navbar({ demoMode, setDemoMode }: { demoMode: DemoMode; setDemoMode: (m: DemoMode) => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-black/40' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <span className="text-2xl font-black toon-gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
              TOONIMATICS
            </span>
          </motion.div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="/explore">Explorar</NavLink>
          <NavLink href="/artists">Artistas</NavLink>
          <NavLink href="/studios">Estudios</NavLink>
          <NavLink href="/store">Tienda</NavLink>
        </div>

        {/* Demo toggle + CTA */}
        <div className="flex items-center gap-3">
          {/* Demo Mode Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-[#111] border border-[#1E1E1E] rounded-full p-1">
            {DEMO_MODES.map((mode) => (
              <motion.button
                key={mode}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDemoMode(mode)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all duration-200 ${
                  demoMode === mode
                    ? 'toon-gradient-bg text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode === 'public' ? '👁 Público' : mode === 'user' ? '🎨 Artista' : '⚡ Admin'}
              </motion.button>
            ))}
          </div>

          {demoMode === 'public' ? (
            <motion.a
              href="/auth/signin"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:block px-4 py-2 rounded-full text-sm font-semibold neon-border text-white"
            >
              Unirse
            </motion.a>
          ) : demoMode === 'user' ? (
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} className="w-8 h-8 rounded-full toon-gradient-bg flex items-center justify-center text-white text-sm font-bold cursor-pointer">
                A
              </motion.div>
            </Link>
          ) : (
            <Link href="/admin">
              <motion.div whileHover={{ scale: 1.05 }} className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-xs font-bold cursor-pointer">
                ADM
              </motion.div>
            </Link>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400">
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current transition-all" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass border-t border-[#1E1E1E] overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {['Explorar', 'Artistas', 'Estudios', 'Tienda'].map(item => (
                <a key={item} href="#" className="block text-gray-300 hover:text-white py-2 border-b border-[#1E1E1E]">{item}</a>
              ))}
              {/* Mobile demo toggle */}
              <div className="flex gap-2 pt-2">
                {DEMO_MODES.map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setDemoMode(mode); setMenuOpen(false) }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize ${demoMode === mode ? 'toon-gradient-bg text-white' : 'bg-[#1E1E1E] text-gray-400'}`}
                  >
                    {mode === 'public' ? '👁' : mode === 'user' ? '🎨' : '⚡'} {mode}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -1 }}
      className="text-gray-400 hover:text-white text-sm font-medium transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 toon-gradient-bg group-hover:w-full transition-all duration-300" />
    </motion.a>
  )
}
