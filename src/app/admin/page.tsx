'use client'
import { motion } from 'framer-motion'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import Link from 'next/link'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '📊', href: '/admin', active: true },
  { label: 'Usuarios', icon: '👥', href: '/admin/users' },
  { label: 'Contenido', icon: '🎬', href: '/admin/content' },
  { label: 'Verificaciones', icon: '📋', href: '/admin/verifications' },
  { label: 'Tienda', icon: '🛍', href: '/admin/store' },
  { label: 'Finanzas', icon: '💰', href: '/admin/finance' },
  { label: 'Mensajes', icon: '💬', href: '/admin/messages' },
  { label: 'Configuración', icon: '⚙️', href: '/admin/settings' },
]

const METRICS = [
  { label: 'Usuarios totales', value: '12,847', change: '+234', positive: true, icon: '👥' },
  { label: 'Artistas verificados', value: '8,234', change: '+47', positive: true, icon: '✓' },
  { label: 'Contenido publicado', value: '48,230', change: '+127', positive: true, icon: '🎬' },
  { label: 'Ventas del mes', value: '$84,200', change: '+12%', positive: true, icon: '💰' },
  { label: 'Verificaciones pendientes', value: '47', change: '-8', positive: false, icon: '⏳' },
  { label: 'Reportes activos', value: '12', change: '+3', positive: false, icon: '🚩' },
]

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen flex" style={{ background: '#080808' }}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-64 min-h-screen border-r border-[#1E1E1E] bg-[#0A0A0A] flex flex-col fixed left-0 top-0 z-40"
      >
        <div className="p-5 border-b border-[#1E1E1E]">
          <span className="text-lg font-black toon-gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>TOONIMATICS</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-400 text-xs font-semibold">Panel Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  item.active
                    ? 'toon-gradient-bg text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1E1E1E]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-xs font-bold">A</div>
            <div>
              <p className="text-white text-xs font-semibold">Admin</p>
              <p className="text-gray-500 text-xs">admin@toonimatics.com</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenido de vuelta. Aquí tienes el resumen de hoy.</p>
        </div>

        {/* Metrics grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {METRICS.map(metric => (
            <StaggerItem key={metric.label}>
              <div className="toon-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{metric.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    metric.positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>{metric.change}</span>
                </div>
                <div className="text-2xl font-black toon-gradient-text">{metric.value}</div>
                <p className="text-gray-500 text-xs mt-1">{metric.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Verification queue */}
        <div className="toon-card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Verificaciones pendientes
            </h2>
            <Link href="/admin/verifications">
              <span className="text-xs text-gray-500 hover:text-white cursor-pointer">Ver todas →</span>
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Carlos Mendez', role: 'Actor', docs: 'INE + CV', time: '2h' },
              { name: 'María García', role: 'Directora', docs: 'CV + Credencial IMCINE', time: '4h' },
              { name: 'Juan Pérez', role: 'Músico', docs: 'Constancia SACM', time: '6h' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#151515] rounded-xl hover:bg-[#1A1A1A] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full toon-gradient-bg flex items-center justify-center text-white text-sm font-bold">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.role} · {item.docs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-xs">hace {item.time}</span>
                  <motion.button whileTap={{ scale: 0.95 }} className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all">✓</motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">✗</motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="toon-card p-6">
          <h2 className="text-white font-bold mb-5">Actividad reciente</h2>
          <div className="space-y-3">
            {[
              { event: 'Nueva cuenta registrada', detail: 'Ana Torres — Actriz', time: '5 min', icon: '👤' },
              { event: 'Contenido reportado', detail: '"Serie Fantasy" — revisión pendiente', time: '12 min', icon: '🚩' },
              { event: 'Venta realizada', detail: '$450 — comisión $45', time: '28 min', icon: '💰' },
              { event: 'Artista verificado', detail: 'Rodrigo Sanz — Productor', time: '1h', icon: '✓' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-[#1A1A1A] last:border-0">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">{item.event}</p>
                  <p className="text-gray-600 text-xs">{item.detail}</p>
                </div>
                <span className="text-gray-600 text-xs">hace {item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
