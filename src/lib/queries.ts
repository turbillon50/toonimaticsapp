import sql from './db'
import type { RamaId, RolJerarquia } from './ramas'

export type UUID = string

export type ProyectoEstado = 'en_proceso' | 'terminado'
export type ProyectoMiembroEstado = 'solicitud' | 'activo' | 'expulsado'
export type ContenidoTipo = 'imagen' | 'animacion' | 'audio'

export interface ToonUser {
  id: UUID
  email: string
  telefono: string | null
  nombre: string | null
  apodo: string | null
  descripcion: string | null
  foto_url: string | null
  rol_jerarquia: RolJerarquia
  edad: number | null
  verificado_real: boolean
  control_parental: boolean
  fecha_nacimiento: string | null
  created_at: Date
}

export interface UserRama {
  user_id: UUID
  rama_id: RamaId
  subtitulo: string
  experiencia_texto: string | null
}

export interface Proyecto {
  id: UUID
  creador_id: UUID
  nombre: string
  descripcion: string | null
  estado: ProyectoEstado
  portada_url: string | null
  created_at: Date
}

export interface TareaStudio {
  id: UUID
  proyecto_id: UUID
  asignado_a: UUID | null
  titulo: string
  descripcion: string | null
  completada: boolean
  puntos: number
  created_at: Date
}

export interface Notificacion {
  id: UUID
  user_id: UUID
  tipo: string
  mensaje: string
  leida: boolean
  created_at: Date
}

export interface Contenido {
  id: UUID
  user_id: UUID
  tipo: ContenidoTipo
  url: string
  titulo: string
  likes: number
  created_at: Date
}

const clampLimit = (limit: number, max: number) => {
  const integerLimit = Number.isFinite(limit) ? Math.trunc(limit) : max

  return Math.min(Math.max(integerLimit, 1), max)
}

export async function getUserById(id: UUID): Promise<ToonUser | null> {
  const users = await sql<ToonUser[]>`
    SELECT
      id,
      email,
      telefono,
      nombre,
      apodo,
      descripcion,
      foto_url,
      rol_jerarquia,
      edad,
      verificado_real,
      control_parental,
      fecha_nacimiento,
      created_at
    FROM toon.users
    WHERE id = ${id}
    LIMIT 1
  `

  return users[0] ?? null
}

export async function getUserRamas(userId: UUID): Promise<UserRama[]> {
  return sql<UserRama[]>`
    SELECT
      user_id,
      rama_id,
      subtitulo,
      experiencia_texto
    FROM toon.user_ramas
    WHERE user_id = ${userId}
    ORDER BY rama_id ASC, subtitulo ASC
  `
}

export async function listProyectos(limit = 24): Promise<Proyecto[]> {
  const safeLimit = clampLimit(limit, 100)

  return sql<Proyecto[]>`
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
    LIMIT ${safeLimit}
  `
}

export async function getProyecto(id: UUID): Promise<Proyecto | null> {
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
    WHERE id = ${id}
    LIMIT 1
  `

  return proyectos[0] ?? null
}

export async function getTareasByProyecto(proyectoId: UUID): Promise<TareaStudio[]> {
  return sql<TareaStudio[]>`
    SELECT
      id,
      proyecto_id,
      asignado_a,
      titulo,
      descripcion,
      completada,
      puntos,
      created_at
    FROM toon.tareas_studio
    WHERE proyecto_id = ${proyectoId}
    ORDER BY completada ASC, created_at DESC
  `
}

export async function getNotificaciones(userId: UUID, limit = 30): Promise<Notificacion[]> {
  const safeLimit = clampLimit(limit, 100)

  return sql<Notificacion[]>`
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
    LIMIT ${safeLimit}
  `
}

export async function getContenidoByUser(userId: UUID, limit = 48): Promise<Contenido[]> {
  const safeLimit = clampLimit(limit, 100)

  return sql<Contenido[]>`
    SELECT
      id,
      user_id,
      tipo,
      url,
      titulo,
      likes,
      created_at
    FROM toon.contenido
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `
}
