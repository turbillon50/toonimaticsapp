'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { MessageChat } from './types'

type ChatFilter = 'todos' | 'no-leidos' | 'grupos'

interface MessagesClientProps {
  initialChats: MessageChat[]
  isAuthenticated: boolean
}

const FILTERS: Array<{ id: ChatFilter; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'no-leidos', label: 'No leidos' },
  { id: 'grupos', label: 'Grupos' },
]

export default function MessagesClient({ initialChats, isAuthenticated }: MessagesClientProps) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('todos')
  const normalizedQuery = normalizeText(query)

  const unreadChats = useMemo(
    () => initialChats.filter((chat) => chat.unreadCount > 0).length,
    [initialChats],
  )
  const groupChats = useMemo(
    () => initialChats.filter((chat) => chat.kind === 'group').length,
    [initialChats],
  )
  const filteredChats = useMemo(() => {
    return initialChats.filter((chat) => {
      const matchesFilter =
        activeFilter === 'todos' ||
        (activeFilter === 'no-leidos' && chat.unreadCount > 0) ||
        (activeFilter === 'grupos' && chat.kind === 'group')
      const searchable = `${chat.name} ${chat.lastMessage}`
      const matchesQuery = !normalizedQuery || normalizeText(searchable).includes(normalizedQuery)

      return matchesFilter && matchesQuery
    })
  }, [activeFilter, initialChats, normalizedQuery])

  return (
    <div className="safe-top mx-auto flex min-h-full w-full max-w-3xl flex-col px-3 pb-5 text-[var(--c-text)] sm:px-4">
      <section aria-label="Buscar conversaciones" className="space-y-3">
        <label className="relative block">
          <span className="sr-only">Buscar conversaciones</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--c-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conversaciones"
            className="h-12 w-full rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] pl-10 pr-3 text-sm font-semibold text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[var(--toon-orange)]"
          />
        </label>

        <div
          className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] p-1"
          role="tablist"
          aria-label="Filtros de mensajes"
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id
            const count = getFilterCount(filter.id, initialChats.length, unreadChats, groupChats)

            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(filter.id)}
                className={`relative h-10 overflow-hidden rounded-md px-2 text-xs font-black transition-colors ${
                  isActive ? 'text-white' : 'text-[var(--c-muted)]'
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="messages-filter"
                    className="absolute inset-0 rounded-md toon-gradient-bg"
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : null}
                <span className="relative z-10 inline-flex max-w-full items-center justify-center gap-1.5">
                  <span className="truncate">{filter.label}</span>
                  <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] leading-none">
                    {count}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-4 flex-1" aria-live="polite">
        {!isAuthenticated ? (
          <EmptyState
            title="Sesion requerida"
            description="Inicia sesion para ver tus conversaciones."
            actionHref="/auth/signin"
            actionLabel="Iniciar sesion"
          />
        ) : initialChats.length === 0 ? (
          <EmptyState
            title="Sin conversaciones"
            description="Tus chats de proyectos y colaboradores apareceran aqui."
          />
        ) : filteredChats.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description="No hay conversaciones con ese filtro."
          />
        ) : (
          <motion.ul layout className="space-y-2">
            <AnimatePresence initial={false}>
              {filteredChats.map((chat, index) => (
                <ConversationRow key={`${chat.kind}-${chat.id}`} chat={chat} index={index} />
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </section>
    </div>
  )
}

function ConversationRow({ chat, index }: { chat: MessageChat; index: number }) {
  const unread = chat.unreadCount > 0

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.99 }}
      transition={{ duration: 0.25, delay: index * 0.025, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/messages/${encodeURIComponent(chat.id)}`}
        aria-label={`Abrir conversacion ${chat.name}`}
        className={`flex min-h-[76px] items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
          unread
            ? 'border-[#1FD77A]/50 bg-[#112118]'
            : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-subtle)]'
        }`}
      >
        <ConversationAvatar chat={chat} />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className={`truncate text-sm leading-tight ${unread ? 'font-black' : 'font-bold'}`}>
                {chat.name}
              </h2>
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] font-semibold leading-snug text-[var(--c-muted)]">
                <CheckIcon
                  className={`h-3.5 w-3.5 flex-shrink-0 ${unread ? 'text-[#1FD77A]' : 'text-[var(--c-subtle)]'}`}
                />
                <span className={`truncate ${unread ? 'text-[var(--c-text)]' : ''}`}>
                  {chat.lastMessage}
                </span>
              </p>
            </div>

            <div className="flex flex-shrink-0 flex-col items-end gap-1">
              <time
                dateTime={chat.lastMessageAt}
                className={`text-[10px] font-bold ${unread ? 'text-[#1FD77A]' : 'text-[var(--c-muted)]'}`}
              >
                {formatChatTime(chat.lastMessageAt)}
              </time>
              {unread ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1FD77A] px-1.5 text-[10px] font-black leading-none text-black">
                  {formatUnreadCount(chat.unreadCount)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-2 flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-normal text-[var(--c-muted)]">
            {chat.kind === 'group' ? (
              <span className="inline-flex min-w-0 items-center gap-1 rounded-md bg-black/20 px-2 py-1">
                <GroupIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{formatMembers(chat.memberCount)}</span>
              </span>
            ) : (
              <span className="rounded-md bg-black/20 px-2 py-1">Chat</span>
            )}
          </div>
        </div>
      </Link>
    </motion.li>
  )
}

function ConversationAvatar({ chat }: { chat: MessageChat }) {
  const [failed, setFailed] = useState(false)
  const src = chat.avatarUrl?.trim()

  return (
    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)]">
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="48px"
          unoptimized
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center toon-gradient-bg text-sm font-black text-white">
          {chat.kind === 'group' ? <GroupIcon className="h-5 w-5" /> : getInitials(chat.name)}
        </div>
      )}
      {chat.kind === 'group' ? (
        <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-tl-md bg-black/80 text-white">
          <GroupIcon className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </div>
  )
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] px-5 py-10 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--c-surface2)] text-[var(--c-muted)]">
        <GroupIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-base font-black text-[var(--c-text)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-[var(--c-muted)]">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-black toon-gradient-bg text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </motion.div>
  )
}

function getFilterCount(filter: ChatFilter, total: number, unread: number, groups: number): number {
  if (filter === 'no-leidos') {
    return unread
  }

  if (filter === 'grupos') {
    return groups
  }

  return total
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function formatChatTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) {
    return new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
    }).format(date)
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date)
}

function formatUnreadCount(count: number): string {
  return count > 99 ? '99+' : count.toString()
}

function formatMembers(count: number): string {
  return count === 1 ? '1 miembro' : `${count} miembros`
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return initials || 'TM'
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function GroupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 11.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.75 19.25c.55-3.1 2.55-5.1 5.75-5.1s5.2 2 5.75 5.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.25 11.25a2.75 2.75 0 1 0 0-5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.5 14.35c2.15.42 3.55 2.05 3.95 4.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5l4.2 4.2L19 6.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
