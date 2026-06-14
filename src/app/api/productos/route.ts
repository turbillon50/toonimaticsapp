import { NextResponse, type NextRequest } from 'next/server'

import sql from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

interface Producto {
  id: string
  user_id: string
  nombre: string
  descripcion: string
  precio: number
  moneda: 'MXN'
  created_at: Date
}

interface CreateProductoBody {
  nombre: string
  descripcion: string
  precio: number
  moneda: 'MXN'
}

type CreateProductoInput = Partial<{
  nombre: unknown
  descripcion: unknown
  precio: unknown
  moneda: unknown
}>

let productosTableReady: Promise<void> | null = null

export async function GET() {
  const currentUser = await getCurrentUser().catch((error) => {
    console.error('Error resolving current user for productos', error)

    return null
  })

  if (!currentUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    await ensureProductosTable()

    const productos = await sql<Producto[]>`
      SELECT
        id,
        user_id,
        nombre,
        descripcion,
        precio::float8 AS precio,
        moneda,
        created_at
      FROM toon.productos
      WHERE user_id = ${currentUser.id}
      ORDER BY created_at DESC
      LIMIT 100
    `

    return NextResponse.json({ productos })
  } catch (error) {
    console.error('Error listing productos', error)

    return NextResponse.json({ productos: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser().catch((error) => {
    console.error('Error resolving current user for producto creation', error)

    return null
  })

  if (!currentUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const rawBody: unknown = await request.json().catch(() => null)
  const body = parseCreateProductoBody(rawBody)

  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 })
  }

  try {
    await ensureProductosTable()

    const productos = await sql<Producto[]>`
      INSERT INTO toon.productos (
        user_id,
        nombre,
        descripcion,
        precio,
        moneda
      )
      VALUES (
        ${currentUser.id},
        ${body.data.nombre},
        ${body.data.descripcion},
        ${body.data.precio},
        ${body.data.moneda}
      )
      RETURNING
        id,
        user_id,
        nombre,
        descripcion,
        precio::float8 AS precio,
        moneda,
        created_at
    `

    return NextResponse.json({ producto: productos[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating producto', error)

    return NextResponse.json({ error: 'No se pudo crear el producto.' }, { status: 500 })
  }
}

async function ensureProductosTable(): Promise<void> {
  if (!productosTableReady) {
    productosTableReady = createProductosTable()
  }

  return productosTableReady
}

async function createProductosTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS toon.productos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES toon.users(id) ON DELETE CASCADE,
      nombre TEXT NOT NULL CHECK (char_length(trim(nombre)) > 0),
      descripcion TEXT NOT NULL CHECK (char_length(trim(descripcion)) > 0),
      precio NUMERIC(12, 2) NOT NULL CHECK (precio >= 0),
      moneda TEXT NOT NULL DEFAULT 'MXN' CHECK (moneda = 'MXN'),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS productos_user_id_created_at_idx
    ON toon.productos (user_id, created_at DESC)
  `
}

function parseCreateProductoBody(
  value: unknown,
): { ok: true; data: CreateProductoBody } | { ok: false; error: string } {
  if (!isRecord(value)) {
    return { ok: false, error: 'Solicitud invalida.' }
  }

  const input: CreateProductoInput = value
  const nombre = typeof input.nombre === 'string' ? input.nombre.trim() : ''
  const descripcion = typeof input.descripcion === 'string' ? input.descripcion.trim() : ''
  const precio = parseMoney(input.precio)
  const moneda = typeof input.moneda === 'string' ? input.moneda.trim().toUpperCase() : 'MXN'

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

  if (precio === null) {
    return { ok: false, error: 'Usa un precio valido mayor o igual a 0.' }
  }

  if (moneda !== 'MXN') {
    return { ok: false, error: 'La moneda debe ser MXN.' }
  }

  return {
    ok: true,
    data: {
      nombre,
      descripcion,
      precio,
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
