import { NextResponse } from 'next/server'
import sql from '@/lib/db'

interface TareaPatchContext {
  params: {
    id: string
  }
}

interface TareaPatchResult {
  id: string
  completada: boolean
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(_request: Request, { params }: TareaPatchContext) {
  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: 'ID de tarea invalido' }, { status: 400 })
  }

  try {
    const tareas = await sql<TareaPatchResult[]>`
      UPDATE toon.tareas_studio
      SET completada = true
      WHERE id = ${params.id}
      RETURNING id, completada
    `

    const tarea = tareas[0]

    if (!tarea) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ tarea })
  } catch {
    return NextResponse.json({ error: 'No se pudo completar la tarea' }, { status: 500 })
  }
}
