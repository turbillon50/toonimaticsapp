'use client'
import { motion } from 'framer-motion'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import Image from 'next/image'

const HF_IMGS = [
  { src: '/hf/hero1.webp', label: 'Hero' },
  { src: '/hf/community.webp', label: 'Comunidad' },
  { src: '/hf/portfolio.webp', label: 'Portafolio' },
  { src: '/hf/artist.webp', label: 'Artista' },
  { src: '/hf/studio.webp', label: 'Estudio' },
  { src: '/hf/collab.webp', label: 'Colaboración' },
]

const FEATURED = [
  { title: 'Sombras del Pacífico', author: 'Sofía Reyes', type: 'Cortometraje', views: '45.2K', img: '/hf/hero1.webp', duration: '18 min' },
  { title: 'Ecos del Norte', author: 'Marco Luna', type: 'Documental', views: '128K', img: '/hf/community.webp', duration: '6 ep', featured: true },
  { title: 'La Ciudad que Duerme', author: 'Ana Flores', type: 'Película', views: '67.8K', img: '/hf/studio.webp', duration: '90 min' },
]

const ARTISTS = [
  { name: 'Sofía R.', role: 'Directora', img: '/hf/artist.webp', verified: true },
  { name: 'Marco L.', role: 'Músico', img: '/hf/cinematic.webp', verified: true },
  { name: 'Ana F.', role: 'Fotógrafa', img: '/hf/collab.webp', verified: false },
  { name: 'Luis V.', role: 'Actor', img: '/hf/portfolio.webp', verified: true },
  { name: 'Valentina C.', role: 'Editora', img: '/hf/community.webp', verified: true },
]

export default function Home() {
  const { lang, demoMode } = useApp()
  const tx = t(lang)

  return (
    <div className="app-shell">
      <TopBar showLogo />

      <main className="page-content">
        {/* Hero card — compact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mx-4 mt-3 rounded-2xl overflow-hidden"
          style={{ height: '200px' }}
        >
          <Image src="/hf/hero1.webp" alt="Hero" fill className="object-cover" priority />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.3) 60%, transparent 100%)'
          }} />
          {/* Hero video badge */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            LIVE
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs text-[#FF6B00] font-semibold uppercase tracking-widest mb-1">
              Plataforma artística
            </p>
            <h2 className="text-white text-xl font-black leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              {tx.home.tagline}
            </h2>
          </div>
        </motion.div>

        {/* Quick stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3 px-4 mt-3 overflow-x-auto pb-1 no-scrollbar"
        >
          {[
            { n: '12K+', l: lang === 'es' ? 'Artistas' : 'Artists', icon: '🎨' },
            { n: '48K+', l: lang === 'es' ? 'Obras' : 'Works', icon: '🎬' },
            { n: '3.2K+', l: lang === 'es' ? 'Colabs' : 'Collabs', icon: '🤝' },
          ].map(s => (
            <div key={s.l} className="flex-shrink-0 toon-card px-4 py-2.5 flex items-center gap-2">
              <span>{s.icon}</span>
              <div>
                <div className="text-base font-black toon-gradient-text">{s.n}</div>
                <div className="text-xs" style={{ color: 'var(--c-muted)' }}>{s.l}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Featured content */}
        <Section title={tx.home.featured} href="/explore">
          <div className="flex gap-3 px-4 overflow-x-auto pb-1 no-scrollbar">
            {FEATURED.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="content-card flex-shrink-0 cursor-pointer"
                style={{ width: '200px' }}
              >
                <div className="relative" style={{ height: '130px' }}>
                  <Image src={item.img} alt={item.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  {item.featured && (
                    <div className="absolute top-2 left-2 toon-gradient-bg rounded-full px-2 py-0.5 text-white text-[10px] font-bold">⭐ Top</div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 rounded text-white text-[10px] px-1.5 py-0.5">{item.duration}</div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--c-text)' }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>{item.author}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: 'var(--c-muted)' }}>
                    <span>👁 {item.views}</span>
                    <span className="px-1.5 py-0.5 rounded-full" style={{ background: 'var(--c-surface2)', fontSize: '10px' }}>{item.type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Artists horizontal scroll */}
        <Section title={tx.home.artists} href="/artists">
          <div className="flex gap-3 px-4 overflow-x-auto pb-1 no-scrollbar">
            {ARTISTS.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 * i }}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer"
                style={{ width: '72px' }}
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden">
                  <Image src={a.img} alt={a.name} fill className="object-cover" />
                  {a.verified && (
                    <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full toon-gradient-bg flex items-center justify-center text-white text-[9px] font-bold">✓</div>
                  )}
                </div>
                <p className="text-center text-xs font-medium leading-tight" style={{ color: 'var(--c-text)' }}>{a.name}</p>
                <p className="text-center text-[10px]" style={{ color: 'var(--c-muted)' }}>{a.role}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Recent works vertical feed */}
        <Section title={tx.home.latest}>
          <div className="px-4 space-y-3">
            {FEATURED.map((item, i) => (
              <motion.div
                key={item.title + '-feed'}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="content-card flex gap-3 p-3 cursor-pointer"
              >
                <div className="relative flex-shrink-0 rounded-xl overflow-hidden" style={{ width: '80px', height: '80px' }}>
                  <Image src={item.img} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--c-text)' }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>{item.author}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--c-muted)' }}>
                    <span>👁 {item.views}</span>
                    <span>⏱ {item.duration}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-8 h-8 rounded-full toon-gradient-bg flex items-center justify-center text-white text-sm">▶</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* CTA si es público */}
        {demoMode === 'public' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-4 my-4 p-5 rounded-2xl text-center neon-border"
          >
            <p className="text-base font-black toon-gradient-text mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              {lang === 'es' ? 'Tu arte merece ser visto.' : 'Your art deserves to be seen.'}
            </p>
            <p className="text-xs mb-3" style={{ color: 'var(--c-muted)' }}>{tx.home.sub}</p>
            <motion.a
              href="/auth/signin"
              whileTap={{ scale: 0.97 }}
              className="block w-full py-3 rounded-xl toon-gradient-bg text-white font-bold text-sm"
            >
              {tx.home.cta} ✨
            </motion.a>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-bold text-base" style={{ color: 'var(--c-text)' }}>{title}</h2>
        {href && (
          <a href={href} className="text-xs font-medium" style={{ color: 'var(--toon-orange)' }}>
            Ver todos →
          </a>
        )}
      </div>
      {children}
    </div>
  )
}
