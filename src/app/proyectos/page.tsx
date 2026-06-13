import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import ProyectosGaleria, { type ProyectoGaleriaItem } from '@/components/proyectos/ProyectosGaleria'
import {
  getTareasByProyecto,
  getUserById,
  listProyectos,
  type Proyecto,
  type TareaStudio,
} from '@/lib/queries'

export const dynamic = 'force-dynamic'

type ProyectoConCreador = Proyecto & {
  creador?: string | null
  creador_name?: string | null
  creador_nombre?: string | null
  creador_username?: string | null
  name?: string | null
  username?: string | null
}

type CreadorBasico = {
  name?: string | null
  nombre?: string | null
  username?: string | null
  apodo?: string | null
} | null

export default async function ProyectosPage() {
  const proyectos = await listProyectos()
  const creadorIds = Array.from(new Set(proyectos.map((proyecto) => proyecto.creador_id)))
  const [tareasPorProyecto, creadores] = await Promise.all([
    Promise.all(proyectos.map((proyecto) => getTareasByProyecto(proyecto.id))),
    Promise.all(creadorIds.map((creadorId) => getUserById(creadorId))),
  ])
  const creadorEntries: Array<[string, CreadorBasico]> = creadorIds.map((creadorId, index) => [
    creadorId,
    creadores[index] ?? null,
  ])
  const creadorPorId = new Map<string, CreadorBasico>(creadorEntries)

  const proyectosGaleria = proyectos.map((proyecto, index) =>
    toProyectoGaleria(
      proyecto,
      tareasPorProyecto[index] ?? [],
      creadorPorId.get(proyecto.creador_id) ?? null,
    ),
  )

  return (
    <div className="app-shell">
      <TopBar title="Proyectos" />
      <main className="page-content">
        <ProyectosGaleria proyectos={proyectosGaleria} />
      </main>
      <BottomNav />
    </div>
  )
}

function toProyectoGaleria(
  proyecto: ProyectoConCreador,
  tareas: TareaStudio[],
  creador: CreadorBasico,
): ProyectoGaleriaItem {
  const descripcion = proyecto.descripcion?.trim() || 'Proyecto colaborativo de la comunidad Toonimatics.'

  return {
    id: proyecto.id,
    nombre: proyecto.nombre,
    descripcion,
    estado: proyecto.estado,
    portada_url: proyecto.portada_url,
    creador: getNombreCreador(proyecto, creador),
    colaboradores: getColaboradores(proyecto.creador_id, tareas),
    progreso: getProgreso(proyecto.estado, tareas),
    ultimaActividad: getActividad(proyecto.estado, proyecto.created_at),
    created_at: proyecto.created_at.toISOString(),
  }
}

function getNombreCreador(proyecto: ProyectoConCreador, creador: CreadorBasico): string {
  const nombre =
    creador?.name ??
    creador?.nombre ??
    creador?.username ??
    creador?.apodo ??
    proyecto.creador ??
    proyecto.creador_name ??
    proyecto.creador_nombre ??
    proyecto.name ??
    proyecto.username ??
    proyecto.creador_username

  if (nombre?.trim()) {
    return nombre.trim()
  }

  return `Creador ${proyecto.creador_id.slice(0, 8)}`
}

function getColaboradores(creadorId: string, tareas: TareaStudio[]): number {
  const colaboradores = new Set<string>([creadorId])

  tareas.forEach((tarea) => {
    if (tarea.asignado_a) {
      colaboradores.add(tarea.asignado_a)
    }
  })

  return colaboradores.size
}

function getProgreso(estado: Proyecto['estado'], tareas: TareaStudio[]): number {
  if (estado === 'terminado') {
    return 100
  }

  if (tareas.length === 0) {
    return 0
  }

  const completadas = tareas.filter((tarea) => tarea.completada).length

  return Math.round((completadas / tareas.length) * 100)
}

function getActividad(estado: Proyecto['estado'], createdAt: Date): string {
  if (estado === 'terminado') {
    return 'Publicado'
  }

  const formatter = new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
  })

  return `Creado ${formatter.format(createdAt)}`
}
