'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Circle, Sparkles } from 'lucide-react'
import type { CSSProperties } from 'react'
import { getRama, variarColor, type RamaId } from '@/lib/ramas'

export type TareaPrioridad = 'alta' | 'media' | 'baja'

export interface TareaStudio {
  id: string
  titulo: string
  descripcion: string
  puntos: number
  ramaId: RamaId
  vencimiento: string
  prioridad: TareaPrioridad
}

interface TareaCardProps {
  tarea: TareaStudio
  completada: boolean
  index?: number
  onToggle: (id: string) => void
}

const prioridadLabel: Record<TareaPrioridad, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export default function TareaCard({ tarea, completada, index = 0, onToggle }: TareaCardProps) {
  const rama = getRama(tarea.ramaId)
  const color = rama?.color ?? '#FF6B00'
  const accentSoft = variarColor(color, -0.22)

  const cardStyle: CSSProperties = {
    background: completada
      ? `linear-gradient(135deg, rgba(17,17,17,0.96), rgba(17,17,17,0.82)), linear-gradient(135deg, ${color}, ${accentSoft})`
      : 'var(--c-surface)',
    borderColor: completada ? color : 'var(--c-border)',
    boxShadow: completada ? `0 14px 42px ${color}24` : 'none',
  }

  const checkStyle: CSSProperties = {
    background: completada ? `linear-gradient(135deg, ${color}, ${accentSoft})` : 'var(--c-surface2)',
    borderColor: completada ? color : 'var(--c-border)',
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: index * 0.045, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border p-3"
      style={cardStyle}
    >
      <div className="flex gap-3">
        <motion.button
          type="button"
          role="checkbox"
          aria-checked={completada}
          aria-label={completada ? `Marcar ${tarea.titulo} como pendiente` : `Completar ${tarea.titulo}`}
          onClick={() => onToggle(tarea.id)}
          whileTap={{ scale: 0.88 }}
          className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border"
          style={checkStyle}
        >
          <AnimatePresence initial={false} mode="wait">
            {completada ? (
              <motion.span
                key="checked"
                initial={{ scale: 0.4, rotate: -18, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.4, rotate: 18, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 25 }}
                className="flex h-full w-full items-center justify-center text-white"
              >
                <Check size={22} strokeWidth={2.8} />
              </motion.span>
            ) : (
              <motion.span
                key="empty"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-[var(--c-muted)]"
              >
                <Circle size={18} strokeWidth={1.8} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: color }}
            >
              {rama?.nombre ?? 'Rama'}
            </span>
            <span className="rounded-full bg-[var(--c-surface2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--c-muted)]">
              {prioridadLabel[tarea.prioridad]}
            </span>
          </div>

          <h3
            className={`text-sm font-bold leading-snug ${completada ? 'line-through decoration-2' : ''}`}
            style={{ color: completada ? 'var(--c-muted)' : 'var(--c-text)', textDecorationColor: color }}
          >
            {tarea.titulo}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--c-muted)]">{tarea.descripcion}</p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-[var(--c-muted)]">{tarea.vencimiento}</span>
            <motion.span
              layout
              className="inline-flex items-center gap-1 rounded-full bg-[var(--c-surface2)] px-2.5 py-1 text-xs font-black"
              style={{ color }}
            >
              <Sparkles size={13} />
              +{tarea.puntos} pts
            </motion.span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
