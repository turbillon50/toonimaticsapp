import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getNivelByPuntos, getProgresoNivel } from '@/lib/puntos'

interface PuntosRouteContext {
  params: {
    userId: string
  }
}

interface PuntosRow {
  puntos: number
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: PuntosRouteContext) {
  if (!UUID_PATTERN.test(params.userId)) {
    return NextResponse.json({ error: 'ID de usuario invalido' }, { status: 400 })
  }

  try {
    const puntos = await sql<PuntosRow[]>`
      SELECT
        COALESCE(SUM(cantidad), 0)::int AS puntos
      FROM toon.puntos
      WHERE user_id = ${params.userId}
    `

    const total = puntos[0]?.puntos ?? 0

    return NextResponse.json({
      userId: params.userId,
      puntos: total,
      nivel: getNivelByPuntos(total),
      progreso: getProgresoNivel(total),
    })
  } catch {
    return NextResponse.json({ error: 'No se pudieron obtener los puntos' }, { status: 500 })
  }
}
