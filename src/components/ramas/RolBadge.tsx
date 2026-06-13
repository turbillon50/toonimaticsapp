'use client'

import { motion } from 'framer-motion'
import { Crown, Eye, Hammer, type LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'

import { ROLES_JERARQUIA, type RolJerarquia } from '@/lib/ramas'

type RolBadgeSize = 'sm' | 'md'

export interface RolBadgeProps {
  rol: RolJerarquia
  size?: RolBadgeSize
  showLabel?: boolean
  className?: string
}

interface RolVisual {
  icon: LucideIcon
  color: string
  glow: string
  surface: string
}

const ROL_VISUALS: Record<RolJerarquia, RolVisual> = {
  creador: {
    icon: Crown,
    color: '#FFB020',
    glow: 'rgba(255, 176, 32, 0.28)',
    surface: 'linear-gradient(135deg, rgba(255,176,32,0.2), rgba(255,20,147,0.16))',
  },
  trabajador: {
    icon: Hammer,
    color: '#3B82E2',
    glow: 'rgba(59, 130, 226, 0.26)',
    surface: 'linear-gradient(135deg, rgba(59,130,226,0.18), rgba(139,92,246,0.14))',
  },
  espectador: {
    icon: Eye,
    color: '#9ACD32',
    glow: 'rgba(154, 205, 50, 0.22)',
    surface: 'linear-gradient(135deg, rgba(154,205,50,0.18), rgba(60,165,92,0.12))',
  },
}

const SIZE_CLASSES: Record<RolBadgeSize, string> = {
  sm: 'h-7 gap-1.5 px-2.5 text-[11px]',
  md: 'h-9 gap-2 px-3.5 text-xs',
}

const ICON_SIZES: Record<RolBadgeSize, number> = {
  sm: 13,
  md: 15,
}

export function RolBadge({
  rol,
  size = 'sm',
  showLabel = true,
  className = '',
}: RolBadgeProps): JSX.Element {
  const role = ROLES_JERARQUIA[rol]
  const visual = ROL_VISUALS[rol]
  const Icon = visual.icon
  const style = {
    background: visual.surface,
    borderColor: visual.color,
    boxShadow: `0 10px 26px ${visual.glow}`,
    color: visual.color,
  } satisfies CSSProperties

  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex max-w-full items-center rounded-full border font-black uppercase leading-none tracking-normal ${SIZE_CLASSES[size]} ${className}`}
      style={style}
      title={role.descripcion}
      aria-label={role.nombre}
    >
      <Icon aria-hidden="true" size={ICON_SIZES[size]} strokeWidth={2.4} />
      {showLabel ? <span className="min-w-0 truncate">{role.nombre}</span> : null}
    </motion.span>
  )
}
