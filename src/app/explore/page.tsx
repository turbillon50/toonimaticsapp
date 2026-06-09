'use client'
import { motion } from 'framer-motion'
import { StaggerContainer, StaggerItem, HoverCard, FadeIn } from '@/components/ui/motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useState } from 'react'

const CONTENT_TYPES = ['Todo', 'Cortometrajes', 'Series', 'Películas', 'Música', 'Fotografía', 'Documentales']
const ARTISTIC_ROLES = ['Todos los roles', 'Directores', 'Actores', 'Músicos', 'Fotógrafos', 'Editores', 'Productores']

export default function ExplorePage() {
  const [mode, setMode] = useState<'public'|'user'|'admin'>('public')
  return (
    <>
      <Navbar demoMode={mode} setDemoMode={setMode} />
      <main className="min-h-screen pt-20 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="py-12">
              <h1 className="text-5xl font-black toon-gradient-text mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>Explorar</h1>
              <p className="text-gray-400">Descubre artistas y obras de toda Latinoamérica</p>
            </div>
          </FadeIn>

          {/* Search */}
          <FadeIn delay={0.1}>
            <div className="relative mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              <input
                type="text"
                placeholder="Buscar artistas, obras, géneros..."
                className="w-full bg-[#111] border border-[#2E2E2E] text-white rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-[#FF6B00] transition-colors"
              />
            </div>
          </FadeIn>

          {/* Filters */}
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap gap-2 mb-8">
              {CONTENT_TYPES.map((f, i) => (
                <motion.button key={f} whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${i === 0 ? 'toon-gradient-bg text-white' : 'bg-[#1E1E1E] text-gray-400 hover:text-white'}`}
                >
                  {f}
                </motion.button>
              ))}
            </div>
          </FadeIn>

          {/* Grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <StaggerItem key={i}>
                <HoverCard>
                  <div className="toon-card overflow-hidden cursor-pointer">
                    <div className={`h-52 flex items-center justify-center text-6xl`}
                      style={{ background: `linear-gradient(135deg, ${['rgba(255,107,0,0.2)','rgba(255,20,147,0.2)','rgba(139,0,255,0.2)'][i%3]}, rgba(10,10,10,0.8))` }}>
                      {['🎬','📸','🎵','🎭','✂️','🎯','🎬','📸','🎵'][i]}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm">Obra {i + 1}</h3>
                      <p className="text-gray-500 text-xs mt-1">Artista Demo · {Math.floor(Math.random()*50)}K vistas</p>
                    </div>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </main>
      <Footer />
    </>
  )
}
