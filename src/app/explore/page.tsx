'use client'
import { motion } from 'framer-motion'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import Image from 'next/image'
import { useState } from 'react'

const FILTERS = ['Todo','Cortometrajes','Series','Películas','Música','Foto']
const ARTISTS = [
  { name: 'Sofía Reyes', role: 'Directora', works: 23, followers: '2.8K', verified: true, img: '/hf/artist.webp' },
  { name: 'Marco Luna', role: 'Músico', works: 41, followers: '5.2K', verified: true, img: '/hf/cinematic.webp' },
  { name: 'Ana Flores', role: 'Fotógrafa', works: 156, followers: '1.2K', verified: false, img: '/hf/collab.webp' },
  { name: 'Luis Vargas', role: 'Actor', works: 18, followers: '8.9K', verified: true, img: '/hf/portfolio.webp' },
  { name: 'Valentina Cruz', role: 'Editora', works: 67, followers: '3.4K', verified: true, img: '/hf/community.webp' },
  { name: 'Rodrigo Sanz', role: 'Productor', works: 34, followers: '11K', verified: true, img: '/hf/studio.webp' },
]
const IMGS = ['/hf/hero1.webp','/hf/community.webp','/hf/portfolio.webp','/hf/artist.webp','/hf/studio.webp','/hf/collab.webp']

export default function ExplorePage() {
  const { lang } = useApp()
  const tx = t(lang)
  const [filter, setFilter] = useState(0)
  const [tab, setTab] = useState<'content'|'artists'>('content')

  return (
    <div className="app-shell">
      <TopBar title={tx.nav.explore} />
      <main className="page-content">
        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--c-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder={lang === 'es' ? 'Buscar artistas, obras...' : 'Search artists, works...'}
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF6B00] transition-colors"
              style={{ background: 'var(--c-surface2)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-2">
          {(['content','artists'] as const).map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab===tb ? 'toon-gradient-bg text-white' : 'text-[var(--c-muted)]'}`}
              style={{ background: tab !== tb ? 'var(--c-surface2)' : undefined }}
            >
              {tb === 'content' ? (lang==='es'?'Contenido':'Content') : (lang==='es'?'Artistas':'Artists')}
            </button>
          ))}
        </div>

        {tab === 'content' ? (
          <>
            {/* Filters */}
            <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pb-2">
              {FILTERS.map((f,i) => (
                <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFilter(i)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter===i ? 'toon-gradient-bg text-white' : 'text-[var(--c-muted)]'}`}
                  style={{ background: filter !== i ? 'var(--c-surface2)' : undefined }}
                >{f}</motion.button>
              ))}
            </div>

            {/* Grid 2 col */}
            <div className="grid grid-cols-2 gap-3 px-4">
              {IMGS.map((img, i) => (
                <motion.div key={i} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.05*i }}
                  className="content-card cursor-pointer">
                  <div className="relative" style={{ height: '110px' }}>
                    <Image src={img} alt="" fill className="object-cover" />
                    <div className="absolute bottom-2 right-2 bg-black/70 rounded text-white text-[10px] px-1.5 py-0.5">
                      {['18min','6 ep','90min','4min','156 fotos','32min'][i]}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold" style={{ color: 'var(--c-text)' }}>
                      {['Sombras del Pacífico','Ecos del Norte','La Ciudad','Reel 2024','Portfolio Sets','Score Film'][i]}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--c-muted)' }}>
                      {['Sofía R.','Marco L.','Ana F.','Luis V.','Valentina C.','Rodrigo S.'][i]}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="px-4 space-y-2.5">
            {ARTISTS.map((a, i) => (
              <motion.div key={a.name} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.05*i }}
                className="toon-card flex items-center gap-3 p-3 cursor-pointer">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={a.img} alt={a.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{a.name}</span>
                    {a.verified && <span className="text-[#FF6B00] text-xs">✓</span>}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>{a.role} · {a.works} obras</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color: 'var(--c-text)' }}>{a.followers}</p>
                  <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{lang==='es'?'seguidores':'followers'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="h-4" />
      </main>
      <BottomNav />
    </div>
  )
}
