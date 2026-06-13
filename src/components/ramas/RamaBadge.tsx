'use client'

import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

import { getRama, variarColor, type RamaId } from '@/lib/ramas'

export interface RamaBadgeProps {
  ramaId: RamaId
  subtitulo: string
  className?: string
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

function readableTextColor(hex: string): '#111111' | '#FFFFFF' {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.62 ? '#111111' : '#FFFFFF'
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function RamaBadge({ ramaId, subtitulo, className = '' }: RamaBadgeProps): JSX.Element {
  const rama = getRama(ramaId)
  const color = rama?.color ?? '#444444'
  const softColor = variarColor(color, 0.1)
  const textColor = readableTextColor(softColor)
  const style = {
    background: `linear-gradient(135deg, ${softColor}, ${color})`,
    color: textColor,
    boxShadow: `0 10px 28px ${withAlpha(color, 0.24)}`,
  } satisfies CSSProperties

  return (
    <motion.span
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold leading-none shadow-sm ${className}`}
      style={style}
      title={rama ? `${rama.nombre} - ${subtitulo}` : subtitulo}
    >
      <span
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: textColor === '#111111' ? 'rgba(17,17,17,0.45)' : 'rgba(255,255,255,0.68)' }}
      />
      <span className="min-w-0 truncate">{subtitulo}</span>
    </motion.span>
  )
}
