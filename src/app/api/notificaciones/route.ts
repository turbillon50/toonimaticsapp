import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CurrentUserRow {
  id: string
}

interface NotificacionRow {
  id: string
  user_id: string
  tipo: string
  mensaje: string
  leida: boolean
  created_at: Date
}

interface ApiNotificacion {
  id: string
  user_id: string
  tipo: string
  mensaje: string
  leida: boolean
  created_at: string
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET() {
  try {
    const userId = await resolveCurrentUserId()

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const notificaciones = await sql<NotificacionRow[]>`
      SELECT
        id,
        user_id,
        tipo,
        mensaje,
        leida,
        created_at
      FROM toon.notificaciones
      WHERE user_id = ${userId}
      ORDER BY leida ASC, created_at DESC
      LIMIT 100
    `

    return NextResponse.json({
      notificaciones: notificaciones.map(toApiNotificacion),
    })
  } catch {
    return NextResponse.json({ error: 'No se pudieron cargar las notificaciones' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await resolveCurrentUserId()

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await readPatchBody(request)

    if (!body || !UUID_PATTERN.test(body.id)) {
      return NextResponse.json({ error: 'ID de notificacion invalido' }, { status: 400 })
    }

    const notificaciones = await sql<NotificacionRow[]>`
      UPDATE toon.notificaciones
      SET leida = true
      WHERE id = ${body.id}
        AND user_id = ${userId}
      RETURNING
        id,
        user_id,
        tipo,
        mensaje,
        leida,
        created_at
    `
    const notificacion = notificaciones[0]

    if (!notificacion) {
      return NextResponse.json({ error: 'Notificacion no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ notificacion: toApiNotificacion(notificacion) })
  } catch {
    return NextResponse.json({ error: 'No se pudo marcar la notificacion' }, { status: 500 })
  }
}

async function resolveCurrentUserId(): Promise<string | null> {
  const session = await auth()
  const sessionUserId = session?.user?.id

  if (typeof sessionUserId === 'string' && UUID_PATTERN.test(sessionUserId)) {
    return sessionUserId
  }

  const email = session?.user?.email?.trim().toLowerCase()

  if (!email) {
    return null
  }

  const users = await sql<CurrentUserRow[]>`
    SELECT id
    FROM toon.users
    WHERE lower(email) = ${email}
    LIMIT 1
  `

  return users[0]?.id ?? null
}

async function readPatchBody(request: Request): Promise<{ id: string } | null> {
  try {
    const body = (await request.json()) as unknown

    if (!isRecord(body) || typeof body.id !== 'string') {
      return null
    }

    return { id: body.id.trim() }
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toApiNotificacion(notificacion: NotificacionRow): ApiNotificacion {
  return {
    ...notificacion,
    created_at: notificacion.created_at.toISOString(),
  }
}
