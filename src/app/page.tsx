'use client'
import { useState } from 'react'
import Splash from '@/components/layout/Splash'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import ArtistsCarousel from '@/components/sections/ArtistsCarousel'
import ContentFeed from '@/components/sections/ContentFeed'
import StatsSection from '@/components/sections/StatsSection'
import { motion } from 'framer-motion'

type DemoMode = 'public' | 'user' | 'admin'

export default function Home() {
  const [demoMode, setDemoMode] = useState<DemoMode>('public')

  return (
    <>
      <Splash />
      <Navbar demoMode={demoMode} setDemoMode={setDemoMode} />
      
      {demoMode === 'admin' ? (
        <AdminPreview />
      ) : demoMode === 'user' ? (
        <UserDashboardPreview />
      ) : (
        <main>
          <Hero />
          <StatsSection />
          <ArtistsCarousel />
          <ContentFeed />
          <CTASection />
        </main>
      )}
      
      <Footer />
    </>
  )
}

function CTASection() {
  return (
    <section className="py-32 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs text-[#8B00FF] font-semibold uppercase tracking-widest mb-4">¿Listo para empezar?</p>
          <h2 className="text-5xl md:text-6xl font-black mb-6 toon-gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
            Tu arte merece ser visto.
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Únete a miles de artistas que ya comparten, colaboran y monetizan su trabajo en Toonimatics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/auth/signin"
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(255,107,0,0.3)' }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-full text-white font-bold text-lg toon-gradient-bg shadow-xl"
            >
              Crear cuenta gratis
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function UserDashboardPreview() {
  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Profile header */}
          <div className="toon-card p-6 mb-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full toon-gradient-bg flex items-center justify-center text-3xl font-black text-white">S</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">Sofía Reyes</h1>
                <span className="text-[#FF6B00] text-sm">✓ Verificada</span>
              </div>
              <p className="text-gray-400 text-sm">🎬 Directora · 📍 Guadalajara</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>2,847 seguidores</span>
                <span>23 obras</span>
                <span>$12,400 ganados</span>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} className="px-5 py-2 rounded-full toon-gradient-bg text-white text-sm font-semibold">
              + Subir obra
            </motion.button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Visualizaciones', value: '45.2K', icon: '👁', color: '#FF6B00' },
              { label: 'Seguidores nuevos', value: '+234', icon: '👥', color: '#FF1493' },
              { label: 'Ventas mes', value: '$2,800', icon: '💰', color: '#8B00FF' },
              { label: 'Colaboraciones', value: '7', icon: '🤝', color: '#FF6B00' },
            ].map(stat => (
              <div key={stat.label} className="toon-card p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Content grid */}
          <h2 className="text-lg font-bold text-white mb-4">Mis obras</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Sombras del Pacífico', 'Reel 2024', 'Making-of Serie'].map((title, i) => (
              <div key={title} className="toon-card overflow-hidden">
                <div className="h-36 bg-gradient-to-br from-orange-900/40 to-purple-900/40 flex items-center justify-center text-4xl">🎬</div>
                <div className="p-4">
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-gray-500 text-xs mt-1">{['45.2K', '23.1K', '8.7K'][i]} vistas · {['3.4K', '1.9K', '654'][i]} likes</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function AdminPreview() {
  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 rounded-full bg-red-500" />
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Panel Administración</h1>
            <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">ADMIN</span>
          </div>

          {/* Admin stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Usuarios totales', value: '12,847', icon: '👥', trend: '+234 hoy' },
              { label: 'Verificaciones pendientes', value: '47', icon: '📋', trend: 'Requieren revisión' },
              { label: 'Contenido activo', value: '48,230', icon: '🎬', trend: '+127 hoy' },
              { label: 'Revenue mes', value: '$84,200', icon: '💰', trend: '+12% vs anterior' },
            ].map(stat => (
              <div key={stat.label} className="toon-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-xs text-gray-500">{stat.trend}</span>
                </div>
                <div className="text-2xl font-black toon-gradient-text">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Verifications queue */}
          <div className="toon-card p-6 mb-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Cola de verificaciones (47 pendientes)
            </h2>
            <div className="space-y-3">
              {['Carlos Mendez — Actor — INE adjunto', 'María García — Directora — CV + Credencial', 'Juan Pérez — Músico — Constancia IMSS'].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {item[0]}
                    </div>
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.95 }} className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20">
                      ✓ Aprobar
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
                      ✗ Rechazar
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation to full admin */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Gestión de usuarios', icon: '👥', href: '/admin/users' },
              { label: 'Moderación contenido', icon: '🛡', href: '/admin/content' },
              { label: 'Reportes financieros', icon: '📊', href: '/admin/finance' },
              { label: 'Configuración', icon: '⚙️', href: '/admin/settings' },
            ].map(item => (
              <motion.a key={item.label} href={item.href} whileHover={{ scale: 1.02, y: -2 }} className="toon-card p-4 text-center cursor-pointer">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-xs text-gray-400">{item.label}</div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
