'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Check,
  CircleCheck,
  Loader2,
  PenLine,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, type FormEvent } from 'react'

import { RamaSelector, type RamaSelection } from '@/components/ramas/RamaSelector'
import { RolBadge } from '@/components/ramas/RolBadge'
import {
  RAMAS_ARTISTICAS,
  ROLES_JERARQUIA,
  type RamaId,
  type RolJerarquia,
} from '@/lib/ramas'

const STEPS = [
  { label: 'Perfil', icon: UserRound },
  { label: 'Rol', icon: Sparkles },
  { label: 'Rama', icon: PenLine },
  { label: 'Confirmar', icon: Check },
] as const

const ROLE_OPTIONS = ['creador', 'trabajador', 'espectador'] as const satisfies readonly RolJerarquia[]
const LAST_STEP = STEPS.length - 1
const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/

interface OnboardingForm {
  name: string
  username: string
  bio: string
  role: RolJerarquia | null
  rama: RamaSelection | null
}

interface SubmitPayload {
  name: string
  username: string
  bio: string
  role: RolJerarquia
  artistic_role: string
  rama: RamaId
  subtitulo: string
}

export default function OnboardingPage(): JSX.Element {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<OnboardingForm>({
    name: '',
    username: '',
    bio: '',
    role: null,
    rama: null,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdUsername, setCreatedUsername] = useState<string | null>(null)

  const selectedRama = useMemo(() => {
    if (!form.rama) {
      return undefined
    }

    return RAMAS_ARTISTICAS.find((rama) => rama.id === form.rama?.ramaId)
  }, [form.rama])

  const currentStepError = getStepError(step, form)
  const isComplete = createdUsername !== null

  const updateField = (field: keyof Pick<OnboardingForm, 'name' | 'username' | 'bio'>, value: string): void => {
    setError(null)
    setForm((current) => ({
      ...current,
      [field]: field === 'username' ? normalizeUsernameInput(value) : value,
    }))
  }

  const selectRole = (role: RolJerarquia): void => {
    setError(null)
    setForm((current) => ({ ...current, role }))
  }

  const selectRama = (selection: RamaSelection): void => {
    setError(null)
    setForm((current) => ({ ...current, rama: selection }))
  }

  const goBack = (): void => {
    setError(null)
    setStep((current) => Math.max(0, current - 1))
  }

  const goNext = (): void => {
    if (currentStepError) {
      setError(currentStepError)
      return
    }

    setError(null)
    setStep((current) => Math.min(LAST_STEP, current + 1))
  }

  const handleSubmit = async (): Promise<void> => {
    const payload = toPayload(form)

    if (!payload) {
      setError('Completa todos los pasos antes de crear tu perfil.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result: unknown = await response.json().catch(() => null)

      if (!response.ok) {
        setError(readApiError(result) ?? 'No se pudo completar el onboarding.')
        return
      }

      setCreatedUsername(readCreatedUsername(result) ?? payload.username)
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (isSubmitting || isComplete) {
      return
    }

    if (step === LAST_STEP) {
      void handleSubmit()
      return
    }

    goNext()
  }

  const goToProfile = (): void => {
    const username = createdUsername ?? form.username
    router.push(`/profile?u=${encodeURIComponent(username)}`)
  }

  return (
    <div className="app-shell bg-[var(--c-bg)]">
      <main className="flex-1 overflow-y-auto px-4 pb-6 pt-5 safe-top">
        <header className="space-y-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-normal text-[var(--toon-orange)]">
              Toonimatics
            </p>
            <h1
              className="mt-1 text-3xl font-black leading-tight text-[var(--c-text)]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Configura tu perfil artistico
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--c-muted)]">
              Tu ficha ayuda a conectar proyectos, ramas y colaboraciones dentro de la comunidad.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2" aria-label="Progreso de onboarding">
            {STEPS.map((item, index) => {
              const Icon = item.icon
              const isActive = index === step
              const isDone = index < step || isComplete

              return (
                <div
                  key={item.label}
                  className="min-w-0 rounded-lg border px-2 py-2"
                  style={{
                    background: isActive || isDone ? 'var(--c-surface2)' : 'transparent',
                    borderColor: isActive || isDone ? 'var(--toon-orange)' : 'var(--c-border)',
                  }}
                >
                  <div className="flex items-center justify-center">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{
                        background: isDone ? 'var(--toon-orange)' : 'var(--c-surface)',
                        color: isDone ? '#ffffff' : 'var(--c-text)',
                      }}
                    >
                      <Icon size={14} strokeWidth={2.5} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-1 truncate text-center text-[10px] font-bold text-[var(--c-muted)]">
                    {item.label}
                  </p>
                </div>
              )
            })}
          </div>
        </header>

        <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <SuccessStep key="success" username={createdUsername} onProfile={goToProfile} />
            ) : (
              <motion.section
                key={step}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-[430px]"
              >
                {step === 0 ? (
                  <ProfileStep form={form} disabled={isSubmitting} onChange={updateField} />
                ) : null}
                {step === 1 ? (
                  <RoleStep selectedRole={form.role} disabled={isSubmitting} onSelect={selectRole} />
                ) : null}
                {step === 2 ? (
                  <RamaStep selection={form.rama} disabled={isSubmitting} onChange={selectRama} />
                ) : null}
                {step === 3 ? (
                  <ConfirmStep form={form} selectedRamaName={selectedRama?.nombre ?? null} />
                ) : null}
              </motion.section>
            )}
          </AnimatePresence>

          {error ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200"
              role="alert"
            >
              {error}
            </motion.p>
          ) : null}

          {!isComplete ? (
            <footer className="flex items-center gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={goBack}
                disabled={step === 0 || isSubmitting}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Volver"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </motion.button>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting || currentStepError !== null}
                className="toon-gradient-bg flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={17} aria-hidden="true" /> : null}
                <span className="truncate">
                  {step === LAST_STEP ? (isSubmitting ? 'Creando perfil' : 'Crear perfil') : 'Continuar'}
                </span>
                {!isSubmitting ? <ArrowRight size={17} aria-hidden="true" /> : null}
              </motion.button>
            </footer>
          ) : null}
        </form>
      </main>
    </div>
  )
}

function ProfileStep({
  form,
  disabled,
  onChange,
}: {
  form: OnboardingForm
  disabled: boolean
  onChange: (field: keyof Pick<OnboardingForm, 'name' | 'username' | 'bio'>, value: string) => void
}): JSX.Element {
  return (
    <div className="space-y-5">
      <StepHeading
        eyebrow="Paso 1"
        title="Identidad publica"
        text="Usa un nombre reconocible y una bio breve para presentarte."
      />

      <div className="space-y-4">
        <Field label="Nombre">
          <input
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            disabled={disabled}
            required
            maxLength={80}
            placeholder="Nombre artistico o real"
            className="h-12 w-full rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] px-3 text-sm font-semibold text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[var(--toon-orange)] disabled:opacity-60"
          />
        </Field>

        <Field label="Username">
          <div className="flex h-12 items-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] px-3 transition-colors focus-within:border-[var(--toon-orange)]">
            <AtSign size={16} className="mr-2 flex-shrink-0 text-[var(--c-muted)]" aria-hidden="true" />
            <input
              value={form.username}
              onChange={(event) => onChange('username', event.target.value)}
              disabled={disabled}
              required
              maxLength={24}
              placeholder="usuario_latam"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--c-text)] outline-none placeholder:text-[var(--c-muted)] disabled:opacity-60"
            />
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--c-muted)]">
            Letras minusculas, numeros y guion bajo.
          </p>
        </Field>

        <Field label="Bio">
          <textarea
            value={form.bio}
            onChange={(event) => onChange('bio', event.target.value)}
            disabled={disabled}
            required
            maxLength={280}
            placeholder="Cuenta que haces, que buscas o que tipo de proyectos te interesan."
            className="min-h-[132px] w-full resize-none rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] px-3 py-3 text-sm font-medium leading-relaxed text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[var(--toon-orange)] disabled:opacity-60"
          />
          <p className="mt-1 text-right text-[11px] text-[var(--c-muted)]">{form.bio.length}/280</p>
        </Field>
      </div>
    </div>
  )
}

function RoleStep({
  selectedRole,
  disabled,
  onSelect,
}: {
  selectedRole: RolJerarquia | null
  disabled: boolean
  onSelect: (role: RolJerarquia) => void
}): JSX.Element {
  return (
    <div className="space-y-5">
      <StepHeading
        eyebrow="Paso 2"
        title="Tu rol en la comunidad"
        text="Elige como quieres participar inicialmente en Toonimatics."
      />

      <div className="space-y-3">
        {ROLE_OPTIONS.map((role) => {
          const isSelected = selectedRole === role

          return (
            <motion.button
              key={role}
              type="button"
              whileTap={disabled ? undefined : { scale: 0.98 }}
              onClick={() => onSelect(role)}
              disabled={disabled}
              aria-pressed={isSelected}
              className="w-full rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: isSelected ? 'var(--c-surface2)' : 'var(--c-surface)',
                borderColor: isSelected ? 'var(--toon-orange)' : 'var(--c-border)',
              }}
            >
              <span className="flex items-start justify-between gap-3">
                <RolBadge rol={role} size="md" />
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border"
                  style={{
                    background: isSelected ? 'var(--toon-orange)' : 'transparent',
                    borderColor: isSelected ? 'var(--toon-orange)' : 'var(--c-border)',
                    color: isSelected ? '#ffffff' : 'var(--c-muted)',
                  }}
                >
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                </span>
              </span>
              <span className="mt-3 block text-sm leading-relaxed text-[var(--c-muted)]">
                {ROLES_JERARQUIA[role].descripcion}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function RamaStep({
  selection,
  disabled,
  onChange,
}: {
  selection: RamaSelection | null
  disabled: boolean
  onChange: (selection: RamaSelection) => void
}): JSX.Element {
  return (
    <div className="space-y-5">
      <StepHeading
        eyebrow="Paso 3"
        title="Rama y titulo"
        text="Marca tu especialidad principal para aparecer en busquedas y proyectos correctos."
      />

      <RamaSelector value={selection} onChange={onChange} disabled={disabled} />
    </div>
  )
}

function ConfirmStep({
  form,
  selectedRamaName,
}: {
  form: OnboardingForm
  selectedRamaName: string | null
}): JSX.Element {
  return (
    <div className="space-y-5">
      <StepHeading
        eyebrow="Paso 4"
        title="Confirma tu perfil"
        text="Revisa los datos antes de crear tu cuenta en la comunidad."
      />

      <div className="space-y-3">
        <SummaryRow label="Nombre" value={form.name.trim()} />
        <SummaryRow label="Username" value={`@${form.username}`} />
        <SummaryRow label="Bio" value={form.bio.trim()} />

        <div className="rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] p-4">
          <p className="text-[11px] font-black uppercase tracking-normal text-[var(--c-muted)]">Rol</p>
          <div className="mt-2">{form.role ? <RolBadge rol={form.role} size="md" /> : null}</div>
        </div>

        <div className="rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] p-4">
          <p className="text-[11px] font-black uppercase tracking-normal text-[var(--c-muted)]">
            Rama artistica
          </p>
          <p className="mt-2 text-sm font-black text-[var(--c-text)]">{selectedRamaName ?? 'Sin rama'}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--toon-orange)]">
            {form.rama?.subtitulo ?? 'Sin titulo'}
          </p>
        </div>
      </div>
    </div>
  )
}

function SuccessStep({
  username,
  onProfile,
}: {
  username: string | null
  onProfile: () => void
}): JSX.Element {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[430px] flex-col justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] p-6 text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-black">
        <CircleCheck size={28} strokeWidth={2.5} aria-hidden="true" />
      </div>
      <h2
        className="mt-5 text-2xl font-black leading-tight text-[var(--c-text)]"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        Perfil creado
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--c-muted)]">
        {username ? `@${username} ya esta listo para la comunidad Toonimatics.` : 'Tu perfil ya esta listo.'}
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onProfile}
        className="toon-gradient-bg mt-6 flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black text-white"
      >
        Ver perfil
        <ArrowRight size={17} aria-hidden="true" />
      </motion.button>
    </motion.section>
  )
}

function StepHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text: string
}): JSX.Element {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-normal text-[var(--toon-orange)]">{eyebrow}</p>
      <h2
        className="mt-1 text-2xl font-black leading-tight text-[var(--c-text)]"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--c-muted)]">{text}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-normal text-[var(--c-muted)]">
        {label}
      </span>
      {children}
    </label>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] p-4">
      <p className="text-[11px] font-black uppercase tracking-normal text-[var(--c-muted)]">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold leading-relaxed text-[var(--c-text)]">{value}</p>
    </div>
  )
}

function getStepError(step: number, form: OnboardingForm): string | null {
  if (step === 0) {
    const name = form.name.trim()
    const bio = form.bio.trim()

    if (name.length < 2 || name.length > 80) {
      return 'Agrega un nombre de 2 a 80 caracteres.'
    }

    if (!USERNAME_PATTERN.test(form.username)) {
      return 'El username debe tener 3 a 24 caracteres: letras, numeros o guion bajo.'
    }

    if (bio.length === 0 || bio.length > 280) {
      return 'Agrega una bio de hasta 280 caracteres.'
    }
  }

  if (step === 1 && !form.role) {
    return 'Selecciona tu rol dentro de la comunidad.'
  }

  if (step === 2 && !form.rama) {
    return 'Selecciona una rama artistica y un titulo.'
  }

  if (step === 3 && !toPayload(form)) {
    return 'Completa todos los pasos antes de crear tu perfil.'
  }

  return null
}

function toPayload(form: OnboardingForm): SubmitPayload | null {
  const name = form.name.trim()
  const bio = form.bio.trim()

  if (!name || !USERNAME_PATTERN.test(form.username) || !bio || !form.role || !form.rama) {
    return null
  }

  return {
    name,
    username: form.username,
    bio,
    role: form.role,
    artistic_role: form.rama.subtitulo,
    rama: form.rama.ramaId,
    subtitulo: form.rama.subtitulo,
  }
}

function normalizeUsernameInput(value: string): string {
  return value
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24)
}

function readApiError(value: unknown): string | null {
  if (!isRecord(value)) {
    return null
  }

  return typeof value.error === 'string' ? value.error : null
}

function readCreatedUsername(value: unknown): string | null {
  if (!isRecord(value) || !isRecord(value.user)) {
    return null
  }

  return typeof value.user.username === 'string' ? value.user.username : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
