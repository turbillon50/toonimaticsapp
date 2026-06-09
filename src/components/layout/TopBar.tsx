'use client'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/context'

const DEMO_LABELS = { public: '👁', user: '🎨', admin: '⚡' }
type DemoMode = 'public' | 'user' | 'admin'

export default function TopBar({ title, showLogo = false, right }: {
  title?: string
  showLogo?: boolean
  right?: React.ReactNode
}) {
  const { theme, toggleTheme, lang, setLang, demoMode, setDemoMode } = useApp()

  return (
    <header className="glass safe-top sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        {/* Left: Logo or title */}
        <div>
          {showLogo ? (
            <span className="text-xl font-black toon-gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
              TOONIMATICS
            </span>
          ) : (
            <h1 className="text-lg font-bold" style={{ color: 'var(--c-text)' }}>{title}</h1>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* Demo mode pill */}
          <div className="flex items-center gap-0.5 bg-[var(--c-surface2)] rounded-full p-0.5 border border-[var(--c-border)]">
            {(['public','user','admin'] as DemoMode[]).map(m => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDemoMode(m)}
                className={`w-7 h-7 rounded-full text-xs transition-all ${
                  demoMode === m ? 'toon-gradient-bg shadow-sm' : 'text-[var(--c-muted)]'
                }`}
              >
                {DEMO_LABELS[m]}
              </motion.button>
            ))}
          </div>

          {/* Lang toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="w-8 h-8 rounded-full bg-[var(--c-surface2)] border border-[var(--c-border)] text-xs font-bold flex items-center justify-center"
            style={{ color: 'var(--c-text)' }}
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-[var(--c-surface2)] border border-[var(--c-border)] flex items-center justify-center text-base"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </motion.button>

          {right}
        </div>
      </div>
    </header>
  )
}
