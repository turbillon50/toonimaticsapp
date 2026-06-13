'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Check, CheckCircle2, Circle, Inbox, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { useApp } from '@/lib/context'
import type { MessageNotification } from './types'

type NotificationFilter = 'todas' | 'pendientes'

interface MessagesClientProps {
  initialNotifications: MessageNotification[]
  isAuthenticated: boolean
}

interface NotificationsResponse {
  notificaciones: MessageNotification[]
}

interface PatchResponse {
  notificacion: MessageNotification
}

const TIPO_LABELS_ES: Record<string, string> = {
  mensaje: 'Mensaje',
  proyecto: 'Proyecto',
  tarea: 'Tarea',
  puntos: 'Puntos',
  sistema: 'Sistema',
  verificacion: 'Verificacion',
}

const TIPO_LABELS_EN: Record<string, string> = {
  mensaje: 'Message',
  proyecto: 'Project',
  tarea: 'Task',
  puntos: 'Points',
  sistema: 'System',
  verificacion: 'Verification',
}

export default function MessagesClient({ initialNotifications, isAuthenticated }: MessagesClientProps) {
  const { lang } = useApp()
  const [notifications, setNotifications] = useState<MessageNotification[]>(initialNotifications)
  const [filter, setFilter] = useState<NotificationFilter>('todas')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.leida).length,
    [notifications],
  )
  const visibleNotifications = useMemo(
    () => (
      filter === 'pendientes'
        ? notifications.filter((notification) => !notification.leida)
        : notifications
    ),
    [filter, notifications],
  )
  const copy = getCopy(lang)

  async function refreshNotifications() {
    setIsRefreshing(true)
    setError(null)

    try {
      const response = await fetch('/api/notificaciones', { cache: 'no-store' })
      const data = (await response.json()) as unknown

      if (!response.ok || !isNotificationsResponse(data)) {
        throw new Error('refresh_failed')
      }

      setNotifications(data.notificaciones)
    } catch {
      setError(copy.refreshError)
    } finally {
      setIsRefreshing(false)
    }
  }

  async function markAsRead(id: string) {
    setPendingId(id)
    setError(null)

    try {
      const response = await fetch('/api/notificaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = (await response.json()) as unknown

      if (!response.ok || !isPatchResponse(data)) {
        throw new Error('patch_failed')
      }

      setNotifications((current) =>
        current.map((notification) => (
          notification.id === data.notificacion.id ? data.notificacion : notification
        )),
      )
    } catch {
      setError(copy.markError)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="px-3 py-3">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(17,17,17,0.98), rgba(26,26,26,0.84))',
          borderColor: 'var(--c-border)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--c-muted)]">
              {copy.kicker}
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-[var(--c-text)]">
              {copy.title}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-[var(--c-muted)]">
              {copy.subtitle}
            </p>
          </div>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl toon-gradient-bg text-white">
            <Bell size={21} aria-hidden="true" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <SummaryMetric label={copy.total} value={notifications.length.toString()} />
          <SummaryMetric label={copy.unread} value={unreadCount.toString()} />
        </div>
      </motion.section>

      <section className="mt-4 flex items-center gap-2">
        <div className="grid flex-1 grid-cols-2 gap-2">
          {(['todas', 'pendientes'] as NotificationFilter[]).map((item) => {
            const active = filter === item

            return (
              <motion.button
                key={item}
                type="button"
                aria-pressed={active}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilter(item)}
                className={`h-10 rounded-xl px-3 text-xs font-black transition-colors ${
                  active ? 'toon-gradient-bg text-white' : 'bg-[var(--c-surface2)] text-[var(--c-muted)]'
                }`}
              >
                {item === 'todas' ? copy.all : copy.pending}
              </motion.button>
            )
          })}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={refreshNotifications}
          disabled={isRefreshing || !isAuthenticated}
          aria-label={copy.refresh}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border bg-[var(--c-surface2)] text-[var(--c-text)] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderColor: 'var(--c-border)' }}
        >
          {isRefreshing ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw size={16} aria-hidden="true" />
          )}
        </motion.button>
      </section>

      {error ? (
        <p className="mt-3 rounded-xl border border-[#FF6B00]/25 bg-[#FF6B00]/10 px-3 py-2 text-xs font-semibold text-[#FFB070]">
          {error}
        </p>
      ) : null}

      <section className="mt-4 pb-5">
        {!isAuthenticated ? (
          <EmptyState
            title={copy.signedOutTitle}
            description={copy.signedOutDescription}
            actionLabel={copy.signIn}
            actionHref="/auth/signin"
          />
        ) : notifications.length === 0 ? (
          <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
        ) : visibleNotifications.length === 0 ? (
          <EmptyState title={copy.noPendingTitle} description={copy.noPendingDescription} compact />
        ) : (
          <motion.div layout className="space-y-2">
            <AnimatePresence initial={false}>
              {visibleNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  index={index}
                  lang={lang}
                  isPending={pendingId === notification.id}
                  onMarkRead={markAsRead}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-black/20 p-3" style={{ borderColor: 'var(--c-border)' }}>
      <p className="text-xl font-black text-[var(--c-text)]">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--c-muted)]">
        {label}
      </p>
    </div>
  )
}

function NotificationCard({
  notification,
  index,
  lang,
  isPending,
  onMarkRead,
}: {
  notification: MessageNotification
  index: number
  lang: 'es' | 'en'
  isPending: boolean
  onMarkRead: (id: string) => void
}) {
  const copy = getCopy(lang)
  const unread = !notification.leida

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: -10, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, scale: 0.98 }}
      transition={{ duration: 0.26, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border p-3 ${
        unread ? 'bg-[var(--c-surface)]' : 'bg-[var(--c-surface2)]/70'
      }`}
      style={{ borderColor: unread ? 'rgba(255,107,0,0.34)' : 'var(--c-border)' }}
    >
      <div className="flex gap-3">
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
            unread ? 'toon-gradient-bg text-white' : 'bg-[var(--c-surface)] text-[var(--c-muted)]'
          }`}
        >
          {unread ? <Bell size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate rounded-full bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--c-muted)]">
              {getTipoLabel(notification.tipo, lang)}
            </span>
            <time className="flex-shrink-0 text-[10px] font-medium text-[var(--c-muted)]" dateTime={notification.created_at}>
              {formatDate(notification.created_at, lang)}
            </time>
          </div>

          <p className="mt-2 text-sm font-semibold leading-snug text-[var(--c-text)]">
            {notification.mensaje}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--c-muted)]">
              {unread ? (
                <Circle size={8} fill="currentColor" aria-hidden="true" />
              ) : (
                <CheckCircle2 size={12} aria-hidden="true" />
              )}
              {unread ? copy.unreadStatus : copy.readStatus}
            </span>
            {unread ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onMarkRead(notification.id)}
                disabled={isPending}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 text-[11px] font-black text-[var(--c-text)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Check size={13} aria-hidden="true" />
                )}
                <span>{copy.markRead}</span>
              </motion.button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  compact = false,
}: {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  compact?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`rounded-2xl border bg-[var(--c-surface)] px-5 text-center ${
        compact ? 'py-8' : 'py-12'
      }`}
      style={{ borderColor: 'var(--c-border)' }}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--c-surface2)] text-[var(--c-muted)]">
        <Inbox size={24} aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-black text-[var(--c-text)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-[var(--c-muted)]">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-black toon-gradient-bg text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </motion.div>
  )
}

function getTipoLabel(tipo: string, lang: 'es' | 'en'): string {
  const labels = lang === 'es' ? TIPO_LABELS_ES : TIPO_LABELS_EN
  const normalized = tipo.trim().toLowerCase()

  return labels[normalized] ?? toTitleCase(normalized.replace(/[-_]+/g, ' '))
}

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function formatDate(value: string, lang: 'es' | 'en'): string {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-MX' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function getCopy(lang: 'es' | 'en') {
  if (lang === 'en') {
    return {
      kicker: 'Notifications',
      title: 'Community inbox',
      subtitle: 'Updates from projects, studio tasks, messages, and account activity.',
      total: 'Total',
      unread: 'Unread',
      all: 'All',
      pending: 'Unread',
      refresh: 'Refresh notifications',
      refreshError: 'Notifications could not be refreshed.',
      markError: 'The notification could not be marked as read.',
      signedOutTitle: 'Sign in required',
      signedOutDescription: 'Your community notifications are available after signing in.',
      signIn: 'Sign in',
      emptyTitle: 'No notifications yet',
      emptyDescription: 'When the community interacts with your work, updates will appear here.',
      noPendingTitle: 'No unread notifications',
      noPendingDescription: 'Everything in this inbox is already up to date.',
      unreadStatus: 'Unread',
      readStatus: 'Read',
      markRead: 'Mark read',
    }
  }

  return {
    kicker: 'Notificaciones',
    title: 'Bandeja comunitaria',
    subtitle: 'Avisos de proyectos, tareas de studio, mensajes y actividad de cuenta.',
    total: 'Total',
    unread: 'Sin leer',
    all: 'Todas',
    pending: 'Sin leer',
    refresh: 'Actualizar notificaciones',
    refreshError: 'No se pudieron actualizar las notificaciones.',
    markError: 'No se pudo marcar la notificacion como leida.',
    signedOutTitle: 'Sesion requerida',
    signedOutDescription: 'Tus notificaciones de comunidad estaran disponibles al iniciar sesion.',
    signIn: 'Iniciar sesion',
    emptyTitle: 'Sin notificaciones por ahora',
    emptyDescription: 'Cuando la comunidad interactue con tu obra, los avisos apareceran aqui.',
    noPendingTitle: 'No hay pendientes',
    noPendingDescription: 'Todas las notificaciones de esta bandeja ya estan al dia.',
    unreadStatus: 'Sin leer',
    readStatus: 'Leida',
    markRead: 'Marcar leida',
  }
}

function isNotificationsResponse(value: unknown): value is NotificationsResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.notificaciones) &&
    value.notificaciones.every(isMessageNotification)
  )
}

function isPatchResponse(value: unknown): value is PatchResponse {
  return isRecord(value) && isMessageNotification(value.notificacion)
}

function isMessageNotification(value: unknown): value is MessageNotification {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.user_id === 'string' &&
    typeof value.tipo === 'string' &&
    typeof value.mensaje === 'string' &&
    typeof value.leida === 'boolean' &&
    typeof value.created_at === 'string'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
