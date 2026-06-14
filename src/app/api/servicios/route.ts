import { NextResponse, type NextRequest } from 'next/server'

import sql from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

interface Servicio {
  id: string
  user_id: string
  titulo: string
  descripcion: string
  categoria: string
  precio_desde: number
  moneda: 'MXN'
  created_at: Date
}

interface CreateServicioBody {
  titulo: string
  descripcion: string
  categoria: string
  precio_desde: number
  moneda: 'MXN'
}

type CreateServicioInput = Partial<{
  titulo: unknown
  descripcion: unknown
  categoria: unknown
  precio_desde: unknown
  moneda: unknown
}>

let serviciosTableReady: Promise<void> | null = null

export async function GET() {
  const currentUser = await getCurrentUser().catch((error) => {
    console.error('Error resolving current user for servicios', error)

    return null
  })

  if (!currentUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    await ensureServiciosTable()

    const servicios = await sql<Servicio[]>`
      SELECT
        id,
        user_id,
        titulo,
        descripcion,
        categoria,
        precio_desde::float8 AS precio_desde,
        moneda,
        created_at
      FROM toon.servicios
      WHERE user_id = ${currentUser.id}
      ORDER BY created_at DESC
      LIMIT 100
    `

    return NextResponse.json({ servicios })
  } catch (error) {
    console.error('Error listing servicios', error)

    return NextResponse.json({ servicios: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser().catch((error) => {
    console.error('Error resolving current user for servicio creation', error)

    return null
  })

  if (!currentUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const rawBody: unknown = await request.json().catch(() => null)
  const body = parseCreateServicioBody(rawBody)

  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 })
  }

  try {
    await ensureServiciosTable()

    const servicios = await sql<Servicio[]>`
      INSERT INTO toon.servicios (
        user_id,
        titulo,
        descripcion,
        categoria,
        precio_desde,
        moneda
      )
      VALUES (
        ${currentUser.id},
        ${body.data.titulo},
        ${body.data.descripcion},
        ${body.data.categoria},
        ${body.data.precio_desde},
        ${body.data.moneda}
      )
      RETURNING
        id,
        user_id,
        titulo,
        descripcion,
        categoria,
        precio_desde::float8 AS precio_desde,
        moneda,
        created_at
    `

    return NextResponse.json({ servicio: servicios[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating servicio', error)

    return NextResponse.json({ error: 'No se pudo crear el servicio.' }, { status: 500 })
  }
}

async function ensureServiciosTable(): Promise<void> {
  if (!serviciosTableReady) {
    serviciosTableReady = createServiciosTable()
  }

  return serviciosTableReady
}

async function createServiciosTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS toon.servicios (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
      titulo TEXT NOT NULL CHECK (char_length(trim(titulo)) > 0),
      descripcion TEXT NOT NULL CHECK (char_length(trim(descripcion)) > 0),
      categoria TEXT NOT NULL CHECK (char_length(trim(categoria)) > 0),
      precio_desde NUMERIC(12, 2) NOT NULL CHECK (precio_desde >= 0),
      moneda TEXT NOT NULL DEFAULT 'MXN' CHECK (moneda = 'MXN'),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS servicios_user_id_created_at_idx
    ON toon.servicios (user_id, created_at DESC)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS servicios_categoria_idx
    ON toon.servicios (categoria)
  `
}

function parseCreateServicioBody(
  value: unknown,
): { ok: true; data: CreateServicioBody } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: 'Solicitud invalida.' }
  }

  const input: CreateServicioInput = value
  const titulo = typeof input.titulo === 'string' ? input.titulo.trim() : ''
  const descripcion = typeof input.descripcion === 'string' ? input.descripcion.trim() : ''
  const categoria = typeof input.categoria === 'string' ? input.categoria.trim() : ''
  const precioDesde = parseMoney(input.precio_desde)
  const moneda = typeof input.moneda === 'string' ? input.moneda.trim().toUpperCase() : 'MXN'

  if (!titulo) {
    return { ok: false, error: 'Agrega un titulo.' }
  }

  if (titulo.length > 120) {
    return { ok: false, error: 'Usa 120 caracteres o menos para el titulo.' }
  }

  if (!descripcion) {
    return { ok: false, error: 'Agrega una descripcion.' }
  }

  if (descripcion.length > 1000) {
    return { ok: false, error: 'Usa 1000 caracteres o menos para la descripcion.' }
  }

  if (!categoria) {
    return { ok: false, error: 'Agrega una categoria.' }
  }

  if (categoria.length > 80) {
    return { ok: false, error: 'Usa 80 caracteres o menos para la categoria.' }
  }

  if (precioDesde === null) {
    return { ok: false, error: 'Usa un precio valido mayor o igual a 0.' }
  }

  if (moneda !== 'MXN') {
    return { ok: false, error: 'La moneda debe ser MXN.' }
  }

  return {
    ok: true,
    data: {
      titulo,
      descripcion,
      categoria,
      precio_desde: precioDesde,
      moneda: 'MXN',
    },
  }
}

function parseMoney(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.trim()) : Number.NaN

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 9999999999.99) {
    return null
  }

  return Math.round(parsed * 100) / 100
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
