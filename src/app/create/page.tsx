'use client'

import BottomNav from '@/components/layout/BottomNav'
import { useApp } from '@/lib/context'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent, type FormEvent } from 'react'

type ProyectoEstado = 'en_proceso'
type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

interface FormState {
  nombre: string
  descripcion: string
  portada_url: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

interface ProyectoCreado {
  id: string
  creador_id: string
  nombre: string
  descripcion: string | null
  estado: ProyectoEstado
  portada_url: string | null
  created_at: string
}

interface CreateProyectoResponse {
  proyecto: ProyectoCreado
}

const ESTADO: ProyectoEstado = 'en_proceso'
const INITIAL_FORM: FormState = {
  nombre: '',
  descripcion: '',
  portada_url: '',
}

const COPY = {
  es: {
    header: 'Crear proyecto',
    eyebrow: 'Studio colaborativo',
    title: 'Nuevo proyecto',
    intro: 'Define la base del proyecto para abrirlo a colaboracion artistica.',
    name: 'Nombre',
    namePlaceholder: 'Ej. Corto animado Andes 2080',
    description: 'Descripcion',
    descriptionPlaceholder: 'Cuenta el tono, la idea y que tipo de equipo buscas.',
    status: 'Estado',
    statusValue: 'En proceso',
    cover: 'Portada opcional',
    coverPlaceholder: 'https://... o /hf/studio.webp',
    submit: 'Crear proyecto',
    submitting: 'Creando proyecto',
    success: 'Proyecto creado. Abriendo la galeria...',
    genericError: 'No se pudo crear el proyecto.',
    invalidResponse: 'El servidor respondio con un formato inesperado.',
    requiredName: 'Agrega un nombre.',
    requiredDescription: 'Agrega una descripcion.',
    longName: 'Usa 120 caracteres o menos.',
    longDescription: 'Usa 1000 caracteres o menos.',
    invalidCover: 'Usa una URL http(s) o una ruta que empiece con /.',
  },
  en: {
    header: 'Create project',
    eyebrow: 'Collaborative studio',
    title: 'New project',
    intro: 'Set the foundation for a project before opening it to artistic collaboration.',
    name: 'Name',
    namePlaceholder: 'Example: Andes 2080 animated short',
    description: 'Description',
    descriptionPlaceholder: 'Share the tone, idea, and what kind of team you need.',
    status: 'Status',
    statusValue: 'In progress',
    cover: 'Optional cover',
    coverPlaceholder: 'https://... or /hf/studio.webp',
    submit: 'Create project',
    submitting: 'Creating project',
    success: 'Project created. Opening the gallery...',
    genericError: 'The project could not be created.',
    invalidResponse: 'The server returned an unexpected format.',
    requiredName: 'Add a name.',
    requiredDescription: 'Add a description.',
    longName: 'Use 120 characters or fewer.',
    longDescription: 'Use 1000 characters or fewer.',
    invalidCover: 'Use an http(s) URL or a path that starts with /.',
  },
}

export default function CreatePage() {
  const router = useRouter()
  const { lang } = useApp()
  const tx = COPY[lang]
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')

  function updateField(field: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
      if (submitState === 'error') {
        setSubmitState('idle')
        setMessage('')
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateForm(form, tx)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitState('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/proyectos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          estado: ESTADO,
          portada_url: normalizeOptional(form.portada_url),
        }),
      })

      const data: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        setSubmitState('error')
        setMessage(getApiError(data, tx.genericError))
        return
      }

      if (!isCreateProyectoResponse(data)) {
        setSubmitState('error')
        setMessage(tx.invalidResponse)
        return
      }

      setSubmitState('success')
      setMessage(tx.success)
      router.push('/proyectos')
    } catch {
      setSubmitState('error')
      setMessage(tx.genericError)
    }
  }

  const isSubmitting = submitState === 'submitting'

  return (
    <div className="app-shell bg-[var(--c-bg)]">
      <header className="glass safe-top sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 pb-3 pt-1">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl toon-gradient-bg text-white">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--c-muted)]">{tx.eyebrow}</p>
            <h1 className="truncate text-lg font-black text-[var(--c-text)]">{tx.header}</h1>
          </div>
        </div>
      </header>

      <main className="page-content px-4 py-5">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--c-muted)]">{tx.eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black leading-tight text-[var(--c-text)]">{tx.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--c-muted)]">{tx.intro}</p>
        </motion.section>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="toon-card space-y-4 p-4"
        >
          <FieldBlock label={tx.name} error={errors.nombre}>
            <input
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={updateField('nombre')}
              placeholder={tx.namePlaceholder}
              maxLength={120}
              required
              disabled={isSubmitting}
              className="w-full rounded-xl border bg-[var(--c-surface2)] px-3.5 py-3 text-sm font-semibold text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[#FF6B00] disabled:opacity-60"
              style={{ borderColor: errors.nombre ? '#FF1493' : 'var(--c-border)' }}
            />
          </FieldBlock>

          <FieldBlock label={tx.description} error={errors.descripcion}>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={updateField('descripcion')}
              placeholder={tx.descriptionPlaceholder}
              maxLength={1000}
              required
              disabled={isSubmitting}
              rows={5}
              className="min-h-32 w-full resize-none rounded-xl border bg-[var(--c-surface2)] px-3.5 py-3 text-sm leading-relaxed text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[#FF6B00] disabled:opacity-60"
              style={{ borderColor: errors.descripcion ? '#FF1493' : 'var(--c-border)' }}
            />
          </FieldBlock>

          <div>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--c-muted)]">
              {tx.status}
            </span>
            <div className="flex items-center justify-between rounded-xl border border-[var(--c-border)] bg-[var(--c-surface2)] px-3.5 py-3">
              <span className="text-sm font-bold text-[var(--c-text)]">{tx.statusValue}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#F2C53D]" />
            </div>
          </div>

          <FieldBlock label={tx.cover} error={errors.portada_url}>
            <input
              id="portada_url"
              name="portada_url"
              value={form.portada_url}
              onChange={updateField('portada_url')}
              placeholder={tx.coverPlaceholder}
              maxLength={500}
              disabled={isSubmitting}
              className="w-full rounded-xl border bg-[var(--c-surface2)] px-3.5 py-3 text-sm text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[#FF6B00] disabled:opacity-60"
              style={{ borderColor: errors.portada_url ? '#FF1493' : 'var(--c-border)' }}
            />
          </FieldBlock>

          <AnimatePresence mode="popLayout">
            {message ? (
              <motion.p
                key={submitState}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                  submitState === 'success'
                    ? 'border-[#3CA55C]/40 bg-[#3CA55C]/10 text-[#8DE0A0]'
                    : 'border-[#FF1493]/40 bg-[#FF1493]/10 text-[#FF8BC5]'
                }`}
              >
                {message}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.97 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-black text-white toon-gradient-bg disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="block h-4 w-4 rounded-full border-2 border-white/35 border-t-white"
                />
                {tx.submitting}
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                {tx.submit}
              </>
            )}
          </motion.button>
        </motion.form>
      </main>

      <BottomNav />
    </div>
  )
}

function FieldBlock({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--c-muted)]">{label}</span>
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 block text-xs font-semibold text-[#FF8BC5]"
          >
            {error}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </label>
  )
}

function validateForm(form: FormState, tx: (typeof COPY)['es']): FormErrors {
  const errors: FormErrors = {}
  const nombre = form.nombre.trim()
  const descripcion = form.descripcion.trim()
  const portada = form.portada_url.trim()

  if (!nombre) {
    errors.nombre = tx.requiredName
  } else if (nombre.length > 120) {
    errors.nombre = tx.longName
  }

  if (!descripcion) {
    errors.descripcion = tx.requiredDescription
  } else if (descripcion.length > 1000) {
    errors.descripcion = tx.longDescription
  }

  if (portada && !isValidCoverPath(portada)) {
    errors.portada_url = tx.invalidCover
  }

  return errors
}

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

function isValidCoverPath(value: string): boolean {
  if (value.startsWith('/')) {
    return true
  }

  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isCreateProyectoResponse(value: unknown): value is CreateProyectoResponse {
  if (!isRecord(value) || !isRecord(value.proyecto)) {
    return false
  }

  const proyecto = value.proyecto

  return (
    typeof proyecto.id === 'string' &&
    typeof proyecto.creador_id === 'string' &&
    typeof proyecto.nombre === 'string' &&
    proyecto.estado === ESTADO &&
    typeof proyecto.created_at === 'string'
  )
}

function getApiError(value: unknown, fallback: string): string {
  if (isRecord(value) && typeof value.error === 'string' && value.error.trim()) {
    return value.error
  }

  return fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
