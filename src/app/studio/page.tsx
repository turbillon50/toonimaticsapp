import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import {
  getProyecto,
  getTareasByProyecto,
  getUserById,
  getUserRamas,
  listProyectos,
  type Proyecto,
  type TareaStudio as DbTareaStudio,
  type ToonUser,
} from '@/lib/queries'
import type { RamaId } from '@/lib/ramas'
import StudioClient, { type StudioProyecto, type StudioTareaItem } from './StudioClient'

export const dynamic = 'force-dynamic'

interface StudioPageProps {
  searchParams?: {
    proyecto?: string | string[]
  }
}

const DEFAULT_RAMA: RamaId = 'animacion'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const proyecto = await resolveProyecto(searchParams)
  const studioData = proyecto ? await getStudioData(proyecto) : { proyecto: null, tareas: [] }

  return (
    <div className="app-shell">
      <TopBar title="STUDIO" />
      <main className="page-content">
        <StudioClient
          key={studioData.proyecto?.id ?? 'sin-proyecto'}
          proyecto={studioData.proyecto}
          tareas={studioData.tareas}
        />
      </main>
      <BottomNav />
    </div>
  )
}

async function resolveProyecto(searchParams?: StudioPageProps['searchParams']): Promise<Proyecto | null> {
  const proyectoId = getProyectoId(searchParams)

  if (proyectoId) {
    const proyecto = await getProyecto(proyectoId)

    if (proyecto) {
      return proyecto
    }
  }

  const proyectos = await listProyectos()

  return proyectos.find((proyecto) => proyecto.estado === 'en_proceso') ?? proyectos[0] ?? null
}

async function getStudioData(proyecto: Proyecto): Promise<{ proyecto: StudioProyecto; tareas: StudioTareaItem[] }> {
  const [tareas, creador] = await Promise.all([
    getTareasByProyecto(proyecto.id),
    getUserById(proyecto.creador_id),
  ])
  const userIds = getUserIds(proyecto.creador_id, tareas)
  const ramaPorUsuario = await getRamaPorUsuario(userIds)
  const fallbackRama = ramaPorUsuario.get(proyecto.creador_id) ?? DEFAULT_RAMA
  const tareasStudio = tareas.map((tarea) => toStudioTarea(tarea, ramaPorUsuario, fallbackRama))
  const ramaPrincipal = tareasStudio.find((tarea) => !tarea.completada)?.ramaId ?? tareasStudio[0]?.ramaId ?? fallbackRama

  return {
    proyecto: {
      id: proyecto.id,
      nombre: proyecto.nombre,
      creador: getNombreCreador(creador, proyecto.creador_id),
      rol: proyecto.estado === 'en_proceso' ? 'Proyecto en proceso' : 'Proyecto terminado',
      ramaId: ramaPrincipal,
    },
    tareas: tareasStudio,
  }
}

function getProyectoId(searchParams?: StudioPageProps['searchParams']): string | null {
  const rawProyecto = searchParams?.proyecto
  const proyecto = Array.isArray(rawProyecto) ? rawProyecto[0] : rawProyecto

  if (!proyecto || !UUID_PATTERN.test(proyecto)) {
    return null
  }

  return proyecto
}

function getUserIds(creadorId: string, tareas: DbTareaStudio[]): string[] {
  const userIds = new Set<string>([creadorId])

  tareas.forEach((tarea) => {
    if (tarea.asignado_a) {
      userIds.add(tarea.asignado_a)
    }
  })

  return Array.from(userIds)
}

async function getRamaPorUsuario(userIds: string[]): Promise<Map<string, RamaId>> {
  const entries = await Promise.all(
    userIds.map(async (userId) => {
      const ramas = await getUserRamas(userId)

      return [userId, ramas[0]?.rama_id] as const
    }),
  )
  const ramaPorUsuario = new Map<string, RamaId>()

  entries.forEach(([userId, ramaId]) => {
    if (ramaId) {
      ramaPorUsuario.set(userId, ramaId)
    }
  })

  return ramaPorUsuario
}

function toStudioTarea(
  tarea: DbTareaStudio,
  ramaPorUsuario: Map<string, RamaId>,
  fallbackRama: RamaId,
): StudioTareaItem {
  return {
    id: tarea.id,
    titulo: tarea.titulo,
    descripcion: tarea.descripcion?.trim() || 'Tarea asignada al equipo del proyecto.',
    puntos: tarea.puntos,
    ramaId: tarea.asignado_a ? ramaPorUsuario.get(tarea.asignado_a) ?? fallbackRama : fallbackRama,
    vencimiento: formatFechaAsignacion(tarea.created_at),
    prioridad: getPrioridad(tarea.puntos),
    completada: tarea.completada,
  }
}

function getPrioridad(puntos: number): StudioTareaItem['prioridad'] {
  if (puntos >= 150) {
    return 'alta'
  }

  if (puntos >= 100) {
    return 'media'
  }

  return 'baja'
}

function formatFechaAsignacion(createdAt: Date): string {
  const formatter = new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
  })

  return `Asignada ${formatter.format(createdAt)}`
}

function getNombreCreador(user: ToonUser | null, creadorId: string): string {
  const name = user?.name?.trim()
  const username = user?.username?.trim()

  return name || username || `Creador ${creadorId.slice(0, 8)}`
}
