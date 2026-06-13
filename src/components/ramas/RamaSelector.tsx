'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'
import type { CSSProperties } from 'react'

import { RAMAS_ARTISTICAS, variarColor, type Rama, type RamaId } from '@/lib/ramas'

export interface RamaSelection {
  ramaId: RamaId
  subtitulo: string
}

export interface RamaSelectorFormNames {
  ramaId: string
  subtitulo: string
}

export interface RamaSelectorProps {
  value?: RamaSelection | null
  defaultValue?: Partial<RamaSelection> | null
  onChange?: (selection: RamaSelection) => void
  disabled?: boolean
  className?: string
  formNames?: RamaSelectorFormNames
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

function readableTextColor(hex: string): '#111111' | '#FFFFFF' {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.62 ? '#111111' : '#FFFFFF'
}

function findRama(ramaId: RamaId | null): Rama | undefined {
  return RAMAS_ARTISTICAS.find((rama) => rama.id === ramaId)
}

export function RamaSelector({
  value,
  defaultValue = null,
  onChange,
  disabled = false,
  className = '',
  formNames,
}: RamaSelectorProps): JSX.Element {
  const isControlled = value !== undefined
  const [internalSelection, setInternalSelection] = useState<RamaSelection | null>(() => {
    if (!defaultValue?.ramaId) return null

    const defaultRama = findRama(defaultValue.ramaId)
    if (!defaultRama) return null

    return {
      ramaId: defaultRama.id,
      subtitulo: defaultValue.subtitulo ?? defaultRama.subtitulos[0] ?? '',
    }
  })
  const selection = isControlled ? value ?? null : internalSelection
  const selectedRama = selection ? findRama(selection.ramaId) : undefined

  const commitSelection = (nextSelection: RamaSelection): void => {
    if (!isControlled) {
      setInternalSelection(nextSelection)
    }

    onChange?.(nextSelection)
  }

  const selectRama = (rama: Rama): void => {
    if (disabled) return

    commitSelection({
      ramaId: rama.id,
      subtitulo: rama.subtitulos[0] ?? '',
    })
  }

  const selectSubtitulo = (subtitulo: string): void => {
    if (disabled || !selectedRama) return

    commitSelection({
      ramaId: selectedRama.id,
      subtitulo,
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {formNames && selection ? (
        <>
          <input type="hidden" name={formNames.ramaId} value={selection.ramaId} />
          <input type="hidden" name={formNames.subtitulo} value={selection.subtitulo} />
        </>
      ) : null}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase leading-none tracking-normal" style={{ color: 'var(--c-muted)' }}>
            Rama artistica
          </p>
          {selectedRama ? (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="truncate text-[11px] font-bold"
              style={{ color: selectedRama.color }}
            >
              {selectedRama.colorNombre}
            </motion.span>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {RAMAS_ARTISTICAS.map((rama) => {
            const isSelected = selection?.ramaId === rama.id
            const style = {
              background: isSelected
                ? `linear-gradient(135deg, ${withAlpha(rama.color, 0.32)}, ${withAlpha(rama.color, 0.12)})`
                : 'var(--c-surface)',
              borderColor: isSelected ? rama.color : 'var(--c-border)',
              boxShadow: isSelected ? `0 14px 34px ${withAlpha(rama.color, 0.2)}` : 'none',
            } satisfies CSSProperties

            return (
              <motion.button
                key={rama.id}
                type="button"
                whileTap={disabled ? undefined : { scale: 0.97 }}
                onClick={() => selectRama(rama)}
                disabled={disabled}
                aria-pressed={isSelected}
                className="relative min-h-[82px] overflow-hidden rounded-2xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={style}
              >
                <span
                  className="absolute -right-4 -top-5 h-16 w-16 rounded-full blur-xl"
                  style={{ backgroundColor: withAlpha(rama.color, isSelected ? 0.34 : 0.16) }}
                />
                <span className="relative z-10 flex h-full flex-col justify-between gap-3">
                  <span className="flex items-start justify-between gap-2">
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: rama.color }} />
                    {isSelected ? (
                      <motion.span
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: rama.color, color: readableTextColor(rama.color) }}
                      >
                        <Check aria-hidden="true" size={13} strokeWidth={3} />
                      </motion.span>
                    ) : null}
                  </span>
                  <span className="text-sm font-black leading-tight" style={{ color: 'var(--c-text)' }}>
                    {rama.nombre}
                  </span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedRama ? (
          <motion.div
            key={selectedRama.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal" style={{ color: 'var(--c-muted)' }}>
              Titulo
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedRama.subtitulos.map((subtitulo, index) => {
                const isSelected = selection?.subtitulo === subtitulo
                const color = variarColor(selectedRama.color, index % 2 === 0 ? 0.05 : -0.04)
                const style = {
                  background: isSelected ? color : withAlpha(selectedRama.color, 0.1),
                  borderColor: isSelected ? color : withAlpha(selectedRama.color, 0.28),
                  color: isSelected ? readableTextColor(color) : 'var(--c-text)',
                  boxShadow: isSelected ? `0 10px 26px ${withAlpha(selectedRama.color, 0.22)}` : 'none',
                } satisfies CSSProperties

                return (
                  <motion.button
                    key={subtitulo}
                    type="button"
                    whileTap={disabled ? undefined : { scale: 0.96 }}
                    onClick={() => selectSubtitulo(subtitulo)}
                    disabled={disabled}
                    aria-pressed={isSelected}
                    className="rounded-full border px-3 py-2 text-xs font-bold leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={style}
                  >
                    {subtitulo}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
