'use client'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { usePathname, useRouter } from 'next/navigation'

const TABS = [
  { key: 'home' as const, path: '/' },
  { key: 'explore' as const, path: '/explore' },
  { key: 'create' as const, path: '/create' },
  { key: 'messages' as const, path: '/messages' },
  { key: 'profile' as const, path: '/profile' },
]

const ICONS: Record<string, { inactive: string; active: string }> = {
  home: {
    inactive: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    active:   `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.2" stroke-linejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  explore: {
    inactive: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M21 21l-2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    active:   `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.2"/><path d="M21 21l-2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  messages: {
    inactive: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    active:   `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.2" stroke-linejoin="round"/></svg>`,
  },
  profile: {
    inactive: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    active:   `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
}

export default function BottomNav() {
  const { lang } = useApp()
  const tx = t(lang).nav
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="bottom-nav flex items-center justify-around px-1">
      {TABS.map(tab => {
        const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path)
        const isCreate = tab.key === 'create'

        return (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.82 }}
            onClick={() => router.push(tab.path)}
            className="flex flex-col items-center justify-center gap-0.5 h-full relative"
            style={{ minWidth: '44px', WebkitTapHighlightColor: 'transparent' }}
          >
            {isCreate ? (
              <motion.div
                className="w-12 h-12 rounded-2xl toon-gradient-bg flex items-center justify-center shadow-lg -mt-3"
                style={{ boxShadow: '0 4px 20px rgba(255,107,0,0.35)' }}
                whileHover={{ scale: 1.05 }}
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </motion.div>
            ) : (
              <>
                <div style={{ color: isActive ? 'var(--toon-orange)' : 'var(--c-muted)' }} className="relative">
                  <span dangerouslySetInnerHTML={{ __html: isActive ? ICONS[tab.key].active : ICONS[tab.key].inactive }} />
                  {isActive && (
                    <motion.div layoutId="nav-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full toon-gradient-bg" />
                  )}
                </div>
                <span className="text-[10px] font-medium transition-colors"
                  style={{ color: isActive ? 'var(--toon-orange)' : 'var(--c-muted)' }}>
                  {tx[tab.key]}
                </span>
              </>
            )}
          </motion.button>
        )
      })}
    </nav>
  )
}
