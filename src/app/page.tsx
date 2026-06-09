'use client'
import { motion } from 'framer-motion'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import Image from 'next/image'
import { useEffect, useState } from 'react'

// Video hero Higgsfield
const VIDEO_HERO = 'https://d8j0ntlcm91z4.cloudfront.net/user_3DDb66hXpSaWG4DmoX3Ae5V2dqt/hf_20260609_182835_99172169-bc31-420d-b604-9c9b218ab164.mp4'

const DEMO_CONTENT = [
  { id:'1', title:'Sombras del Pacífico', author:'Sofía Reyes', type:'Cortometraje', views_count:45230, thumbnail_url:'/hf/hero1.webp', duration:'18 min', is_featured:true },
  { id:'2', title:'Ecos del Norte', author:'Marco Luna', type:'Serie documental', views_count:128400, thumbnail_url:'/hf/community.webp', duration:'6 ep', is_featured:true },
  { id:'3', title:'La Ciudad que Duerme', author:'Ana Flores', type:'Película', views_count:67800, thumbnail_url:'/hf/studio.webp', duration:'90 min', is_featured:false },
]

const DEMO_ARTISTS = [
  { id:'1', name:'Sofía R.', artistic_role:'Directora', avatar_url:'/hf/artist.webp', verified:true, followers_count:2847 },
  { id:'2', name:'Marco L.', artistic_role:'Músico', avatar_url:'/hf/cinematic.webp', verified:true, followers_count:5210 },
  { id:'3', name:'Ana F.', artistic_role:'Fotógrafa', avatar_url:'/hf/collab.webp', verified:false, followers_count:1203 },
  { id:'4', name:'Luis V.', artistic_role:'Actor', avatar_url:'/hf/portfolio.webp', verified:true, followers_count:8934 },
  { id:'5', name:'Valentina C.', artistic_role:'Editora', avatar_url:'/hf/community.webp', verified:true, followers_count:3400 },
]

function fmtNum(n: number) {
  if (n >= 1000) return (n/1000).toFixed(1).replace('.0','') + 'K'
  return String(n)
}

export default function Home() {
  const { lang, demoMode } = useApp()
  const tx = t(lang)
  const [content, setContent] = useState(DEMO_CONTENT)
  const [artists, setArtists] = useState(DEMO_ARTISTS)
  const [videoError, setVideoError] = useState(false)

  // Cargar datos reales de DB
  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(d => {
      if (d.content?.length > 0) {
        setContent(d.content.map((c: any) => ({ ...c, author: c.author || 'Artista', duration: c.duration || '—' })))
      }
    }).catch(() => {})
    fetch('/api/artists').then(r => r.json()).then(d => {
      if (d.artists?.length > 0) setArtists(d.artists)
    }).catch(() => {})
  }, [])

  return (
    <div className="app-shell">
      <TopBar showLogo />
      <main className="page-content">

        {/* VIDEO HERO */}
        <div className="relative mx-3 mt-3 rounded-2xl overflow-hidden" style={{ height: '220px' }}>
          {!videoError ? (
            <video
              src={VIDEO_HERO}
              autoPlay muted loop playsInline
              onError={() => setVideoError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image src="/hf/hero1.webp" alt="Hero" fill className="object-cover" priority />
          )}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.15) 60%, transparent 100%)'
          }} />
          {/* Live badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-white text-[10px] font-semibold">LIVE</span>
          </div>
          {/* Texto hero */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--toon-orange)' }}>
              {lang === 'es' ? 'Plataforma artística' : 'Artistic platform'}
            </p>
            <h1 className="text-white text-2xl font-black leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              {tx.home.tagline}
            </h1>
          </div>
        </div>

        {/* Stats compactos */}
        <div className="flex gap-2.5 px-3 mt-3 overflow-x-auto no-scrollbar">
          {[
            { n: '12K+', l: lang === 'es' ? 'Artistas' : 'Artists', i: '🎨' },
            { n: '48K+', l: lang === 'es' ? 'Obras' : 'Works', i: '🎬' },
            { n: '3.2K+', l: lang === 'es' ? 'Colabs' : 'Collabs', i: '🤝' },
          ].map(s => (
            <motion.div key={s.l} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
              <span className="text-base">{s.i}</span>
              <div>
                <div className="text-sm font-black toon-gradient-text leading-none">{s.n}</div>
                <div className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--c-muted)' }}>{s.l}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Artistas — scroll horizontal */}
        <SectionHeader title={tx.home.artists} href="/explore" lang={lang} />
        <div className="flex gap-3 px-3 overflow-x-auto no-scrollbar pb-1">
          {artists.map((a: any, i: number) => (
            <motion.div key={a.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.06*i }}
              className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer" style={{ width: '68px' }}>
              <div className="relative w-14 h-14 rounded-xl overflow-hidden">
                <Image src={a.avatar_url || '/hf/artist.webp'} alt={a.name} fill className="object-cover" />
                {a.verified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full toon-gradient-bg flex items-center justify-center text-white text-[9px] font-bold border border-[var(--c-bg)]">✓</div>
                )}
              </div>
              <p className="text-[11px] font-medium text-center leading-tight truncate w-full" style={{ color: 'var(--c-text)' }}>{a.name}</p>
              <p className="text-[10px] text-center leading-none" style={{ color: 'var(--c-muted)' }}>{a.artistic_role}</p>
            </motion.div>
          ))}
        </div>

        {/* Contenido destacado — scroll horizontal */}
        <SectionHeader title={tx.home.featured} href="/explore" lang={lang} />
        <div className="flex gap-3 px-3 overflow-x-auto no-scrollbar pb-1">
          {content.filter((c: any) => c.is_featured).map((item: any, i: number) => (
            <motion.div key={item.id} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.08*i }}
              className="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer border" style={{ width: '190px', background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
              <div className="relative" style={{ height: '120px' }}>
                <Image src={item.thumbnail_url || '/hf/hero1.webp'} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded text-white text-[10px] px-1.5 py-0.5">
                  {item.duration || `${fmtNum(item.views_count)} vistas`}
                </div>
                <div className="absolute top-2 left-2 toon-gradient-bg rounded-full px-2 py-0.5 text-white text-[9px] font-bold">⭐ Top</div>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--c-text)' }}>{item.title}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--c-muted)' }}>
                  {item.author} · 👁 {fmtNum(item.views_count)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feed reciente — lista vertical compacta */}
        <SectionHeader title={tx.home.latest} lang={lang} />
        <div className="px-3 space-y-2.5 pb-4">
          {content.map((item: any, i: number) => (
            <motion.div key={item.id + '-feed'} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.07*i }}
              className="flex gap-3 p-3 rounded-2xl cursor-pointer border" style={{ background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
              whileTap={{ scale: 0.98 }}>
              <div className="relative flex-shrink-0 rounded-xl overflow-hidden" style={{ width: '76px', height: '76px' }}>
                <Image src={item.thumbnail_url || '/hf/hero1.webp'} alt={item.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--c-text)' }}>{item.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>{item.author}</p>
                <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--c-muted)' }}>
                  <span>👁 {fmtNum(item.views_count)}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: 'var(--c-surface2)' }}>{item.type}</span>
                </div>
              </div>
              <motion.div whileTap={{ scale:0.9 }} className="w-9 h-9 rounded-full toon-gradient-bg flex items-center justify-center text-white text-sm flex-shrink-0 self-center">▶</motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA público */}
        {demoMode === 'public' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            className="mx-3 mb-4 p-5 rounded-2xl text-center"
            style={{ border: '1px solid transparent', background: `linear-gradient(var(--c-surface), var(--c-surface)) padding-box, linear-gradient(135deg, #FF6B00, #FF1493, #8B00FF) border-box` }}>
            <p className="text-base font-black toon-gradient-text mb-1" style={{ fontFamily:"'Syne',sans-serif" }}>
              {lang==='es' ? 'Tu arte merece ser visto.' : 'Your art deserves to be seen.'}
            </p>
            <p className="text-xs mb-3" style={{ color:'var(--c-muted)' }}>{tx.home.sub}</p>
            <motion.a href="/auth/signin" whileTap={{ scale:0.97 }}
              className="block w-full py-3.5 rounded-xl toon-gradient-bg text-white font-bold text-sm">
              {tx.home.cta} ✨
            </motion.a>
          </motion.div>
        )}

      </main>
      <BottomNav />
    </div>
  )
}

function SectionHeader({ title, href, lang }: { title: string; href?: string; lang: string }) {
  return (
    <div className="flex items-center justify-between px-3 mt-5 mb-3">
      <h2 className="font-bold text-sm" style={{ color:'var(--c-text)' }}>{title}</h2>
      {href && (
        <a href={href} className="text-xs font-medium" style={{ color:'var(--toon-orange)' }}>
          {lang==='es'?'Ver todos':'See all'} →
        </a>
      )}
    </div>
  )
}
