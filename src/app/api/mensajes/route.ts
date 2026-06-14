import { NextResponse, type NextRequest } from 'next/server'

import sql from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

type MensajeTipo = 'texto' | 'imagen' | 'audio' | 'video' | 'avance'

interface MensajeRow {
  id: string
  chat_id: string
  autor_id: string
  contenido: string
  tipo: MensajeTipo
  media_url: string | null
  leido: boolean
  created_at: Date
  autor_nombre: string | null
  autor_username: string | null
  autor_avatar_url: string | null
  autor_artistic_role: string | null
  autor_role: string | null
}

interface ApiMensaje {
  id: string
  chatId: string
  authorId: string
  content: string
  type: MensajeTipo
  mediaUrl: string | null
  read: boolean
  createdAt: string
  author: {
    id: string
    name: string | null
    username: string | null
    avatarUrl: string | null
    artisticRole: string | null
    role: string | null
  }
}

interface CreateMensajeBody {
  chat_id: string
  contenido: string
  tipo: MensajeTipo
  media_url: string | null
}

type CreateMensajeInput = Partial<{
  chat_id: unknown
  contenido: unknown
  tipo: unknown
  media_url: unknown
}>

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MESSAGE_TYPES: MensajeTipo[] = ['texto', 'imagen', 'audio', 'video', 'avance']

export async function GET(request: NextRequest) {
  const chatId = request.nextUrl.searchParams.get('chat_id')?.trim() ?? ''

  if (!UUID_PATTERN.test(chatId)) {
    return NextResponse.json({ error: 'chat_id invalido' }, { status: 400 })
  }

  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const isMember = await userBelongsToChat(chatId, currentUser.id)

    if (!isMember) {
      return NextResponse.json({ error: 'No tienes acceso a este chat' }, { status: 403 })
    }

    const mensajes = await getMensajes(chatId)

    return NextResponse.json({ mensajes: mensajes.map(toApiMensaje) })
  } catch (error) {
    console.error('Error listing mensajes', error)

    return NextResponse.json({ error: 'No se pudieron cargar los mensajes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rawBody: unknown = await request.json().catch(() => null)
  const body = parseCreateMensajeBody(rawBody)

  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 })
  }

  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const isMember = await userBelongsToChat(body.data.chat_id, currentUser.id)

    if (!isMember) {
      return NextResponse.json({ error: 'No tienes acceso a este chat' }, { status: 403 })
    }

    const mensajes = await sql<MensajeRow[]>`
      WITH inserted AS (
        INSERT INTO toon.mensajes (
          chat_id,
          autor_id,
          contenido,
          tipo,
          media_url
        )
        VALUES (
          ${body.data.chat_id},
          ${currentUser.id},
          ${body.data.contenido},
          ${body.data.tipo},
          ${body.data.media_url}
        )
        RETURNING
          id,
          chat_id,
          autor_id,
          contenido,
          tipo,
          media_url,
          leido,
          created_at
      )
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
      FROM inserted m
      INNER JOIN toon.users u ON u.id = m.autor_id
      LIMIT 1
    `
    const mensaje = mensajes[0]

    if (!mensaje) {
      return NextResponse.json({ error: 'No se pudo crear el mensaje' }, { status: 500 })
    }

    return NextResponse.json({ mensaje: toApiMensaje(mensaje) }, { status: 201 })
  } catch (error) {
    console.error('Error creating mensaje', error)

    return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 500 })
  }
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

async function userBelongsToChat(chatId: string, userId: string): Promise<boolean> {
  const rows = await sql<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM toon.chat_miembros
      WHERE chat_id = ${chatId}
        AND user_id = ${userId}
    ) AS exists
  `

  return rows[0]?.exists ?? false
}

function parseCreateMensajeBody(
  value: unknown,
): { ok: true; data: CreateMensajeBody } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: 'Solicitud invalida' }
  }

  const input: CreateMensajeInput = value
  const chatId = typeof input.chat_id === 'string' ? input.chat_id.trim() : ''
  const contenido = typeof input.contenido === 'string' ? input.contenido.trim() : ''
  const tipo = typeof input.tipo === 'string' ? input.tipo.trim() : 'texto'
  const mediaUrl = normalizeMediaUrl(input.media_url)

  if (!UUID_PATTERN.test(chatId)) {
    return { ok: false, error: 'chat_id invalido' }
  }

  if (!contenido) {
    return { ok: false, error: 'El mensaje no puede estar vacio' }
  }

  if (contenido.length > 2000) {
    return { ok: false, error: 'Usa 2000 caracteres o menos' }
  }

  if (!isMensajeTipo(tipo)) {
    return { ok: false, error: 'Tipo de mensaje invalido' }
  }

  if (!mediaUrl.ok) {
    return { ok: false, error: 'media_url debe ser una URL http(s) o una ruta que empiece con /' }
  }

  return {
    ok: true,
    data: {
      chat_id: chatId,
      contenido,
      tipo,
      media_url: mediaUrl.value,
    },
  }
}

function normalizeMediaUrl(value: unknown): { ok: true; value: string | null } | { ok: false } {
  if (value === null || value === undefined) {
    return { ok: true, value: null }
  }

  if (typeof value !== 'string') {
    return { ok: false }
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return { ok: true, value: null }
  }

  if (trimmed.length > 1000) {
    return { ok: false }
  }

  if (trimmed.startsWith('/')) {
    return { ok: true, value: trimmed }
  }

  try {
    const url = new URL(trimmed)

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return { ok: true, value: trimmed }
    }

    return { ok: false }
  } catch {
    return { ok: false }
  }
}

function toApiMensaje(row: MensajeRow): ApiMensaje {
  return {
    id: row.id,
    chatId: row.chat_id,
    authorId: row.autor_id,
    content: row.contenido,
    type: row.tipo,
    mediaUrl: row.media_url,
    read: row.leido,
    createdAt: row.created_at.toISOString(),
    author: {
      id: row.autor_id,
      name: row.autor_nombre,
      username: row.autor_username,
      avatarUrl: row.autor_avatar_url,
      artisticRole: row.autor_artistic_role,
      role: row.autor_role,
    },
  }
}

function isMensajeTipo(value: string): value is MensajeTipo {
  return MESSAGE_TYPES.includes(value as MensajeTipo)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
