'use client'

import { motion } from 'framer-motion'
import { Award, Clock3, PanelsTopLeft, Sparkles } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import TareaCard, { type TareaStudio } from '@/components/studio/TareaCard'
import { getRama, variarColor } from '@/lib/ramas'

const TAREAS_DEMO: TareaStudio[] = [
  {
    id: 'storyboard-acto-1',
    titulo: 'Limpiar storyboard del acto 1',
    descripcion: 'Ajustar continuidad visual, numerar planos y dejar notas claras para animacion.',
    puntos: 140,
    ramaId: 'ilustracion',
    vencimiento: 'Hoy, 18:00',
    prioridad: 'alta',
  },
  {
    id: 'animatic-calle',
    titulo: 'Exportar animatic de la escena Calle Sur',
    descripcion: 'Sincronizar el corte con voces temporales y subir una version de revision.',
    puntos: 180,
    ramaId: 'animacion',
    vencimiento: 'Manana, 11:00',
    prioridad: 'alta',
  },
  {
    id: 'voz-guia',
    titulo: 'Grabar guia de voz para Luna',
    descripcion: 'Entregar tres lecturas con tono intimo y una toma alternativa mas energica.',
    puntos: 95,
    ramaId: 'actuacion',
    vencimiento: 'Jun 15',
    prioridad: 'media',
  },
  {
    id: 'score-puente',
    titulo: 'Boceto musical del puente emocional',
    descripcion: 'Crear una maqueta de 30 segundos con textura andina y pulso cinematografico.',
    puntos: 120,
    ramaId: 'musica',
    vencimiento: 'Jun 16',
    prioridad: 'media',
  },
  {
    id: 'pipeline-assets',
    titulo: 'Ordenar assets para handoff',
    descripcion: 'Revisar nombres de archivos, versiones y carpetas antes de pasar a composicion.',
    puntos: 80,
    ramaId: 'tech',
    vencimiento: 'Jun 17',
    prioridad: 'baja',
  },
]

const PROYECTO = {
  nombre: 'Bruma Andina',
  creadora: 'Marisol Vega',
  rol: 'Trabajador de animacion',
  ramaId: 'animacion' as const,
}

export default function StudioPage() {
  const [tareasCompletadas, setTareasCompletadas] = useState<string[]>(['storyboard-acto-1'])
  const rama = getRama(PROYECTO.ramaId)
  const color = rama?.color ?? '#F2C53D'
  const colorOscuro = variarColor(color, -0.24)

  const resumen = useMemo(() => {
    const completadas = TAREAS_DEMO.filter((tarea) => tareasCompletadas.includes(tarea.id))
    const puntosGanados = completadas.reduce((total, tarea) => total + tarea.puntos, 0)
    const puntosTotales = TAREAS_DEMO.reduce((total, tarea) => total + tarea.puntos, 0)
    const progreso = Math.round((completadas.length / TAREAS_DEMO.length) * 100)

    return {
      completadas: completadas.length,
      pendientes: TAREAS_DEMO.length - completadas.length,
      puntosGanados,
      puntosTotales,
      progreso,
    }
  }, [tareasCompletadas])

  function toggleTarea(id: string) {
    setTareasCompletadas((actuales) =>
      actuales.includes(id) ? actuales.filter((tareaId) => tareaId !== id) : [...actuales, id],
    )
  }

  return (
    <div className="app-shell">
      <TopBar title="STUDIO" />
      <main className="page-content">
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
                  <h1 className="text-2xl font-black leading-tight text-[var(--c-text)]">{PROYECTO.nombre}</h1>
                  <p className="mt-1 text-xs text-[var(--c-muted)]">
                    {PROYECTO.rol} para {PROYECTO.creadora}
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
                <Metric icon={<Award size={15} />} label="Listas" value={`${resumen.completadas}/${TAREAS_DEMO.length}`} color={color} />
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

          <div className="space-y-3">
            {TAREAS_DEMO.map((tarea, index) => (
              <TareaCard
                key={tarea.id}
                tarea={tarea}
                index={index}
                completada={tareasCompletadas.includes(tarea.id)}
                onToggle={toggleTarea}
              />
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
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
