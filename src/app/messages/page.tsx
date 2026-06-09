'use client'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { motion } from 'framer-motion'
import Image from 'next/image'

const CHATS = [
  { name: 'Marco Luna', last: 'Me interesa colaborar en el proyecto...', time: '2m', img: '/hf/cinematic.webp', unread: 2 },
  { name: 'Producciones NovaStar', last: 'Revisamos tu reel, quedamos encantados', time: '1h', img: '/hf/studio.webp', unread: 1 },
  { name: 'Ana Flores', last: '¿Cuándo podemos reunirnos?', time: '3h', img: '/hf/collab.webp', unread: 0 },
  { name: 'Luis Vargas', last: 'El guion está listo para revisión', time: '1d', img: '/hf/artist.webp', unread: 0 },
]

export default function MessagesPage() {
  const { lang } = useApp()
  const tx = t(lang)
  return (
    <div className="app-shell">
      <TopBar title={tx.nav.messages} />
      <main className="page-content">
        <div className="px-4 py-3">
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--c-muted)' }}>🔍</span>
            <input type="text" placeholder={lang==='es'?'Buscar conversaciones...':'Search conversations...'}
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm border focus:outline-none"
              style={{ background: 'var(--c-surface2)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }} />
          </div>
          <div className="space-y-1">
            {CHATS.map((c, i) => (
              <motion.div key={c.name} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.05*i }}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                style={{ background: 'var(--c-surface)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={c.img} alt={c.name} fill className="object-cover" />
                  {c.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full toon-gradient-bg flex items-center justify-center text-white text-[9px] font-bold">{c.unread}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{c.name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--c-muted)' }}>{c.last}</p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--c-muted)' }}>{c.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
