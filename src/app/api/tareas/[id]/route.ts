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

interface TareaCompletadaRow extends TareaPatchResult {
  proyecto_id: string
  asignado_a: string | null
  titulo: string
  puntos: number
}

type CompletarTareaResult =
  | {
      estado: 'ok'
      tarea: TareaPatchResult
      puntosOtorgados: boolean
    }
  | {
      estado: 'not_found'
    }
  | {
      estado: 'sin_asignado'
    }
  | {
      estado: 'sin_puntos'
    }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(_request: Request, { params }: TareaPatchContext) {
  if (!UUID_PATTERN.test(params.id)) {
    return NextResponse.json({ error: 'ID de tarea invalido' }, { status: 400 })
  }

  try {
    const resultado = await sql.begin(async (tx) => {
      const tareas = await tx<TareaCompletadaRow[]>`
        SELECT id, proyecto_id, asignado_a, titulo, completada, puntos
        FROM toon.tareas_studio
        WHERE id = ${params.id}
        FOR UPDATE
      `

      const tarea = tareas[0]

      if (!tarea) {
        return {
          estado: 'not_found',
        } satisfies CompletarTareaResult
      }

      if (tarea.completada) {
        return {
          estado: 'ok',
          tarea: {
            id: tarea.id,
            completada: tarea.completada,
          },
          puntosOtorgados: false,
        } satisfies CompletarTareaResult
      }

      if (tarea.asignado_a === null) {
        return {
          estado: 'sin_asignado',
        } satisfies CompletarTareaResult
      }

      if (tarea.puntos <= 0) {
        return {
          estado: 'sin_puntos',
        } satisfies CompletarTareaResult
      }

      const tareasActualizadas = await tx<TareaPatchResult[]>`
        UPDATE toon.tareas_studio
        SET completada = true
        WHERE id = ${params.id}
        RETURNING id, completada
      `

      const tareaActualizada = tareasActualizadas[0]

      if (!tareaActualizada) {
        return {
          estado: 'not_found',
        } satisfies CompletarTareaResult
      }

      await tx`
        INSERT INTO toon.puntos (user_id, proyecto_id, cantidad, motivo)
        VALUES (
          ${tarea.asignado_a},
          ${tarea.proyecto_id},
          ${tarea.puntos},
          ${`Tarea completada: ${tarea.titulo}`}
        )
      `

      return {
        estado: 'ok',
        tarea: tareaActualizada,
        puntosOtorgados: true,
      } satisfies CompletarTareaResult
    })

    if (resultado.estado === 'not_found') {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
    }

    if (resultado.estado === 'sin_asignado') {
      return NextResponse.json({ error: 'La tarea no tiene usuario asignado' }, { status: 409 })
    }

    if (resultado.estado === 'sin_puntos') {
      return NextResponse.json({ error: 'La tarea no tiene puntos asignados' }, { status: 409 })
    }

    return NextResponse.json({
      tarea: resultado.tarea,
      puntosOtorgados: resultado.puntosOtorgados,
    })
  } catch {
    return NextResponse.json({ error: 'No se pudo completar la tarea' }, { status: 500 })
  }
}
