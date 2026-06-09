'use client'
import { motion } from 'framer-motion'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context'
import Link from 'next/link'

const METRICS = [
  { label: 'Usuarios', value: '12,847', change: '+234', icon: '👥', positive: true },
  { label: 'Verificaciones', value: '47', change: 'pendientes', icon: '📋', positive: false },
  { label: 'Contenido', value: '48.2K', change: '+127 hoy', icon: '🎬', positive: true },
  { label: 'Revenue', value: '$84K', change: '+12%', icon: '💰', positive: true },
]

const PENDING = [
  { name: 'Carlos Mendez', role: 'Actor', docs: 'INE adjunto', time: '2h' },
  { name: 'María García', role: 'Directora', docs: 'CV + IMCINE', time: '4h' },
  { name: 'Juan Pérez', role: 'Músico', docs: 'Constancia SACM', time: '6h' },
]

const MENU = [
  { label: 'Usuarios', icon: '👥', href: '/admin/users' },
  { label: 'Contenido', icon: '🎬', href: '/admin/content' },
  { label: 'Finanzas', icon: '💰', href: '/admin/finance' },
  { label: 'Config', icon: '⚙️', href: '/admin/settings' },
]

export default function AdminPage() {
  const { lang, demoMode } = useApp()

  if (demoMode !== 'admin') {
    return (
      <div className="app-shell">
        <TopBar title="Admin" />
        <main className="page-content flex flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-black text-xl mb-2" style={{ color: 'var(--c-text)' }}>Acceso restringido</h2>
          <p className="text-sm" style={{ color: 'var(--c-muted)' }}>Activa el modo ⚡ Admin en la barra superior para ver este panel.</p>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <TopBar title="Panel Admin" />
      <main className="page-content px-4 py-3">
        {/* Alerta admin */}
        <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs text-red-400 font-semibold">Panel de administración activo</span>
        </div>

        {/* Métricas 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {METRICS.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.05*i }}
              className="toon-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{m.icon}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m.positive ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                  {m.change}
                </span>
              </div>
              <div className="text-xl font-black toon-gradient-text">{m.value}</div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>{m.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Menú acceso rápido */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {MENU.map(item => (
            <Link key={item.label} href={item.href}>
              <motion.div whileTap={{ scale: 0.95 }}
                className="toon-card p-3 flex flex-col items-center gap-1 cursor-pointer">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[10px] text-center" style={{ color: 'var(--c-muted)' }}>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Cola verificaciones */}
        <h2 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Verificaciones pendientes (47)
        </h2>
        <div className="space-y-2">
          {PENDING.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.05*i }}
              className="toon-card flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-xl toon-gradient-bg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs" style={{ color: 'var(--c-text)' }}>{p.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{p.role} · {p.docs}</p>
              </div>
              <div className="flex gap-1.5">
                <motion.button whileTap={{ scale:0.9 }} className="w-8 h-8 rounded-lg text-sm bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">✓</motion.button>
                <motion.button whileTap={{ scale:0.9 }} className="w-8 h-8 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">✗</motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actividad reciente */}
        <h2 className="font-bold text-sm mt-4 mb-2" style={{ color: 'var(--c-text)' }}>Actividad reciente</h2>
        <div className="toon-card divide-y" style={{ '--tw-divide-color': 'var(--c-border)' } as React.CSSProperties}>
          {[
            { e: 'Nueva cuenta', d: 'Ana Torres — Actriz', t: '5m', i: '👤' },
            { e: 'Contenido reportado', d: 'Serie Fantasy', t: '12m', i: '🚩' },
            { e: 'Venta realizada', d: '$450 · comisión $45', t: '28m', i: '💰' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <span className="text-lg">{item.i}</span>
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: 'var(--c-text)' }}>{item.e}</p>
                <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{item.d}</p>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>hace {item.t}</span>
            </div>
          ))}
        </div>
        <div className="h-4" />
      </main>
      <BottomNav />
    </div>
  )
}
