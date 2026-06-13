'use client'

import { motion } from 'framer-motion'
import {
  AtSign,
  BriefcaseBusiness,
  Check,
  Crown,
  MapPin,
  Pencil,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'

import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import { ExperienciaCard, type ExperienciaItem } from '@/components/profile/ExperienciaCard'
import { PortfolioGrid, type PortfolioItem } from '@/components/profile/PortfolioGrid'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import {
  ROLES_JERARQUIA,
  getRama,
  variarColor,
  type RamaId,
  type RolJerarquia,
} from '@/lib/ramas'

interface PerfilRama {
  ramaId: RamaId
  titulos: string[]
}

interface ProyectoPerfil {
  id: string
  nombre: string
  estado: string
  descripcion: string
  colaboradores: number
  ramaId: RamaId
}

interface PerfilUsuario {
  nombre: string
  username: string
  apodo: string
  descripcion: string
  avatarUrl: string
  coverUrl: string
  ubicacion: string
  rol: RolJerarquia
  seguidores: number
  siguiendo: number
  publicaciones: number
  ramas: PerfilRama[]
  experiencia: ExperienciaItem[]
  contenido: PortfolioItem[]
  proyectos: ProyectoPerfil[]
}

const PERFIL_DEMO: PerfilUsuario = {
  nombre: 'Matías Arce',
  username: 'matiasarce',
  apodo: 'El Mago del Frame',
  descripcion:
    'Director de animación y compositor de Oaxaca. Construye mundos con narrativa fantástica, texturas artesanales y música original para series independientes.',
  avatarUrl: '/hf/artist.webp',
  coverUrl: '/hf/cinematic.webp',
  ubicacion: 'Oaxaca, México',
  rol: 'creador',
  seguidores: 12840,
  siguiendo: 486,
  publicaciones: 34,
  ramas: [
    {
      ramaId: 'animacion',
      titulos: ['Director de animación', 'Animador 2D'],
    },
    {
      ramaId: 'musica',
      titulos: ['Compositor', 'Diseñador de sonido'],
    },
  ],
  experiencia: [
    {
      id: 'exp-1',
      titulo: 'Director de animación',
      estudio: 'Lumbre Studio',
      periodo: '2023 - presente',
      ubicacion: 'Ciudad de México',
      ramaId: 'animacion',
      resumen:
        'Dirección de una miniserie animada con equipo remoto de storyboard, layout y composición.',
      logros: ['Biblia visual de 8 episodios', 'Pipeline 2D para entregas semanales'],
    },
    {
      id: 'exp-2',
      titulo: 'Compositor',
      estudio: 'Festival Pixelatl',
      periodo: '2022',
      ubicacion: 'Guadalajara',
      ramaId: 'musica',
      resumen:
        'Música original y diseño sonoro para cortos seleccionados en muestra latinoamericana.',
      logros: ['12 piezas originales', 'Mezcla stereo para exhibición'],
    },
  ],
  contenido: [
    {
      id: 'pub-1',
      tipo: 'animacion',
      titulo: 'Niebla sobre el Istmo',
      descripcion: 'Loop de exploración visual para una serie fantástica del sur de México.',
      thumbnailUrl: '/hf/hero1.webp',
      duracion: '00:42',
      likes: 1840,
      comentarios: 126,
      ramaId: 'animacion',
      publicado: 'Hace 2 días',
    },
    {
      id: 'pub-2',
      tipo: 'imagen',
      titulo: 'Diseño de protagonista',
      descripcion: 'Concept art final de Lila, guía espiritual de la historia.',
      thumbnailUrl: '/hf/portfolio.webp',
      likes: 940,
      comentarios: 58,
      ramaId: 'animacion',
      publicado: 'Hace 6 días',
    },
    {
      id: 'pub-3',
      tipo: 'animacion',
      titulo: 'Prueba de acting',
      descripcion: 'Secuencia corta para medir timing, silueta y claridad emocional.',
      thumbnailUrl: '/hf/studio.webp',
      duracion: '01:18',
      likes: 2310,
      comentarios: 204,
      ramaId: 'animacion',
      publicado: 'Hace 1 semana',
    },
    {
      id: 'pub-4',
      tipo: 'audio',
      titulo: 'Tema de apertura: Río de tinta',
      descripcion: 'Boceto musical con marimba, cuerdas suaves y percusión orgánica.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duracion: '02:36',
      likes: 720,
      comentarios: 41,
      ramaId: 'musica',
      publicado: 'Hace 3 días',
    },
    {
      id: 'pub-5',
      tipo: 'audio',
      titulo: 'Texturas para bosque nocturno',
      descripcion: 'Capa ambiental para secuencias de suspenso en interiores naturales.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duracion: '01:54',
      likes: 386,
      comentarios: 19,
      ramaId: 'musica',
      publicado: 'Hace 9 días',
    },
  ],
  proyectos: [
    {
      id: 'proy-1',
      nombre: 'Río de tinta',
      estado: 'En preproducción',
      descripcion: 'Serie animada de fantasía mexicana con música original y equipo mixto LATAM.',
      colaboradores: 18,
      ramaId: 'animacion',
    },
    {
      id: 'proy-2',
      nombre: 'Archivo Sonoro del Sur',
      estado: 'Buscando colaboradores',
      descripcion: 'Biblioteca de ambientes y motivos musicales para creadores independientes.',
      colaboradores: 7,
      ramaId: 'musica',
    },
  ],
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')
  const value = parseInt(normalized, 16)

  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  }
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function textColorFor(hex: string): '#111111' | '#FFFFFF' {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#111111' : '#FFFFFF'
}

export default function ProfilePage(): JSX.Element {
  const { lang, demoMode } = useApp()
  const tx = t(lang)
  const perfil = PERFIL_DEMO
  const rol = ROLES_JERARQUIA[perfil.rol]
  const isOwnProfile = demoMode === 'user' || demoMode === 'admin'
  const showProjects = perfil.rol === 'creador' && perfil.proyectos.length > 0

  return (
    <div className="app-shell">
      <TopBar title={tx.nav.profile} />
      <main className="page-content bg-[var(--c-bg)]">
        <section className="relative">
          <div className="relative h-40 overflow-hidden">
            <Image src={perfil.coverUrl} alt="" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[var(--c-bg)]/20 to-[var(--c-bg)]" />
          </div>

          <div className="relative z-10 px-4 pb-5 pt-0">
            <div className="-mt-12 flex items-end justify-between gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="relative h-24 w-24 overflow-hidden rounded-lg border-4 border-[var(--c-bg)] bg-[var(--c-surface)]"
              >
                <Image src={perfil.avatarUrl} alt={perfil.nombre} fill className="object-cover" />
                <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-black ring-2 ring-[var(--c-bg)]">
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                </span>
              </motion.div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                className="mb-1 inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] px-4 text-xs font-bold text-[var(--c-text)]"
              >
                {isOwnProfile ? (
                  <Pencil size={14} aria-hidden="true" />
                ) : (
                  <Users size={14} aria-hidden="true" />
                )}
                {isOwnProfile ? (lang === 'es' ? 'Editar' : 'Edit') : tx.profile.follow}
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04 }}
              className="mt-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="text-2xl font-black leading-tight text-[var(--c-text)]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {perfil.nombre}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2.5 py-1 text-[11px] font-black uppercase text-yellow-300">
                  <Crown size={12} aria-hidden="true" />
                  {rol.nombre}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--c-muted)]">
                <span className="inline-flex items-center gap-1">
                  <AtSign size={13} aria-hidden="true" />
                  @{perfil.username}
                </span>
                <span className="font-bold text-[var(--toon-orange)]">{perfil.apodo}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} aria-hidden="true" />
                  {perfil.ubicacion}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--c-text)]">{perfil.descripcion}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--c-muted)]">{rol.descripcion}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="mt-5 grid grid-cols-3 overflow-hidden rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)]"
            >
              <StatBlock label={lang === 'es' ? 'Publicaciones' : 'Posts'} value={perfil.publicaciones} />
              <StatBlock label={tx.profile.followers} value={perfil.seguidores} />
              <StatBlock label={lang === 'es' ? 'siguiendo' : 'following'} value={perfil.siguiendo} />
            </motion.div>
          </div>
        </section>

        <div className="space-y-7 px-4 pb-5">
          <ProfileSection
            eyebrow={lang === 'es' ? 'Especialidad' : 'Specialty'}
            title={lang === 'es' ? 'Ramas y títulos' : 'Branches and titles'}
          >
            <div className="space-y-3">
              {perfil.ramas.map((ramaPerfil, index) => (
                <RamaTituloCard key={ramaPerfil.ramaId} rama={ramaPerfil} index={index} />
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            eyebrow={lang === 'es' ? 'Trayectoria' : 'Track record'}
            title={lang === 'es' ? 'Experiencia laboral' : 'Work experience'}
          >
            <div className="space-y-3">
              {perfil.experiencia.map((experiencia, index) => (
                <ExperienciaCard key={experiencia.id} experiencia={experiencia} index={index} />
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            eyebrow={lang === 'es' ? 'Portfolio' : 'Portfolio'}
            title={lang === 'es' ? 'Contenido publicado' : 'Published content'}
          >
            <PortfolioGrid items={perfil.contenido} lang={lang} />
          </ProfileSection>

          {showProjects ? (
            <ProfileSection
              eyebrow={lang === 'es' ? 'Creación activa' : 'Active creation'}
              title={lang === 'es' ? 'Proyectos' : 'Projects'}
            >
              <div className="space-y-3">
                {perfil.proyectos.map((proyecto, index) => (
                  <ProyectoCard key={proyecto.id} proyecto={proyecto} index={index} />
                ))}
              </div>
            </ProfileSection>
          ) : null}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

function ProfileSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}): JSX.Element {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--toon-orange)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-base font-black leading-tight text-[var(--c-text)]">{title}</h2>
      </div>
      {children}
    </motion.section>
  )
}

function StatBlock({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="border-r border-[var(--c-border)] px-2 py-3 text-center last:border-r-0">
      <p className="text-lg font-black leading-none text-[var(--c-text)]">{formatCompact(value)}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-normal text-[var(--c-muted)]">{label}</p>
    </div>
  )
}

function RamaTituloCard({ rama, index }: { rama: PerfilRama; index: number }): JSX.Element {
  const ramaInfo = getRama(rama.ramaId)
  const color = ramaInfo?.color ?? '#FF6B00'
  const surfaceStyle = {
    background: `linear-gradient(135deg, ${withAlpha(color, 0.2)}, rgba(17,17,17,0.92))`,
    borderColor: withAlpha(color, 0.34),
  } satisfies CSSProperties

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.04 * index }}
      className="overflow-hidden rounded-lg border p-3"
      style={surfaceStyle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-[var(--c-text)]">{ramaInfo?.nombre ?? rama.ramaId}</p>
          <p className="mt-0.5 text-[11px] text-[var(--c-muted)]">{ramaInfo?.colorNombre ?? 'Color'}</p>
        </div>
        <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {rama.titulos.map((titulo, titleIndex) => {
          const titleColor = variarColor(color, titleIndex % 2 === 0 ? 0.04 : -0.06)
          const style = {
            backgroundColor: titleColor,
            color: textColorFor(titleColor),
          } satisfies CSSProperties

          return (
            <span key={titulo} className="rounded-full px-3 py-1.5 text-[11px] font-black" style={style}>
              {titulo}
            </span>
          )
        })}
      </div>
    </motion.article>
  )
}

function ProyectoCard({ proyecto, index }: { proyecto: ProyectoPerfil; index: number }): JSX.Element {
  const rama = getRama(proyecto.ramaId)
  const color = rama?.color ?? '#FF6B00'
  const style = {
    borderColor: withAlpha(color, 0.32),
    background: `linear-gradient(135deg, rgba(17,17,17,0.96), ${withAlpha(color, 0.12)})`,
  } satisfies CSSProperties

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: 0.04 * index }}
      whileTap={{ scale: 0.985 }}
      className="rounded-lg border p-4"
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black leading-tight text-[var(--c-text)]">{proyecto.nombre}</p>
          <p className="mt-1 text-[11px] font-bold text-[var(--toon-orange)]">{proyecto.estado}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--c-surface2)] px-2 py-1 text-[10px] font-bold text-[var(--c-muted)]">
          <BriefcaseBusiness size={12} aria-hidden="true" />
          {rama?.nombre ?? proyecto.ramaId}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[var(--c-muted)]">{proyecto.descripcion}</p>
      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-[var(--c-text)]">
        <Users size={14} style={{ color }} aria-hidden="true" />
        {proyecto.colaboradores} colaboradores
      </div>
    </motion.article>
  )
}
