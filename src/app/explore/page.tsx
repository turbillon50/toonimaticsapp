'use client'
import { motion } from 'framer-motion'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const FILTERS_ES = ['Todo','Cortos','Series','Películas','Música','Foto']
const FILTERS_EN = ['All','Short films','Series','Films','Music','Photo']

const DEMO_ARTISTS = [
  { id:'1', name:'Sofía Reyes', artistic_role:'Directora', avatar_url:'/hf/artist.webp', verified:true, followers_count:2847 },
  { id:'2', name:'Marco Luna', artistic_role:'Músico', avatar_url:'/hf/cinematic.webp', verified:true, followers_count:5210 },
  { id:'3', name:'Ana Flores', artistic_role:'Fotógrafa', avatar_url:'/hf/collab.webp', verified:false, followers_count:1203 },
  { id:'4', name:'Luis Vargas', artistic_role:'Actor', avatar_url:'/hf/portfolio.webp', verified:true, followers_count:8934 },
  { id:'5', name:'Valentina Cruz', artistic_role:'Editora', avatar_url:'/hf/community.webp', verified:true, followers_count:3400 },
  { id:'6', name:'Rodrigo Sanz', artistic_role:'Productor', avatar_url:'/hf/studio.webp', verified:true, followers_count:11200 },
]
const DEMO_CONTENT = [
  { id:'1', title:'Sombras del Pacífico', type:'Cortometraje', views_count:45230, thumbnail_url:'/hf/hero1.webp', author:'Sofía Reyes' },
  { id:'2', title:'Ecos del Norte', type:'Documental', views_count:128400, thumbnail_url:'/hf/community.webp', author:'Marco Luna' },
  { id:'3', title:'La Ciudad que Duerme', type:'Película', views_count:67800, thumbnail_url:'/hf/studio.webp', author:'Ana Flores' },
  { id:'4', title:'Reel Dirección 2024', type:'Reel', views_count:23100, thumbnail_url:'/hf/portfolio.webp', author:'Luis Vargas' },
  { id:'5', title:'Portfolio Sets 2024', type:'Fotografía', views_count:12300, thumbnail_url:'/hf/collab.webp', author:'Valentina Cruz' },
  { id:'6', title:'Score Cortometraje', type:'Música', views_count:8700, thumbnail_url:'/hf/artist.webp', author:'Rodrigo Sanz' },
]

const fmt = (n: number) => n >= 1000 ? (n/1000).toFixed(1).replace('.0','')+'K' : String(n)

export default function ExplorePage() {
  const { lang } = useApp()
  const tx = t(lang)
  const [tab, setTab] = useState<'content'|'artists'>('content')
  const [filter, setFilter] = useState(0)
  const [search, setSearch] = useState('')
  const [artists, setArtists] = useState(DEMO_ARTISTS)
  const [content, setContent] = useState(DEMO_CONTENT)
  const FILTERS = lang === 'es' ? FILTERS_ES : FILTERS_EN

  useEffect(() => {
    fetch('/api/artists').then(r=>r.json()).then(d=>{ if(d.artists?.length) setArtists(d.artists) }).catch(()=>{})
    fetch('/api/content').then(r=>r.json()).then(d=>{ if(d.content?.length) setContent(d.content) }).catch(()=>{})
  }, [])

  const filteredA = artists.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()))
  const filteredC = content.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()))

  const btnStyle = (active: boolean) => ({
    background: active ? undefined : 'var(--c-surface2)' as string,
    color: active ? 'white' : ('var(--c-muted)' as string),
  })

  return (
    <div className="app-shell">
      <TopBar title={tx.nav.explore} />
      <main className="page-content">
        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--c-muted)' }}>🔍</span>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={lang==='es'?'Buscar artistas, obras...':'Search artists, works...'}
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm border focus:outline-none focus:border-[#FF6B00] transition-colors"
              style={{ background:'var(--c-surface2)', borderColor:'var(--c-border)', color:'var(--c-text)' }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-3 gap-2 pb-3">
          {(['content','artists'] as const).map(tb => (
            <motion.button key={tb} whileTap={{ scale:0.97 }} onClick={()=>setTab(tb)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${tb===tab?'toon-gradient-bg text-white':''}`}
              style={btnStyle(tb===tab)}>
              {tb==='content'?(lang==='es'?'Contenido':'Content'):(lang==='es'?'Artistas':'Artists')}
            </motion.button>
          ))}
        </div>

        {tab==='content' ? <>
          {/* Filter pills */}
          <div className="flex gap-2 px-3 overflow-x-auto no-scrollbar pb-3">
            {FILTERS.map((f,i) => (
              <motion.button key={f} whileTap={{ scale:0.95 }} onClick={()=>setFilter(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${i===filter?'toon-gradient-bg text-white':''}`}
                style={btnStyle(i===filter)}>
                {f}
              </motion.button>
            ))}
          </div>
          {/* Grid 2 col */}
          <div className="grid grid-cols-2 gap-2.5 px-3">
            {filteredC.map((item:any,i:number) => (
              <motion.div key={item.id} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.04*i }}
                className="rounded-2xl overflow-hidden border cursor-pointer" style={{ background:'var(--c-surface)', borderColor:'var(--c-border)' }}
                whileTap={{ scale:0.97 }}>
                <div className="relative" style={{ height:'108px' }}>
                  <Image src={item.thumbnail_url||'/hf/hero1.webp'} alt={item.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-1.5 right-1.5 bg-black/70 rounded text-white text-[9px] px-1.5 py-0.5">👁 {fmt(item.views_count)}</div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold leading-tight" style={{ color:'var(--c-text)' }}>{item.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color:'var(--c-muted)' }}>{item.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </> : (
          <div className="px-3 space-y-2">
            {filteredA.map((a:any,i:number) => (
              <motion.div key={a.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.04*i }}
                className="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer"
                style={{ background:'var(--c-surface)', borderColor:'var(--c-border)' }}
                whileTap={{ scale:0.98 }}>
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={a.avatar_url||'/hf/artist.webp'} alt={a.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm" style={{ color:'var(--c-text)' }}>{a.name}</span>
                    {a.verified && <span style={{ color:'var(--toon-orange)' }} className="text-xs">✓</span>}
                  </div>
                  <p className="text-xs" style={{ color:'var(--c-muted)' }}>{a.artistic_role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold" style={{ color:'var(--c-text)' }}>{fmt(a.followers_count)}</p>
                  <p className="text-[10px]" style={{ color:'var(--c-muted)' }}>{lang==='es'?'seguidores':'followers'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="h-3" />
      </main>
      <BottomNav />
    </div>
  )
}
