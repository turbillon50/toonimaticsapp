import { notFound } from 'next/navigation'

import sql from '@/lib/db'
import * as queryModule from '@/lib/queries'
import { getCurrentUser } from '@/lib/session'
import ChatRoom, {
  type ChatRoomChat,
  type ChatRoomMember,
  type ChatRoomMessage,
  type ChatRoomMessageType,
} from './ChatRoom'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    chatId: string
  }
}

type DbMessageType = ChatRoomMessageType

interface MensajeRow {
  id: string
  chat_id: string
  autor_id: string
  contenido: string
  tipo: DbMessageType
  media_url: string | null
  leido: boolean
  created_at: Date
  autor_nombre: string | null
  autor_username: string | null
  autor_avatar_url: string | null
  autor_artistic_role: string | null
  autor_role: string | null
}

interface ChatMiembroRow {
  chat_id: string
  user_id: string
  name: string | null
  username: string | null
  avatar_url: string | null
  artistic_role: string | null
  role: string | null
  chat_nombre: string | null
  chat_tipo: 'directo' | 'grupo'
}

interface ChatInfoRow {
  id: string
  tipo: 'directo' | 'grupo'
  nombre: string | null
  proyecto_id: string | null
  member_count: number
}

interface ChatQueries {
  getMensajes?: (chatId: string) => Promise<unknown[]>
  getChatMiembros?: (chatId: string) => Promise<unknown[]>
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ChatPage({ params }: PageProps) {
  const chatId = params.chatId

  if (!UUID_PATTERN.test(chatId)) {
    notFound()
  }

  const currentUser = await getCurrentUser()
  const [messages, members, chatInfo] = await Promise.all([
    loadMensajes(chatId),
    loadChatMiembros(chatId),
    getChatInfo(chatId),
  ])

  if (!chatInfo) {
    notFound()
  }

  const chat: ChatRoomChat = {
    id: chatInfo.id,
    kind: chatInfo.tipo,
    name: resolveChatName(chatInfo, members, currentUser?.id ?? null),
    projectId: chatInfo.proyecto_id,
    memberCount: chatInfo.member_count || members.length,
  }

  return (
    <div className="app-shell bg-[var(--c-bg)]">
      <main className="flex min-h-0 flex-1 bg-[var(--c-bg)]">
        <ChatRoom
          chat={chat}
          currentUserId={currentUser?.id ?? null}
          initialMessages={messages}
          members={members}
        />
      </main>
    </div>
  )
}

async function loadMensajes(chatId: string): Promise<ChatRoomMessage[]> {
  const queries = queryModule as unknown as ChatQueries

  if (typeof queries.getMensajes === 'function') {
    const rows = await queries.getMensajes(chatId)

    return normalizeMessages(rows)
  }

  return normalizeMessages(await getMensajes(chatId))
}

async function loadChatMiembros(chatId: string): Promise<ChatRoomMember[]> {
  const queries = queryModule as unknown as ChatQueries

  if (typeof queries.getChatMiembros === 'function') {
    const rows = await queries.getChatMiembros(chatId)

    return normalizeMembers(rows)
  }

  return normalizeMembers(await getChatMiembros(chatId))
}

async function getMensajes(chatId: string): Promise<MensajeRow[]> {
  return sql<MensajeRow[]>`
    SELECT
      m.id,
      m.chat_id,
      m.autor_id,
      m.contenido,
      m.tipo,
      m.media_url,
      m.leido,
      m.created_at,
      u.name AS autor_nombre,
      u.username AS autor_username,
      u.avatar_url AS autor_avatar_url,
      u.artistic_role AS autor_artistic_role,
      u.role AS autor_role
    FROM toon.mensajes m
    INNER JOIN toon.users u ON u.id = m.autor_id
    WHERE m.chat_id = ${chatId}
    ORDER BY m.created_at ASC
  `
}

async function getChatMiembros(chatId: string): Promise<ChatMiembroRow[]> {
  return sql<ChatMiembroRow[]>`
    SELECT
      cm.chat_id,
      cm.user_id,
      u.name,
      u.username,
      u.avatar_url,
      u.artistic_role,
      u.role,
      c.nombre AS chat_nombre,
      c.tipo AS chat_tipo
    FROM toon.chat_miembros cm
    INNER JOIN toon.users u ON u.id = cm.user_id
    INNER JOIN toon.chats c ON c.id = cm.chat_id
    WHERE cm.chat_id = ${chatId}
    ORDER BY u.name ASC NULLS LAST, u.username ASC NULLS LAST
  `
}

async function getChatInfo(chatId: string): Promise<ChatInfoRow | null> {
  const chats = await sql<ChatInfoRow[]>`
    SELECT
      c.id,
      c.tipo,
      c.nombre,
      c.proyecto_id,
      COUNT(cm.user_id)::int AS member_count
    FROM toon.chats c
    LEFT JOIN toon.chat_miembros cm ON cm.chat_id = c.id
    WHERE c.id = ${chatId}
    GROUP BY c.id, c.tipo, c.nombre, c.proyecto_id
    LIMIT 1
  `

  return chats[0] ?? null
}

function normalizeMessages(rows: unknown[]): ChatRoomMessage[] {
  return rows.filter(isRecord).map((row) => {
    const nestedAuthor = isRecord(row.author) ? row.author : null
    const authorId = getString(row.autor_id) ?? getString(row.authorId) ?? getString(row.autorId) ?? getString(row.user_id) ?? getString(nestedAuthor?.id) ?? ''

    return {
      id: getString(row.id) ?? '',
      chatId: getString(row.chat_id) ?? getString(row.chatId) ?? '',
      authorId,
      content: getString(row.contenido) ?? getString(row.content) ?? '',
      type: normalizeMessageType(getString(row.tipo) ?? getString(row.type)),
      mediaUrl: getNullableString(row.media_url) ?? getNullableString(row.mediaUrl),
      read: getBoolean(row.leido) ?? getBoolean(row.read) ?? false,
      createdAt: serializeDate(row.created_at ?? row.createdAt),
      author: {
        id: authorId,
        name:
          getNullableString(row.autor_nombre) ??
          getNullableString(row.authorName) ??
          getNullableString(nestedAuthor?.name),
        username:
          getNullableString(row.autor_username) ??
          getNullableString(row.authorUsername) ??
          getNullableString(nestedAuthor?.username),
        avatarUrl:
          getNullableString(row.autor_avatar_url) ??
          getNullableString(row.authorAvatarUrl) ??
          getNullableString(nestedAuthor?.avatarUrl) ??
          getNullableString(nestedAuthor?.avatar_url),
        artisticRole:
          getNullableString(row.autor_artistic_role) ??
          getNullableString(row.authorArtisticRole) ??
          getNullableString(nestedAuthor?.artisticRole) ??
          getNullableString(nestedAuthor?.artistic_role),
        role:
          getNullableString(row.autor_role) ??
          getNullableString(row.authorRole) ??
          getNullableString(nestedAuthor?.role),
      },
    }
  })
}

function normalizeMembers(rows: unknown[]): ChatRoomMember[] {
  return rows.filter(isRecord).map((row) => ({
    id: getString(row.user_id) ?? getString(row.userId) ?? getString(row.id) ?? '',
    name: getNullableString(row.name),
    username: getNullableString(row.username),
    avatarUrl: getNullableString(row.avatar_url) ?? getNullableString(row.avatarUrl),
    artisticRole: getNullableString(row.artistic_role) ?? getNullableString(row.artisticRole),
    role: getNullableString(row.role),
  }))
}

function resolveChatName(
  chatInfo: ChatInfoRow,
  members: ChatRoomMember[],
  currentUserId: string | null,
): string {
  if (chatInfo.tipo === 'grupo') {
    return chatInfo.nombre?.trim() || 'Equipo Toonimatics'
  }

  const otherMember = members.find((member) => member.id !== currentUserId) ?? members[0]

  return otherMember ? formatMemberName(otherMember) : chatInfo.nombre?.trim() || 'Chat directo'
}

function formatMemberName(member: ChatRoomMember): string {
  return member.name?.trim() || member.username?.trim() || 'Artista Toon'
}

function normalizeMessageType(value: string | null | undefined): ChatRoomMessageType {
  if (value === 'imagen' || value === 'audio' || value === 'video' || value === 'avance') {
    return value
  }

  return 'texto'
}

function serializeDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
  }

  return new Date().toISOString()
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function getNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function getBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
