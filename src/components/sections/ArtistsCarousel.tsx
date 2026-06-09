'use client'
import { motion } from 'framer-motion'
import { FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard } from '../ui/motion'

const ARTISTS = [
  { name: 'Sofía Reyes', role: 'Directora', location: 'Guadalajara', works: 23, followers: '2.8K', verified: true, color: '#FF6B00' },
  { name: 'Marco Luna', role: 'Compositor', location: 'CDMX', works: 41, followers: '5.2K', verified: true, color: '#FF1493' },
  { name: 'Ana Flores', role: 'Fotógrafa', location: 'Monterrey', works: 156, followers: '1.2K', verified: false, color: '#8B00FF' },
  { name: 'Luis Vargas', role: 'Actor', location: 'Guadalajara', works: 18, followers: '8.9K', verified: true, color: '#FF6B00' },
  { name: 'Valentina Cruz', role: 'Editora', location: 'Tijuana', works: 67, followers: '3.4K', verified: true, color: '#FF1493' },
  { name: 'Rodrigo Sanz', role: 'Productor', location: 'CDMX', works: 34, followers: '11K', verified: true, color: '#8B00FF' },
]

const ROLE_EMOJIS: Record<string, string> = {
  'Directora': '🎬', 'Director': '🎬',
  'Compositor': '🎵', 'Músico': '🎵',
  'Fotógrafa': '📸', 'Fotógrafo': '📸',
  'Actor': '🎭', 'Actriz': '🎭',
  'Editora': '✂️', 'Editor': '✂️',
  'Productor': '🎯', 'Productora': '🎯',
}

export default function ArtistsCarousel() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <FadeInOnScroll>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs text-[#FF6B00] font-semibold uppercase tracking-widest mb-2">Talento verificado</p>
              <h2 className="text-4xl md:text-5xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
                Artistas <span className="toon-gradient-text">destacados</span>
              </h2>
            </div>
            <motion.a
              href="/artists"
              whileHover={{ x: 4 }}
              className="hidden md:block text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              Ver todos →
            </motion.a>
          </div>
        </FadeInOnScroll>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARTISTS.map((artist) => (
            <StaggerItem key={artist.name}>
              <HoverCard>
                <div className="toon-card p-5 cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar placeholder */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white relative"
                        style={{ background: `linear-gradient(135deg, ${artist.color}, #8B00FF)` }}
                      >
                        {artist.name[0]}
                        {artist.verified && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#111] flex items-center justify-center text-[10px]">✓</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-semibold text-sm">{artist.name}</span>
                          {artist.verified && <span className="text-[#FF6B00] text-xs">✓</span>}
                        </div>
                        <span className="text-gray-500 text-xs">{ROLE_EMOJIS[artist.role]} {artist.role}</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-[#2E2E2E] text-gray-400 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all"
                    >
                      Seguir
                    </motion.button>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>📍 {artist.location}</span>
                    <span>🎨 {artist.works} obras</span>
                    <span>👥 {artist.followers}</span>
                  </div>

                  {/* Hover accent line */}
                  <div className="mt-4 h-0.5 rounded-full bg-[#1E1E1E] overflow-hidden">
                    <motion.div
                      className="h-full toon-gradient-bg"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
