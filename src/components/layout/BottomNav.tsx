'use client'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { usePathname, useRouter } from 'next/navigation'

const TABS = [
  { key: 'home', path: '/', icon: HomeIcon, activeIcon: HomeIconFilled },
  { key: 'explore', path: '/explore', icon: ExploreIcon, activeIcon: ExploreIconFilled },
  { key: 'create', path: '/create', icon: CreateIcon, activeIcon: CreateIcon },
  { key: 'messages', path: '/messages', icon: MsgIcon, activeIcon: MsgIconFilled },
  { key: 'profile', path: '/profile', icon: UserIcon, activeIcon: UserIconFilled },
] as const

export default function BottomNav() {
  const { lang, demoMode } = useApp()
  const tx = t(lang).nav
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="bottom-nav flex items-center justify-around px-2">
      {TABS.map(tab => {
        const isActive = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path))
        const isCreate = tab.key === 'create'

        return (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.85 }}
            onClick={() => router.push(tab.path)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] h-full relative ${
              isCreate ? 'relative -top-3' : ''
            }`}
          >
            {isCreate ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-2xl toon-gradient-bg flex items-center justify-center shadow-lg shadow-orange-500/30"
                style={{ rotate: isActive ? '45deg' : '0deg' }}
              >
                <CreateIcon active={false} />
              </motion.div>
            ) : (
              <>
                <div className={`relative transition-colors duration-200 ${isActive ? 'text-[#FF6B00]' : 'text-[var(--c-muted)]'}`}>
                  {isActive ? <tab.activeIcon active={true} /> : <tab.icon active={false} />}
                  {/* Active dot */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full toon-gradient-bg"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-[#FF6B00]' : 'text-[var(--c-muted)]'}`}>
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

// SVG Icons
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
    </svg>
  )
}
function HomeIconFilled({ active }: { active: boolean }) { return <HomeIcon active={true} /> }

function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path d="M21 21l-2-2" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
    </svg>
  )
}
function ExploreIconFilled({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth={2} fill="currentColor" fillOpacity={0.2} />
      <path d="M21 21l-2-2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function CreateIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" stroke="white" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  )
}

function MsgIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} strokeLinejoin="round" />
    </svg>
  )
}
function MsgIconFilled({ active }: { active: boolean }) { return <MsgIcon active={true} /> }

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? 2 : 1.5} fill={active ? 'currentColor' : 'none'} fillOpacity={0.15} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
    </svg>
  )
}
function UserIconFilled({ active }: { active: boolean }) { return <UserIcon active={true} /> }
