import { NextResponse, type NextRequest } from 'next/server'

import sql from '@/lib/db'
import type { Proyecto, ProyectoEstado, ToonUser } from '@/lib/queries'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

interface CreateProyectoBody {
  nombre: string
  descripcion: string
  estado: ProyectoEstado
  portada_url: string | null
}

type CreateProyectoInput = Partial<{
  nombre: unknown
  descripcion: unknown
  estado: unknown
  portada_url: unknown
}>

const ALLOWED_ESTADOS: ProyectoEstado[] = ['en_proceso', 'terminado']

export async function GET() {
  try {
    const proyectos = await sql<Proyecto[]>`
      SELECT
        id,
        creador_id,
        nombre,
        descripcion,
        estado,
        portada_url,
        created_at
      FROM toon.proyectos
      ORDER BY created_at DESC
      LIMIT 100
    `

    return NextResponse.json({ proyectos })
  } catch (error) {
    console.error('Error listing proyectos', error)

    return NextResponse.json({ proyectos: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rawBody: unknown = await request.json().catch(() => null)
  const body = parseCreateProyectoBody(rawBody)

  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 })
  }

  try {
    const creator = await getProyectoCreator()

    if (!creator) {
      return NextResponse.json({ error: 'No hay un creador disponible para el proyecto.' }, { status: 409 })
    }

    const proyectos = await sql<Proyecto[]>`
      INSERT INTO toon.proyectos (
        creador_id,
        nombre,
        descripcion,
        estado,
        portada_url
      )
      VALUES (
        ${creator.id},
        ${body.data.nombre},
        ${body.data.descripcion},
        ${body.data.estado},
        ${body.data.portada_url}
      )
      RETURNING
        id,
        creador_id,
        nombre,
        descripcion,
        estado,
        portada_url,
        created_at
    `

    return NextResponse.json({ proyecto: proyectos[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating proyecto', error)

    return NextResponse.json({ error: 'No se pudo crear el proyecto.' }, { status: 500 })
  }
}

async function getProyectoCreator(): Promise<ToonUser | null> {
  const currentUser = await getCurrentUser().catch((error) => {
    console.error('Error resolving current user for proyecto creation', error)

    return null
  })

  if (currentUser) {
    return currentUser
  }

  const users = await sql<ToonUser[]>`
    SELECT
      id,
      email,
      name,
      username,
      avatar_url,
      cover_url,
      bio,
      role,
      artistic_role,
      location,
      instagram,
      tiktok,
      youtube,
      verified,
      verification_status,
      COALESCE(followers_count, 0)::int AS followers_count,
      COALESCE(following_count, 0)::int AS following_count,
      created_at
    FROM toon.users
    ORDER BY created_at ASC
    LIMIT 1
  `

  return users[0] ?? null
}

function parseCreateProyectoBody(
  value: unknown,
): { ok: true; data: CreateProyectoBody } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: 'Solicitud invalida.' }
  }

  const input: CreateProyectoInput = value
  const nombre = typeof input.nombre === 'string' ? input.nombre.trim() : ''
  const descripcion = typeof input.descripcion === 'string' ? input.descripcion.trim() : ''
  const estado = typeof input.estado === 'string' ? input.estado : ''
  const portadaUrl = normalizePortadaUrl(input.portada_url)

  if (!nombre) {
    return { ok: false, error: 'Agrega un nombre.' }
  }

  if (nombre.length > 120) {
    return { ok: false, error: 'Usa 120 caracteres o menos para el nombre.' }
  }

  if (!descripcion) {
    return { ok: false, error: 'Agrega una descripcion.' }
  }

  if (descripcion.length > 1000) {
    return { ok: false, error: 'Usa 1000 caracteres o menos para la descripcion.' }
  }

  if (!isProyectoEstado(estado)) {
    return { ok: false, error: 'Estado de proyecto invalido.' }
  }

  if (!portadaUrl.ok) {
    return { ok: false, error: 'La portada debe ser una URL http(s) o una ruta que empiece con /.' }
  }

  return {
    ok: true,
    data: {
      nombre,
      descripcion,
      estado,
      portada_url: portadaUrl.value,
    },
  }
}

function normalizePortadaUrl(value: unknown): { ok: true; value: string | null } | { ok: false } {
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

  if (trimmed.length > 500 || !isValidCoverPath(trimmed)) {
    return { ok: false }
  }

  return { ok: true, value: trimmed }
}

function isProyectoEstado(value: string): value is ProyectoEstado {
  return ALLOWED_ESTADOS.includes(value as ProyectoEstado)
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
