'use client'

import { motion } from 'framer-motion'
import { Award, Clock3, PanelsTopLeft, Sparkles } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import TareaCard, { type TareaStudio } from '@/components/studio/TareaCard'
import { getRama, variarColor, type RamaId } from '@/lib/ramas'

export type StudioTareaItem = TareaStudio & {
  completada: boolean
}

export interface StudioProyecto {
  id: string
  nombre: string
  creador: string
  rol: string
  ramaId: RamaId
}

interface StudioClientProps {
  proyecto: StudioProyecto | null
  tareas: StudioTareaItem[]
}

interface ResumenTareas {
  completadas: number
  pendientes: number
  puntosGanados: number
  puntosTotales: number
  progreso: number
}

export default function StudioClient({ proyecto, tareas: tareasIniciales }: StudioClientProps) {
  const [tareas, setTareas] = useState<StudioTareaItem[]>(tareasIniciales)
  const [tareasGuardando, setTareasGuardando] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const rama = getRama(proyecto?.ramaId ?? 'animacion')
  const color = rama?.color ?? '#F2C53D'
  const colorOscuro = variarColor(color, -0.24)

  const resumen = useMemo<ResumenTareas>(() => {
    const completadas = tareas.filter((tarea) => tarea.completada)
    const puntosGanados = completadas.reduce((total, tarea) => total + tarea.puntos, 0)
    const puntosTotales = tareas.reduce((total, tarea) => total + tarea.puntos, 0)
    const progreso = tareas.length > 0 ? Math.round((completadas.length / tareas.length) * 100) : 0

    return {
      completadas: completadas.length,
      pendientes: tareas.length - completadas.length,
      puntosGanados,
      puntosTotales,
      progreso,
    }
  }, [tareas])

  async function completarTarea(id: string) {
    const tarea = tareas.find((item) => item.id === id)

    if (!tarea || tarea.completada || tareasGuardando.includes(id)) {
      return
    }

    setError(null)
    setTareasGuardando((actuales) => [...actuales, id])
    setTareas((actuales) =>
      actuales.map((item) => (item.id === id ? { ...item, completada: true } : item)),
    )

    try {
      const response = await fetch(`/api/tareas/${encodeURIComponent(id)}`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('No se pudo completar la tarea')
      }
    } catch {
      setTareas((actuales) =>
        actuales.map((item) => (item.id === id ? { ...item, completada: false } : item)),
      )
      setError('No se pudo completar la tarea. Intenta de nuevo.')
    } finally {
      setTareasGuardando((actuales) => actuales.filter((tareaId) => tareaId !== id))
    }
  }

  return (
    <>
      <section className="px-3 pt-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border"
          style={{
            borderColor: `${color}66`,
            background: `linear-gradient(135deg, rgba(17,17,17,0.96), rgba(17,17,17,0.82)), radial-gradient(circle at top right, ${color}3D, transparent 46%)`,
          }}
        >
          <div className="p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold text-[var(--c-muted)]">Proyecto activo</p>
                <h1 className="text-2xl font-black leading-tight text-[var(--c-text)]">
                  {proyecto?.nombre ?? 'Sin proyecto activo'}
                </h1>
                <p className="mt-1 text-xs text-[var(--c-muted)]">
                  {proyecto ? `${proyecto.rol} para ${proyecto.creador}` : 'No hay proyectos disponibles'}
                </p>
              </div>
              <span
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${color}, ${colorOscuro})` }}
              >
                <PanelsTopLeft size={20} />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Metric icon={<Sparkles size={15} />} label="Puntos" value={resumen.puntosGanados.toString()} color={color} />
              <Metric icon={<Award size={15} />} label="Listas" value={`${resumen.completadas}/${tareas.length}`} color={color} />
              <Metric icon={<Clock3 size={15} />} label="Pend." value={resumen.pendientes.toString()} color={color} />
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--c-muted)]">
                <span>Progreso de asignacion</span>
                <motion.span key={resumen.progreso} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                  {resumen.progreso}%
                </motion.span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-black/35">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${resumen.progreso}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                  style={{ background: `linear-gradient(90deg, ${colorOscuro}, ${color})` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[var(--c-muted)]">
                {resumen.puntosGanados} de {resumen.puntosTotales} puntos disponibles ganados.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-3 pb-4 pt-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[var(--c-text)]">Tareas asignadas</h2>
            <p className="text-xs text-[var(--c-muted)]">{rama?.nombre ?? 'Rama artistica'} en produccion</p>
          </div>
          <span className="rounded-full bg-[var(--c-surface2)] px-2.5 py-1 text-[11px] font-bold text-[var(--c-muted)]">
            {resumen.completadas} completadas
          </span>
        </div>

        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200"
          >
            {error}
          </motion.p>
        ) : null}

        {tareas.length > 0 ? (
          <div className="space-y-3">
            {tareas.map((tarea, index) => (
              <TareaCard
                key={tarea.id}
                tarea={tarea}
                index={index}
                completada={tarea.completada}
                procesando={tareasGuardando.includes(tarea.id)}
                onToggle={completarTarea}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 text-center"
          >
            <p className="text-sm font-bold text-[var(--c-text)]">No hay tareas asignadas.</p>
            <p className="mt-1 text-xs text-[var(--c-muted)]">Cuando el proyecto tenga tareas, apareceran aqui.</p>
          </motion.div>
        )}
      </section>
    </>
  )
}

function Metric({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[var(--c-muted)]">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-bold">{label}</span>
      </div>
      <p className="text-lg font-black leading-none text-[var(--c-text)]">{value}</p>
    </div>
  )
}
