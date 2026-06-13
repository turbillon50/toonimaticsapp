'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FolderKanban, Heart, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import ProyectoCard, { type ProyectoEstado, type ProyectoResumen } from '@/components/proyectos/ProyectoCard'
import { RAMAS_ARTISTICAS } from '@/lib/ramas'

type FiltroEstado = 'todos' | ProyectoEstado

const PROYECTOS_DEMO: ProyectoResumen[] = [
  {
    id: 'bruma-andina',
    nombre: 'Bruma Andina',
    creador: 'Marisol Vega',
    descripcion: 'Corto animado sobre una aprendiz de musica que busca el sonido perdido de su pueblo.',
    estado: 'en_proceso',
    miembros: 18,
    portada: '/hf/studio.webp',
    ramaId: 'animacion',
    progreso: 64,
    favorito: true,
    ultimaActividad: 'Activo hoy',
  },
  {
    id: 'archivo-solar',
    nombre: 'Archivo Solar',
    creador: 'Rafa Montes',
    descripcion: 'Serie documental de artistas latinoamericanos que mezclan memoria, ciencia y territorio.',
    estado: 'en_proceso',
    miembros: 11,
    portada: '/hf/community.webp',
    ramaId: 'audiovisual',
    progreso: 42,
    favorito: false,
    ultimaActividad: 'Hace 2 h',
  },
  {
    id: 'casa-de-tinta',
    nombre: 'Casa de Tinta',
    creador: 'Lucia Paredes',
    descripcion: 'Antologia ilustrada con relatos breves de barrios portuarios y mitologias urbanas.',
    estado: 'terminado',
    miembros: 9,
    portada: '/hf/portfolio.webp',
    ramaId: 'literatura',
    progreso: 100,
    favorito: false,
    ultimaActividad: 'Publicado',
  },
  {
    id: 'neon-barrio',
    nombre: 'Neon Barrio',
    creador: 'Camila Ortiz',
    descripcion: 'Videoclip narrativo con coreografia, VFX y direccion de arte nocturna.',
    estado: 'en_proceso',
    miembros: 24,
    portada: '/hf/hero1.webp',
    ramaId: 'musica',
    progreso: 78,
    favorito: true,
    ultimaActividad: 'Revision',
  },
  {
    id: 'los-dias-largos',
    nombre: 'Los Dias Largos',
    creador: 'Nicolas Silva',
    descripcion: 'Largometraje independiente sobre amistad, migracion y oficios creativos.',
    estado: 'terminado',
    miembros: 31,
    portada: '/hf/cinematic.webp',
    ramaId: 'cine',
    progreso: 100,
    favorito: false,
    ultimaActividad: 'Finalizado',
  },
]

const filtros: Array<{ id: FiltroEstado; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'en_proceso', label: 'En proceso' },
  { id: 'terminado', label: 'Terminados' },
]

export default function ProyectosPage() {
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [favoritos, setFavoritos] = useState<string[]>(
    PROYECTOS_DEMO.filter((proyecto) => proyecto.favorito).map((proyecto) => proyecto.id),
  )

  const proyectos = useMemo(
    () =>
      PROYECTOS_DEMO.map((proyecto) => ({
        ...proyecto,
        favorito: favoritos.includes(proyecto.id),
      })),
    [favoritos],
  )

  const proyectosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return proyectos.filter((proyecto) => {
      const coincideEstado = filtro === 'todos' || proyecto.estado === filtro
      const coincideTexto =
        !termino ||
        proyecto.nombre.toLowerCase().includes(termino) ||
        proyecto.creador.toLowerCase().includes(termino) ||
        proyecto.descripcion.toLowerCase().includes(termino)

      return coincideEstado && coincideTexto
    })
  }, [busqueda, filtro, proyectos])

  const ramasActivas = RAMAS_ARTISTICAS.filter((rama) =>
    PROYECTOS_DEMO.some((proyecto) => proyecto.ramaId === rama.id),
  )

  const enProceso = proyectos.filter((proyecto) => proyecto.estado === 'en_proceso').length
  const terminados = proyectos.filter((proyecto) => proyecto.estado === 'terminado').length

  function toggleFavorito(id: string) {
    setFavoritos((actuales) =>
      actuales.includes(id) ? actuales.filter((proyectoId) => proyectoId !== id) : [...actuales, id],
    )
  }

  return (
    <div className="app-shell">
      <TopBar title="Proyectos" />
      <main className="page-content">
        <section className="px-3 pt-3">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(17,17,17,0.98), rgba(26,26,26,0.84))',
              borderColor: 'var(--c-border)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold text-[var(--c-muted)]">Galeria colaborativa</p>
                <h1 className="text-2xl font-black leading-tight text-[var(--c-text)]">Proyectos Toonimatics</h1>
                <p className="mt-1 text-xs leading-relaxed text-[var(--c-muted)]">
                  Producciones activas y obras terminadas de la comunidad.
                </p>
              </div>
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl toon-gradient-bg text-white">
                <FolderKanban size={20} />
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Resumen label="Activos" value={enProceso.toString()} />
              <Resumen label="Terminados" value={terminados.toString()} />
              <Resumen label="Favoritos" value={favoritos.length.toString()} />
            </div>
          </motion.div>
        </section>

        <section className="px-3 pt-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-muted)]" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por proyecto, creador o tema"
              className="w-full rounded-xl border bg-[var(--c-surface2)] py-3 pl-9 pr-3 text-sm text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[#FF6B00]"
              style={{ borderColor: 'var(--c-border)' }}
            />
          </div>
        </section>

        <section className="px-3 pt-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filtros.map((item) => {
              const activo = filtro === item.id

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setFiltro(item.id)}
                  className={`flex-shrink-0 rounded-full px-3 py-2 text-xs font-bold ${activo ? 'toon-gradient-bg text-white' : 'bg-[var(--c-surface2)] text-[var(--c-muted)]'}`}
                >
                  {item.label}
                </motion.button>
              )
            })}
          </div>
        </section>

        <section className="px-3 pt-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ramasActivas.map((rama) => (
              <span
                key={rama.id}
                className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: rama.color }}
              >
                {rama.nombre}
              </span>
            ))}
          </div>
        </section>

        <section className="px-3 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-black text-[var(--c-text)]">Galeria</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--c-surface2)] px-2.5 py-1 text-[11px] font-bold text-[var(--c-muted)]">
              <Heart size={12} />
              {favoritos.length}
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {proyectosFiltrados.length > 0 ? (
              <motion.div layout className="space-y-3">
                {proyectosFiltrados.map((proyecto, index) => (
                  <ProyectoCard
                    key={proyecto.id}
                    proyecto={proyecto}
                    index={index}
                    onToggleFavorito={toggleFavorito}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 text-center"
              >
                <p className="text-sm font-bold text-[var(--c-text)]">No hay proyectos con ese filtro.</p>
                <p className="mt-1 text-xs text-[var(--c-muted)]">Prueba con otra busqueda o cambia el estado.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      <BottomNav />
    </div>
  )
}

function Resumen({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
      <p className="text-[10px] font-bold text-[var(--c-muted)]">{label}</p>
      <p className="mt-1 text-lg font-black leading-none text-[var(--c-text)]">{value}</p>
    </div>
  )
}
