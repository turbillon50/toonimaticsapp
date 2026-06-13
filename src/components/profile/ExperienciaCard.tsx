'use client'

import { motion } from 'framer-motion'
import { Award, BriefcaseBusiness, CalendarDays, MapPin } from 'lucide-react'
import type { CSSProperties } from 'react'

import { getRama, variarColor, type RamaId } from '@/lib/ramas'

export interface ExperienciaItem {
  id: string
  titulo: string
  estudio: string
  periodo: string
  ubicacion: string
  ramaId: RamaId
  resumen: string
  logros: string[]
}

interface ExperienciaCardProps {
  experiencia: ExperienciaItem
  index?: number
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

export function ExperienciaCard({ experiencia, index = 0 }: ExperienciaCardProps): JSX.Element {
  const rama = getRama(experiencia.ramaId)
  const color = rama?.color ?? '#FF6B00'
  const titleColor = variarColor(color, 0.05)
  const cardStyle = {
    borderColor: withAlpha(color, 0.34),
    background: `linear-gradient(135deg, rgba(17,17,17,0.96), ${withAlpha(color, 0.12)})`,
  } satisfies CSSProperties
  const titleStyle = {
    backgroundColor: titleColor,
    color: textColorFor(titleColor),
  } satisfies CSSProperties

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.04 * index, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-lg border p-4"
      style={cardStyle}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--c-surface2)]" style={{ color }}>
          <BriefcaseBusiness size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2.5 py-1 text-[11px] font-black" style={titleStyle}>
              {experiencia.titulo}
            </span>
            <span className="text-[11px] font-bold text-[var(--c-muted)]">{rama?.nombre ?? experiencia.ramaId}</span>
          </div>
          <h3 className="mt-2 text-sm font-black leading-tight text-[var(--c-text)]">{experiencia.estudio}</h3>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-[var(--c-muted)]">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={13} aria-hidden="true" />
              {experiencia.periodo}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} aria-hidden="true" />
              {experiencia.ubicacion}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[var(--c-muted)]">{experiencia.resumen}</p>

      {experiencia.logros.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {experiencia.logros.map((logro) => (
            <span
              key={logro}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[var(--c-surface2)] px-2.5 py-1 text-[11px] font-bold text-[var(--c-text)]"
            >
              <Award size={12} style={{ color }} aria-hidden="true" />
              <span className="min-w-0 truncate">{logro}</span>
            </span>
          ))}
        </div>
      ) : null}
    </motion.article>
  )
}
