'use client'

import { motion } from 'framer-motion'
import { Crown, Heart, Users } from 'lucide-react'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import { getRama, variarColor, type RamaId } from '@/lib/ramas'

export type ProyectoEstado = 'en_proceso' | 'terminado'

export interface ProyectoResumen {
  id: string
  nombre: string
  creador: string
  descripcion: string
  estado: ProyectoEstado
  miembros: number
  portada: string
  ramaId: RamaId
  progreso: number
  favorito: boolean
  ultimaActividad: string
}

interface ProyectoCardProps {
  proyecto: ProyectoResumen
  index?: number
  onToggleFavorito: (id: string) => void
}

const estadoLabel: Record<ProyectoEstado, string> = {
  en_proceso: 'En proceso',
  terminado: 'Terminado',
}

export default function ProyectoCard({ proyecto, index = 0, onToggleFavorito }: ProyectoCardProps) {
  const rama = getRama(proyecto.ramaId)
  const color = rama?.color ?? '#FF6B00'
  const colorOscuro = variarColor(color, -0.26)
  const estadoColor = proyecto.estado === 'terminado' ? '#3CA55C' : color

  const badgeStyle: CSSProperties = {
    background: `linear-gradient(135deg, ${color}, ${colorOscuro})`,
    boxShadow: `0 10px 26px ${color}24`,
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      className="overflow-hidden rounded-2xl border bg-[var(--c-surface)]"
      style={{ borderColor: 'var(--c-border)' }}
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src={proyecto.portada}
          alt={proyecto.nombre}
          fill
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black text-white" style={badgeStyle}>
          {rama?.nombre ?? 'Proyecto'}
        </div>

        <motion.button
          type="button"
          aria-pressed={proyecto.favorito}
          aria-label={proyecto.favorito ? `Quitar ${proyecto.nombre} de favoritos` : `Agregar ${proyecto.nombre} a favoritos`}
          onClick={() => onToggleFavorito(proyecto.id)}
          whileTap={{ scale: 0.86 }}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md"
        >
          <Heart
            size={18}
            strokeWidth={2.4}
            fill={proyecto.favorito ? '#FF1493' : 'transparent'}
            color={proyecto.favorito ? '#FF1493' : 'currentColor'}
          />
        </motion.button>

        <div className="absolute bottom-3 left-3 right-3">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: estadoColor }}
            >
              {estadoLabel[proyecto.estado]}
            </span>
            <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white/80 backdrop-blur-md">
              {proyecto.ultimaActividad}
            </span>
          </div>
          <h3 className="line-clamp-1 text-lg font-black leading-tight text-white">{proyecto.nombre}</h3>
        </div>
      </div>

      <div className="p-3">
        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--c-muted)]">{proyecto.descripcion}</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--c-surface2)]" style={{ color }}>
              <Crown size={15} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[var(--c-text)]">{proyecto.creador}</p>
              <p className="text-[10px] text-[var(--c-muted)]">Creador</p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[var(--c-surface2)] px-2.5 py-1.5 text-xs font-bold text-[var(--c-text)]">
            <Users size={14} />
            {proyecto.miembros}
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-[var(--c-muted)]">
            <span>Avance</span>
            <span>{proyecto.progreso}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--c-surface2)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${proyecto.progreso}%` }}
              transition={{ duration: 0.7, delay: 0.1 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}, ${estadoColor})` }}
            />
          </div>
        </div>
      </div>
    </motion.article>
  )
}
