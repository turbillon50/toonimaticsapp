import sql from './db'
import type { RamaId } from './ramas'

export type UUID = string

export type ProyectoEstado = 'en_proceso' | 'terminado'
export type ProyectoMiembroEstado = 'solicitud' | 'activo' | 'expulsado'
export type ContenidoTipo = 'imagen' | 'animacion' | 'audio'

export interface ToonUser {
  id: UUID
  email: string
  name: string | null
  username: string | null
  avatar_url: string | null
  cover_url: string | null
  bio: string | null
  role: string
  artistic_role: string | null
  location: string | null
  instagram: string | null
  tiktok: string | null
  youtube: string | null
  verified: boolean
  verification_status: string | null
  followers_count: number
  following_count: number
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

export interface ProyectoMiembro {
  proyecto_id: UUID
  user_id: UUID
  subtitulo: string
  estado: ProyectoMiembroEstado
  name: string | null
  username: string | null
  avatar_url: string | null
  artistic_role: string | null
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

export interface UserPuntos {
  user_id: UUID
  puntos: number
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
    WHERE id = ${id}
    LIMIT 1
  `

  return users[0] ?? null
}

export async function getUserByUsername(username: string): Promise<ToonUser | null> {
  const safeUsername = username.trim()

  if (!safeUsername) {
    return null
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
    WHERE lower(username) = lower(${safeUsername})
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

export async function getProyectoMiembros(proyectoId: UUID): Promise<ProyectoMiembro[]> {
  return sql<ProyectoMiembro[]>`
    SELECT
      pm.proyecto_id,
      pm.user_id,
      pm.subtitulo,
      pm.estado,
      u.name,
      u.username,
      u.avatar_url,
      u.artistic_role
    FROM toon.proyecto_miembros pm
    INNER JOIN toon.users u ON u.id = pm.user_id
    WHERE pm.proyecto_id = ${proyectoId}
    ORDER BY
      CASE pm.estado
        WHEN 'activo' THEN 0
        WHEN 'solicitud' THEN 1
        ELSE 2
      END,
      u.name ASC
  `
}

export async function listProyectosByCreador(creadorId: UUID, limit = 24): Promise<Proyecto[]> {
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
    WHERE creador_id = ${creadorId}
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `
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

export async function getPuntosByUser(userId: UUID): Promise<UserPuntos> {
  const puntos = await sql<UserPuntos[]>`
    SELECT
      ${userId}::uuid AS user_id,
      COALESCE(SUM(cantidad), 0)::int AS puntos
    FROM toon.puntos
    WHERE user_id = ${userId}
  `

  return puntos[0] ?? { user_id: userId, puntos: 0 }
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

export async function searchProyectos(query: string, limit = 24): Promise<Proyecto[]> {
  const safeQuery = query.trim()

  if (!safeQuery) {
    return []
  }

  const safeLimit = clampLimit(limit, 100)
  const pattern = `%${safeQuery}%`

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
    WHERE nombre ILIKE ${pattern}
      OR COALESCE(descripcion, '') ILIKE ${pattern}
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `
}

export async function searchUsers(query: string, limit = 24): Promise<ToonUser[]> {
  const safeQuery = query.trim()

  if (!safeQuery) {
    return []
  }

  const safeLimit = clampLimit(limit, 100)
  const pattern = `%${safeQuery}%`

  return sql<ToonUser[]>`
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
    WHERE name ILIKE ${pattern}
      OR username ILIKE ${pattern}
    ORDER BY followers_count DESC, created_at DESC
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
