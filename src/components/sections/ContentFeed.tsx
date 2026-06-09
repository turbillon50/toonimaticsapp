'use client'
import { motion } from 'framer-motion'
import { FadeInOnScroll, StaggerContainer, StaggerItem, HoverCard } from '../ui/motion'
import { useState } from 'react'

const FILTERS = ['Todo', 'Cortometrajes', 'Series', 'Películas', 'Música', 'Fotografía']

const CONTENT = [
  { id: 1, title: 'Sombras del Pacífico', author: 'Sofía Reyes', type: 'Cortometraje', views: '45.2K', likes: '3.4K', duration: '18 min', featured: true, gradient: 'from-orange-900/40 to-purple-900/40' },
  { id: 2, title: 'Ecos del Norte', author: 'Marco Luna', type: 'Serie documental', views: '128K', likes: '9.8K', duration: '6 ep', featured: true, gradient: 'from-pink-900/40 to-orange-900/40' },
  { id: 3, title: 'La Ciudad que Duerme', author: 'Ana Flores', type: 'Película', views: '67.8K', likes: '5.5K', duration: '90 min', featured: false, gradient: 'from-purple-900/40 to-pink-900/40' },
  { id: 4, title: 'Reel Dirección 2024', author: 'Luis Vargas', type: 'Reel', views: '23.1K', likes: '1.9K', duration: '4 min', featured: false, gradient: 'from-orange-900/40 to-red-900/40' },
  { id: 5, title: 'Portfolio Sets 2024', author: 'Valentina Cruz', type: 'Fotografía', views: '12.3K', likes: '987', duration: '156 fotos', featured: false, gradient: 'from-violet-900/40 to-purple-900/40' },
  { id: 6, title: 'Score para Cortometraje', author: 'Rodrigo Sanz', type: 'Música', views: '8.7K', likes: '654', duration: '32 min', featured: false, gradient: 'from-pink-900/40 to-rose-900/40' },
]

export default function ContentFeed() {
  const [activeFilter, setActiveFilter] = useState('Todo')

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <FadeInOnScroll>
          <div className="mb-10">
            <p className="text-xs text-[#FF1493] font-semibold uppercase tracking-widest mb-2">Contenido reciente</p>
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
              Obras <span className="toon-gradient-text">destacadas</span>
            </h2>
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(filter => (
                <motion.button
                  key={filter}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === filter
                      ? 'toon-gradient-bg text-white shadow-lg shadow-orange-500/20'
                      : 'bg-[#1E1E1E] text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
                  }`}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CONTENT.map((item) => (
            <StaggerItem key={item.id}>
              <HoverCard>
                <div className="toon-card overflow-hidden cursor-pointer group">
                  {/* Thumbnail */}
                  <div className={`relative h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center overflow-hidden`}>
                    <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">🎬</div>
                    {item.featured && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold toon-gradient-bg text-white">
                        ⭐ Destacado
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 text-xs text-gray-300">
                      {item.duration}
                    </div>
                    {/* Play button on hover */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30"
                    >
                      <div className="w-14 h-14 rounded-full toon-gradient-bg flex items-center justify-center text-2xl shadow-2xl">
                        ▶
                      </div>
                    </motion.div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold text-sm leading-tight">{item.title}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">por {item.author}</p>
                      </div>
                      <span className="text-xs text-gray-600 bg-[#1E1E1E] px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mt-3">
                      <span>👁 {item.views}</span>
                      <span>❤️ {item.likes}</span>
                      <motion.button whileTap={{ scale: 0.9 }} className="ml-auto text-gray-500 hover:text-[#FF6B00] transition-colors">
                        🔖
                      </motion.button>
                    </div>
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
