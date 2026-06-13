'use client'

import { motion } from 'framer-motion'
import { Film, Heart, Image as ImageIcon, MessageCircle, Music2, Play } from 'lucide-react'
import Image from 'next/image'
import type { CSSProperties } from 'react'

import type { Lang } from '@/lib/i18n'
import { getRama, type RamaId } from '@/lib/ramas'

export type PortfolioTipo = 'imagen' | 'animacion' | 'audio'

export interface PortfolioItem {
  id: string
  tipo: PortfolioTipo
  titulo: string
  descripcion: string
  thumbnailUrl?: string
  audioUrl?: string
  duracion?: string
  likes: number
  comentarios: number
  ramaId: RamaId
  publicado: string
}

interface PortfolioGridProps {
  items: PortfolioItem[]
  lang: Lang
}

function formatMetric(value: number): string {
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

function tipoLabel(tipo: PortfolioTipo, lang: Lang): string {
  const labels: Record<PortfolioTipo, { es: string; en: string }> = {
    imagen: { es: 'imagen', en: 'image' },
    animacion: { es: 'animación', en: 'animation' },
    audio: { es: 'audio', en: 'audio' },
  }

  return labels[tipo][lang]
}

export function PortfolioGrid({ items, lang }: PortfolioGridProps): JSX.Element {
  const visualItems = items.filter((item) => item.tipo !== 'audio')
  const audioItems = items.filter((item) => item.tipo === 'audio')

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5">
        {visualItems.map((item, index) => (
          <VisualPortfolioCard key={item.id} item={item} index={index} lang={lang} />
        ))}
      </div>

      {audioItems.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--c-muted)]">
            <Music2 size={14} aria-hidden="true" />
            {lang === 'es' ? 'Audio publicado' : 'Published audio'}
          </div>
          <div className="space-y-2.5">
            {audioItems.map((item, index) => (
              <AudioPortfolioCard key={item.id} item={item} index={index} lang={lang} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function VisualPortfolioCard({
  item,
  index,
  lang,
}: {
  item: PortfolioItem
  index: number
  lang: Lang
}): JSX.Element {
  const rama = getRama(item.ramaId)
  const color = rama?.color ?? '#FF6B00'
  const metaStyle = {
    backgroundColor: withAlpha(color, 0.9),
  } satisfies CSSProperties
  const Icon = item.tipo === 'animacion' ? Film : ImageIcon

  return (
    <motion.article
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      className="overflow-hidden rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)]"
    >
      <div className="relative aspect-[4/5] bg-[var(--c-surface2)]">
        {item.thumbnailUrl ? (
          <Image src={item.thumbnailUrl} alt={item.titulo} fill sizes="190px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--c-muted)]">
            <Icon size={28} aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent" />
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase text-white" style={metaStyle}>
          <Icon size={12} aria-hidden="true" />
          {tipoLabel(item.tipo, lang)}
        </div>
        {item.duracion ? (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-1 text-[10px] font-bold text-white">
            <Play size={10} fill="currentColor" aria-hidden="true" />
            {item.duracion}
          </div>
        ) : null}
      </div>

      <div className="p-3">
        <p className="line-clamp-2 min-h-[2.25rem] text-xs font-black leading-tight text-[var(--c-text)]">
          {item.titulo}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--c-muted)]">{item.descripcion}</p>
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-bold text-[var(--c-muted)]">
          <span>{item.publicado}</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Heart size={12} aria-hidden="true" />
              {formatMetric(item.likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle size={12} aria-hidden="true" />
              {formatMetric(item.comentarios)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function AudioPortfolioCard({
  item,
  index,
  lang,
}: {
  item: PortfolioItem
  index: number
  lang: Lang
}): JSX.Element {
  const rama = getRama(item.ramaId)
  const color = rama?.color ?? '#9C6B4A'
  const style = {
    borderColor: withAlpha(color, 0.36),
    background: `linear-gradient(135deg, ${withAlpha(color, 0.16)}, rgba(17,17,17,0.96))`,
  } satisfies CSSProperties

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.04 }}
      className="rounded-lg border p-3"
      style={style}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--c-surface2)]" style={{ color }}>
          <Music2 size={22} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[var(--c-text)]">{item.titulo}</p>
              <p className="mt-0.5 text-[11px] font-bold text-[var(--c-muted)]">
                {rama?.nombre ?? item.ramaId}
                {item.duracion ? ` · ${item.duracion}` : ''}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 text-[11px] font-bold text-[var(--c-muted)]">
              <span className="inline-flex items-center gap-1">
                <Heart size={12} aria-hidden="true" />
                {formatMetric(item.likes)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle size={12} aria-hidden="true" />
                {formatMetric(item.comentarios)}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--c-muted)]">{item.descripcion}</p>
        </div>
      </div>

      {item.audioUrl ? (
        <audio className="mt-3 h-9 w-full" controls preload="metadata" src={item.audioUrl}>
          {lang === 'es' ? 'Tu navegador no soporta audio HTML5.' : 'Your browser does not support HTML5 audio.'}
        </audio>
      ) : null}
    </motion.article>
  )
}
