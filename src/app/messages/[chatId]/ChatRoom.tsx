'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

import { RolBadge } from '@/components/ramas/RolBadge'
import type { RolJerarquia } from '@/lib/ramas'

export type ChatRoomMessageType = 'texto' | 'imagen' | 'audio' | 'video' | 'avance'
export type ChatRoomKind = 'directo' | 'grupo'

export interface ChatRoomChat {
  id: string
  kind: ChatRoomKind
  name: string
  projectId: string | null
  memberCount: number
}

export interface ChatRoomPerson {
  id: string
  name: string | null
  username: string | null
  avatarUrl: string | null
  artisticRole: string | null
  role: string | null
}

export type ChatRoomMember = ChatRoomPerson

export interface ChatRoomMessage {
  id: string
  chatId: string
  authorId: string
  content: string
  type: ChatRoomMessageType
  mediaUrl: string | null
  read: boolean
  createdAt: string
  author: ChatRoomPerson
}

interface ChatRoomProps {
  chat: ChatRoomChat
  currentUserId: string | null
  initialMessages: ChatRoomMessage[]
  members: ChatRoomMember[]
}

interface PostMessageResponse {
  mensaje?: ChatRoomMessage
  error?: string
}

const MESSAGE_PANEL_VARIANTS = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

export default function ChatRoom({
  chat,
  currentUserId,
  initialMessages,
  members,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatRoomMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null)
  const isGroup = chat.kind === 'grupo'

  const currentMember = useMemo(() => {
    return members.find((member) => member.id === currentUserId) ?? null
  }, [currentUserId, members])

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages.length])

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const content = draft.trim()

    if (!content || isSending || !currentUserId) {
      return
    }

    const optimisticId = `optimistic-${Date.now()}`
    const optimisticMessage: ChatRoomMessage = {
      id: optimisticId,
      chatId: chat.id,
      authorId: currentUserId,
      content,
      type: 'avance',
      mediaUrl: null,
      read: false,
      createdAt: new Date().toISOString(),
      author: currentMember ?? {
        id: currentUserId,
        name: 'Tu avance',
        username: null,
        avatarUrl: null,
        artisticRole: 'Artista',
        role: null,
      },
    }

    setError(null)
    setDraft('')
    setIsSending(true)
    setMessages((currentMessages) => [...currentMessages, optimisticMessage])

    try {
      const response = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chat.id,
          contenido: content,
          tipo: 'avance',
          media_url: null,
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as PostMessageResponse

      if (!response.ok || !payload.mensaje) {
        throw new Error(payload.error ?? 'No se pudo enviar el avance.')
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) => (message.id === optimisticId ? payload.mensaje! : message)),
      )
    } catch (sendError) {
      setMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== optimisticId),
      )
      setDraft(content)
      setError(sendError instanceof Error ? sendError.message : 'No se pudo enviar el avance.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--c-bg)] text-[var(--c-text)]">
      <header className="glass safe-top z-20 flex-shrink-0 px-3 pb-3">
        <div className="flex min-h-[54px] items-center gap-2">
          <Link
            href="/messages"
            aria-label="Volver a mensajes"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] text-[var(--c-text)]"
          >
            <BackIcon className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0">
                <h1 className="truncate text-base font-black leading-tight">{chat.name}</h1>
                <p className="mt-0.5 truncate text-[11px] font-bold text-[var(--c-muted)]">
                  {isGroup ? formatMemberCount(chat.memberCount) : formatDirectSubtitle(members, currentUserId)}
                </p>
              </div>
            </div>
          </div>

          {isGroup ? (
            <button
              type="button"
              aria-label="Abrir videollamada"
              onClick={() => setVideoModalOpen(true)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#FF6B00]/45 bg-[#24140C] text-[#FFB020] shadow-[0_0_26px_rgba(255,107,0,0.18)]"
            >
              <CameraIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {isGroup ? <MemberStrip members={members} /> : null}
      </header>

      <section
        aria-label="Mensajes del chat"
        className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
      >
        {messages.length === 0 ? (
          <EmptyThread />
        ) : (
          <motion.ul layout className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  index={index}
                  isOwn={message.authorId === currentUserId}
                  message={message}
                />
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
        <div ref={scrollAnchorRef} />
      </section>

      <footer className="flex-shrink-0 border-t border-[var(--c-border)] bg-[rgba(10,10,10,0.94)] px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-xl">
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 rounded-md border border-[#E23B3B]/40 bg-[#2A1010] px-3 py-2 text-xs font-bold text-[#FF9A9A]"
          >
            {error}
          </motion.p>
        ) : null}

        <form onSubmit={handleSend} className="flex items-end gap-2">
          <button
            type="button"
            aria-label="Adjuntar multimedia"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] text-[var(--c-muted)] transition-colors hover:text-[var(--c-text)]"
          >
            <PaperclipIcon className="h-5 w-5" />
          </button>

          <label className="min-w-0 flex-1">
            <span className="sr-only">Mensaje</span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={1}
              placeholder={currentUserId ? 'Escribe un avance' : 'Inicia sesion para enviar'}
              disabled={!currentUserId || isSending}
              className="max-h-28 min-h-11 w-full resize-none rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] px-3 py-3 text-sm font-semibold leading-snug text-[var(--c-text)] outline-none transition-colors placeholder:text-[var(--c-muted)] focus:border-[var(--toon-orange)] disabled:opacity-60"
            />
          </label>

          <button
            type="submit"
            disabled={!draft.trim() || !currentUserId || isSending}
            className="toon-gradient-bg flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-xs font-black text-white shadow-[0_14px_36px_rgba(255,20,147,0.22)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
          >
            <SendAdvanceIcon className="h-4 w-4" />
            <span>Enviar avance</span>
          </button>
        </form>
      </footer>

      <AnimatePresence>
        {videoModalOpen ? (
          <VideoCallModal onClose={() => setVideoModalOpen(false)} />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function MemberStrip({ members }: { members: ChatRoomMember[] }) {
  return (
    <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="Miembros del grupo">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex max-w-[210px] flex-shrink-0 items-center gap-2 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] px-2.5 py-2"
        >
          <Avatar person={member} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-black leading-tight text-[var(--c-text)]">
              @{member.username ?? 'artista'}
            </p>
            <div className="mt-1 flex min-w-0 items-center gap-1.5">
              <span className="truncate text-[10px] font-bold text-[var(--c-muted)]">
                {member.artisticRole ?? 'Artista'}
              </span>
              <RoleBadge role={member.role} compact />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MessageBubble({
  index,
  isOwn,
  message,
}: {
  index: number
  isOwn: boolean
  message: ChatRoomMessage
}) {
  return (
    <motion.li
      layout
      variants={MESSAGE_PANEL_VARIANTS}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.015, 0.12), ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn ? <Avatar person={message.author} size="md" /> : null}

      <article className={`min-w-0 max-w-[82%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn ? (
          <div className="mb-1.5 flex min-w-0 items-center gap-1.5">
            <span className="max-w-[110px] truncate text-xs font-black text-[var(--c-text)]">
              {formatPersonName(message.author)}
            </span>
            <span className="truncate text-[10px] font-bold text-[var(--c-muted)]">
              {message.author.artisticRole ?? 'Artista'}
            </span>
            <RoleBadge role={message.author.role} compact />
          </div>
        ) : null}

        <div
          className={`overflow-hidden rounded-lg border px-3 py-2.5 shadow-lg ${
            isOwn
              ? 'border-[#FF1493]/30 bg-gradient-to-br from-[#FF6B00] via-[#FF1493] to-[#8B00FF] text-white shadow-[#FF1493]/15'
              : 'border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] shadow-black/20'
          }`}
        >
          {message.type !== 'texto' ? (
            <p className={`mb-1 text-[10px] font-black uppercase tracking-normal ${isOwn ? 'text-white/72' : 'text-[var(--toon-orange)]'}`}>
              {formatMessageType(message.type)}
            </p>
          ) : null}

          <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-relaxed">
            {message.content}
          </p>

          {message.mediaUrl ? <MediaPreview message={message} /> : null}

          <time
            dateTime={message.createdAt}
            className={`mt-1.5 block text-right text-[10px] font-bold ${isOwn ? 'text-white/70' : 'text-[var(--c-muted)]'}`}
          >
            {formatMessageTime(message.createdAt)}
          </time>
        </div>
      </article>
    </motion.li>
  )
}

function MediaPreview({ message }: { message: ChatRoomMessage }) {
  if (!message.mediaUrl) {
    return null
  }

  if (message.type === 'imagen') {
    return (
      <div className="relative mt-2 aspect-[4/3] w-full min-w-[190px] overflow-hidden rounded-md bg-black/25">
        <Image
          src={message.mediaUrl}
          alt=""
          fill
          sizes="260px"
          unoptimized
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <a
      href={message.mediaUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex min-h-10 items-center gap-2 rounded-md bg-black/20 px-3 py-2 text-xs font-black underline-offset-4 hover:underline"
    >
      <PaperclipIcon className="h-4 w-4 flex-shrink-0" />
      <span className="min-w-0 truncate">Archivo adjunto</span>
    </a>
  )
}

function Avatar({ person, size }: { person: ChatRoomPerson; size: 'sm' | 'md' }) {
  const [failed, setFailed] = useState(false)
  const src = person.avatarUrl?.trim()
  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-9 w-9 text-xs'

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] ${sizeClasses}`}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={size === 'sm' ? '32px' : '36px'}
          unoptimized
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center toon-gradient-bg font-black text-white">
          {getInitials(formatPersonName(person))}
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role, compact = false }: { role: string | null; compact?: boolean }) {
  if (!isRolJerarquia(role)) {
    return null
  }

  return <RolBadge rol={role} size="sm" showLabel={!compact} className="flex-shrink-0" />
}

function EmptyThread() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-10 max-w-[280px] rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] px-5 py-7 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--c-surface2)] text-[var(--toon-orange)]">
        <MessageIcon className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-base font-black">Sin mensajes</h2>
      <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--c-muted)]">
        El primer avance del equipo aparecera aqui.
      </p>
    </motion.div>
  )
}

function VideoCallModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-call-title"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[340px] rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] p-5 text-center shadow-2xl"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#FF6B00]/45 bg-[#24140C] text-[#FFB020]">
          <CameraIcon className="h-6 w-6" />
        </div>
        <h2 id="video-call-title" className="mt-4 text-base font-black">
          Videollamada para presentacion - proximamente
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="toon-gradient-bg mt-5 flex h-11 w-full items-center justify-center rounded-lg text-sm font-black text-white"
        >
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  )
}

function formatDirectSubtitle(members: ChatRoomMember[], currentUserId: string | null): string {
  const otherMember = members.find((member) => member.id !== currentUserId)

  return otherMember?.artisticRole ?? 'Chat directo'
}

function formatMemberCount(count: number): string {
  return count === 1 ? '1 miembro' : `${count} miembros`
}

function formatPersonName(person: ChatRoomPerson): string {
  return person.name?.trim() || person.username?.trim() || 'Artista Toon'
}

function formatMessageType(type: ChatRoomMessageType): string {
  if (type === 'avance') {
    return 'Avance'
  }

  if (type === 'imagen') {
    return 'Imagen'
  }

  if (type === 'audio') {
    return 'Audio'
  }

  if (type === 'video') {
    return 'Video'
  }

  return 'Mensaje'
}

function formatMessageTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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

function isRolJerarquia(value: string | null): value is RolJerarquia {
  return value === 'creador' || value === 'trabajador' || value === 'espectador'
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 5 8 12l7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 8.25A2.25 2.25 0 0 1 6.75 6h6.5a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 13.25 18h-6.5a2.25 2.25 0 0 1-2.25-2.25v-7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m15.5 10 4-2.25v8.5l-4-2.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 6.75A2.75 2.75 0 0 1 7.75 4h8.5A2.75 2.75 0 0 1 19 6.75v6.5A2.75 2.75 0 0 1 16.25 16H11l-4.5 4v-4.2A2.75 2.75 0 0 1 5 13.25v-6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8.5 8.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 11.5h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m8.5 12.5 5.9-5.9a3.15 3.15 0 1 1 4.46 4.46l-7.7 7.7a4.4 4.4 0 0 1-6.22-6.22l7.2-7.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9.25 14.75 6.15-6.15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SendAdvanceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.75 19.25 20 12 4.75 4.75l1.8 6.05L13 12l-6.45 1.2-1.8 6.05Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13 12H6.55" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
