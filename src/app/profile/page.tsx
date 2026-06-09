'use client'
import { motion } from 'framer-motion'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import Image from 'next/image'
import Link from 'next/link'

const WORKS = [
  { img: '/hf/hero1.webp', views: '45.2K' },
  { img: '/hf/community.webp', views: '128K' },
  { img: '/hf/portfolio.webp', views: '67.8K' },
  { img: '/hf/artist.webp', views: '23.1K' },
  { img: '/hf/studio.webp', views: '8.7K' },
  { img: '/hf/collab.webp', views: '12.3K' },
]

export default function ProfilePage() {
  const { lang, demoMode } = useApp()
  const tx = t(lang)
  const isUser = demoMode === 'user' || demoMode === 'admin'

  if (!isUser) {
    return (
      <div className="app-shell">
        <TopBar title={tx.nav.profile} />
        <main className="page-content flex flex-col items-center justify-center px-6">
          <div className="text-center">
            <div className="text-5xl mb-4">🎨</div>
            <h2 className="font-black text-xl mb-2 toon-gradient-text">{lang==='es'?'Únete a Toonimatics':'Join Toonimatics'}</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>
              {lang==='es'?'Crea tu perfil y comparte tu arte con el mundo.':'Create your profile and share your art with the world.'}
            </p>
            <Link href="/auth/signin">
              <motion.div whileTap={{ scale: 0.97 }} className="block py-3 px-8 rounded-xl toon-gradient-bg text-white font-bold text-sm text-center">
                {tx.auth.signin}
              </motion.div>
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <TopBar title={tx.nav.profile} />
      <main className="page-content">
        {/* Cover */}
        <div className="relative h-32">
          <Image src="/hf/cinematic.webp" alt="cover" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--c-bg)]" />
        </div>

        {/* Profile info */}
        <div className="px-4 -mt-10 relative z-10">
          <div className="flex items-end justify-between mb-3">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4" style={{ borderColor: 'var(--c-bg)' }}>
              <Image src="/hf/artist.webp" alt="Avatar" fill className="object-cover" />
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full toon-gradient-bg flex items-center justify-center text-white text-[9px] font-bold">✓</div>
            </div>
            <motion.button whileTap={{ scale: 0.96 }} className="px-5 py-2 rounded-xl text-sm font-semibold neon-border" style={{ color: 'var(--c-text)' }}>
              {lang==='es'?'Editar perfil':'Edit profile'}
            </motion.button>
          </div>

          <h1 className="text-xl font-black" style={{ color: 'var(--c-text)', fontFamily: "'Syne', sans-serif" }}>Sofía Reyes</h1>
          <p className="text-sm" style={{ color: 'var(--toon-orange)' }}>🎬 Directora · 📍 Guadalajara</p>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--c-muted)' }}>
            {lang==='es'?'Directora de cortometrajes premiada en Cannes. Especialista en narrativa visual latinoamericana.':'Award-winning short film director at Cannes. Latin American visual narrative specialist.'}
          </p>

          {/* Stats */}
          <div className="flex gap-5 mt-4 py-4 border-y" style={{ borderColor: 'var(--c-border)' }}>
            {[['23', lang==='es'?'obras':'works'], ['2,847', lang==='es'?'seguidores':'followers'], ['134', lang==='es'?'siguiendo':'following']].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="text-lg font-black toon-gradient-text">{n}</div>
                <div className="text-xs" style={{ color: 'var(--c-muted)' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Social links */}
          <div className="flex gap-3 py-3">
            {['📸 Instagram','🎵 TikTok','▶️ YouTube'].map(s => (
              <motion.div key={s} whileTap={{ scale: 0.9 }}
                className="flex-1 text-center text-xs py-2 rounded-xl cursor-pointer" style={{ background: 'var(--c-surface2)', color: 'var(--c-muted)' }}>
                {s.split(' ')[0]}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Works grid */}
        <div className="px-4 mt-2">
          <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--c-text)' }}>{lang==='es'?'Mis obras':'My works'}</h2>
          <div className="grid grid-cols-3 gap-1.5">
            {WORKS.map((w, i) => (
              <motion.div key={i} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: 0.05*i }}
                className="relative rounded-xl overflow-hidden cursor-pointer" style={{ aspectRatio: '1' }}>
                <Image src={w.img} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 hover:opacity-100 font-semibold">👁 {w.views}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="h-4" />
      </main>
      <BottomNav />
    </div>
  )
}
