'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, FolderKanban, Loader2, MapPin, Search, Users } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import { RamaBadge } from '@/components/ramas/RamaBadge'
import { RolBadge } from '@/components/ramas/RolBadge'
import { useApp } from '@/lib/context'
import type { ExploreProyecto, ExploreSearchResult, ExploreUser } from './types'

type ExploreTab = 'proyectos' | 'usuarios'

interface ExploreClientProps {
  initialData: ExploreSearchResult
}

const estadoLabel: Record<ExploreProyecto['estado'], string> = {
  en_proceso: 'En proceso',
  terminado: 'Terminado',
}

const estadoColor: Record<ExploreProyecto['estado'], string> = {
  en_proceso: '#F2C53D',
  terminado: '#3CA55C',
}

export default function ExploreClient({ initialData }: ExploreClientProps) {
  const { lang } = useApp()
  const [tab, setTab] = useState<ExploreTab>('proyectos')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ExploreSearchResult>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const query = search.trim()

    if (!query) {
      setResults(initialData)
      setIsLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('search_failed')
        }

        const data = (await response.json()) as ExploreSearchResult
        setResults(data)
      } catch (searchError) {
        if (isAbortError(searchError)) {
          return
        }

        setError(lang === 'es' ? 'No se pudo completar la busqueda.' : 'Search could not be completed.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 260)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [initialData, lang, search])

  const tabs = useMemo(
    () => [
      {
        id: 'proyectos' as const,
        label: lang === 'es' ? 'Proyectos' : 'Projects',
        count: results.proyectos.length,
        icon: FolderKanban,
      },
      {
        id: 'usuarios' as const,
        label: lang === 'es' ? 'Usuarios' : 'Users',
        count: results.usuarios.length,
        icon: Users,
      },
    ],
    [lang, results.proyectos.length, results.usuarios.length],
  )

  return (
    <>
      <section className="px-3 pt-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(17,17,17,0.98), rgba(26,26,26,0.84))',
            borderColor: 'var(--c-border)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-bold text-[var(--c-muted)]">
                {lang === 'es' ? 'Busqueda comunitaria' : 'Community search'}
              </p>
              <h1 className="text-2xl font-black leading-tight text-[var(--c-text)]">
                {lang === 'es' ? 'Explorar Toonimatics' : 'Explore Toonimatics'}
              </h1>
              <p className="mt-1 text-xs leading-relaxed text-[var(--c-muted)]">
                {lang === 'es'
                  ? 'Proyectos activos, obras terminadas y artistas de la comunidad.'
                  : 'Active projects, finished works, and community artists.'}
              </p>
            </div>
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl toon-gradient-bg text-white">
              <Search size={20} />
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Resumen label={lang === 'es' ? 'Proyectos' : 'Projects'} value={results.proyectos.length.toString()} />
            <Resumen label={lang === 'es' ? 'Usuarios' : 'Users'} value={results.usuarios.length.toString()} />
          </div>
        </motion.div>
      </section>

      <section className="px-3 pt-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-muted)]" />
          <input
            aria-label={lang === 'es' ? 'Buscar proyectos y usuarios' : 'Search projects and users'}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={lang === 'es' ? 'Buscar proyectos, usuarios o roles' : 'Search projects, users, or roles'}
            className="w-full rounded-xl border bg-[var(--c-surface2)] py-3 pl-9 pr-10 text-sm text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[#FF6B00]"
            style={{ borderColor: 'var(--c-border)' }}
          />
          {isLoading ? (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--c-muted)]"
              aria-hidden="true"
            />
          ) : null}
        </div>
        {error ? <p className="mt-2 text-xs font-semibold text-[#FF6B00]">{error}</p> : null}
      </section>

      <section className="px-3 pt-3">
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((item) => {
            const Icon = item.icon
            const active = tab === item.id

            return (
              <motion.button
                key={item.id}
                type="button"
                aria-pressed={active}
                whileTap={{ scale: 0.96 }}
                onClick={() => setTab(item.id)}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black ${
                  active ? 'toon-gradient-bg text-white' : 'bg-[var(--c-surface2)] text-[var(--c-muted)]'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                <span className="rounded-full bg-black/25 px-1.5 py-0.5 text-[10px] leading-none text-white">
                  {item.count}
                </span>
              </motion.button>
            )
          })}
        </div>
      </section>

      <section className="px-3 pb-5 pt-4">
        <AnimatePresence mode="wait">
          {tab === 'proyectos' ? (
            <motion.div
              key="proyectos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24 }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {results.proyectos.length > 0 ? (
                results.proyectos.map((proyecto, index) => (
                  <ProyectoCard key={proyecto.id} proyecto={proyecto} index={index} />
                ))
              ) : (
                <EmptyState
                  title={lang === 'es' ? 'No hay proyectos para mostrar.' : 'No projects to show.'}
                  description={lang === 'es' ? 'Prueba con otra busqueda.' : 'Try a different search.'}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="usuarios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24 }}
              className="space-y-2"
            >
              {results.usuarios.length > 0 ? (
                results.usuarios.map((usuario, index) => (
                  <UsuarioCard key={usuario.id} usuario={usuario} index={index} lang={lang} />
                ))
              ) : (
                <EmptyState
                  title={lang === 'es' ? 'No hay usuarios para mostrar.' : 'No users to show.'}
                  description={lang === 'es' ? 'Prueba con otro nombre o rol.' : 'Try another name or role.'}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}

function ProyectoCard({ proyecto, index }: { proyecto: ExploreProyecto; index: number }) {
  const portada = proyecto.portada_url?.trim() || '/hf/studio.webp'
  const creadorAvatar = proyecto.creador_avatar_url?.trim() || '/hf/artist.webp'

  return (
    <motion.article
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      className="overflow-hidden rounded-2xl border bg-[var(--c-surface)]"
      style={{ borderColor: 'var(--c-border)' }}
    >
      <div className="relative h-36 overflow-hidden">
        <Image
          src={portada}
          alt={proyecto.nombre}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black text-white"
          style={{ backgroundColor: estadoColor[proyecto.estado] }}
        >
          {estadoLabel[proyecto.estado]}
        </span>
        <div className="absolute bottom-3 left-3 right-3">
          <h2 className="line-clamp-1 text-lg font-black leading-tight text-white">{proyecto.nombre}</h2>
          <p className="mt-1 text-[11px] font-semibold text-white/80">{formatDate(proyecto.created_at)}</p>
        </div>
      </div>

      <div className="p-3">
        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--c-muted)]">{proyecto.descripcion}</p>
        <div className="mt-3 flex min-w-0 items-center gap-2">
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-xl">
            <Image src={creadorAvatar} alt={proyecto.creador} fill sizes="32px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[var(--c-text)]">{proyecto.creador}</p>
            <p className="text-[10px] text-[var(--c-muted)]">Creador</p>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function UsuarioCard({ usuario, index, lang }: { usuario: ExploreUser; index: number; lang: string }) {
  const avatar = usuario.avatar_url?.trim() || '/hf/artist.webp'
  const username = usuario.username?.trim() ? `@${usuario.username}` : usuario.artistic_role

  return (
    <motion.article
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      className="rounded-2xl border bg-[var(--c-surface)] p-3"
      style={{ borderColor: 'var(--c-border)' }}
    >
      <div className="flex gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl">
          <Image src={avatar} alt={usuario.name} fill sizes="56px" className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 className="truncate text-sm font-black text-[var(--c-text)]">{usuario.name}</h2>
            {usuario.verified ? <BadgeCheck size={15} className="flex-shrink-0 text-[#FF6B00]" /> : null}
          </div>
          {username ? <p className="truncate text-xs font-semibold text-[var(--c-muted)]">{username}</p> : null}
          {usuario.location ? (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[var(--c-muted)]">
              <MapPin size={11} />
              <span className="truncate">{usuario.location}</span>
            </p>
          ) : null}
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-xs font-black text-[var(--c-text)]">{formatCount(usuario.followers_count)}</p>
          <p className="text-[10px] text-[var(--c-muted)]">{lang === 'es' ? 'seguidores' : 'followers'}</p>
        </div>
      </div>

      {usuario.bio ? <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--c-muted)]">{usuario.bio}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RolBadge rol={usuario.rol} size="sm" />
        {usuario.ramas.map((rama) => (
          <RamaBadge key={`${usuario.id}-${rama.rama_id}-${rama.subtitulo}`} ramaId={rama.rama_id} subtitulo={rama.subtitulo} />
        ))}
      </div>
    </motion.article>
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 text-center sm:col-span-2"
    >
      <p className="text-sm font-bold text-[var(--c-text)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--c-muted)]">{description}</p>
    </motion.div>
  )
}

function formatCount(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace('.0', '')}M`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace('.0', '')}K`
  }

  return value.toString()
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
