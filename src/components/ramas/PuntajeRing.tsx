'use client'

import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

export interface PuntajeRingProps {
  puntos: number
  meta: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

function getProgressColor(progress: number): string {
  if (progress >= 1) return '#3CA55C'
  if (progress >= 0.66) return '#FF6B00'
  if (progress >= 0.33) return '#F2C53D'

  return '#E23B3B'
}

export function PuntajeRing({
  puntos,
  meta,
  size = 112,
  strokeWidth = 10,
  label = 'titulo activo',
  className = '',
}: PuntajeRingProps): JSX.Element {
  const safePuntos = Math.max(0, Math.round(puntos))
  const safeMeta = Math.max(1, Math.round(meta))
  const safeSize = Math.max(48, Math.round(size))
  const safeStrokeWidth = Math.max(4, Math.min(Math.round(strokeWidth), safeSize / 3))
  const progress = Math.min(safePuntos / safeMeta, 1)
  const percentage = Math.round(progress * 100)
  const radius = (safeSize - safeStrokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  const color = getProgressColor(progress)
  const center = safeSize / 2
  const svgStyle = {
    filter: `drop-shadow(0 12px 30px ${color}38)`,
  } satisfies CSSProperties

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      role="progressbar"
      aria-label={`Puntaje para mantener ${label}`}
      aria-valuemin={0}
      aria-valuemax={safeMeta}
      aria-valuenow={Math.min(safePuntos, safeMeta)}
    >
      <div className="relative" style={{ width: safeSize, height: safeSize }}>
        <svg width={safeSize} height={safeSize} viewBox={`0 0 ${safeSize} ${safeSize}`} className="-rotate-90" style={svgStyle}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--c-surface2)"
            strokeWidth={safeStrokeWidth}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={safeStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full">
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.24 }}
            className="text-2xl font-black leading-none"
            style={{ color: 'var(--c-text)' }}
          >
            {percentage}%
          </motion.span>
          <span className="mt-1 text-[10px] font-bold uppercase leading-none tracking-normal" style={{ color: 'var(--c-muted)' }}>
            {safePuntos}/{safeMeta}
          </span>
        </div>
      </div>

      <span className="max-w-[9rem] text-center text-[11px] font-bold leading-tight" style={{ color: 'var(--c-muted)' }}>
        {label}
      </span>
    </motion.div>
  )
}
