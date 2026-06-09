'use client'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context'
import { motion } from 'framer-motion'

const TYPES = [
  { icon: '🎬', label: 'Video / Cortometraje', desc: 'Sube tu obra audiovisual' },
  { icon: '🎵', label: 'Música / Audio', desc: 'Comparte tu composición' },
  { icon: '📸', label: 'Fotografía', desc: 'Muestra tu portafolio visual' },
  { icon: '📄', label: 'Guion / Documento', desc: 'Comparte tu escritura creativa' },
  { icon: '🎭', label: 'Proyecto colaborativo', desc: 'Busca equipo para tu proyecto' },
  { icon: '🛍', label: 'Producto en tienda', desc: 'Vende tu obra o servicio' },
]

export default function CreatePage() {
  const { lang } = useApp()
  return (
    <div className="app-shell">
      <TopBar title={lang==='es'?'Crear':'Create'} />
      <main className="page-content px-4 py-4">
        <p className="text-sm mb-4" style={{ color: 'var(--c-muted)' }}>
          {lang==='es'?'¿Qué quieres publicar hoy?':'What do you want to publish today?'}
        </p>
        <div className="space-y-2.5">
          {TYPES.map((type, i) => (
            <motion.div key={type.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.05*i }}
              whileTap={{ scale: 0.98 }}
              className="toon-card flex items-center gap-4 p-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'var(--c-surface2)' }}>
                {type.icon}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{type.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--c-muted)' }}>{type.desc}</p>
              </div>
              <span className="ml-auto text-lg" style={{ color: 'var(--c-muted)' }}>›</span>
            </motion.div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
