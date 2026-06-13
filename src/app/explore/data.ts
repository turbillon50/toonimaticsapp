import {
  getUserById,
  getUserRamas,
  listProyectos,
  searchProyectos,
  searchUsers,
  type Proyecto,
  type ToonUser,
  type UserRama,
} from '@/lib/queries'
import { RAMAS_ARTISTICAS, type RamaId, type RolJerarquia } from '@/lib/ramas'
import type { ExploreProyecto, ExploreSearchResult, ExploreUser, ExploreUserRama } from './types'

const DEFAULT_PROJECT_DESCRIPTION = 'Proyecto colaborativo de la comunidad Toonimatics.'
const INITIAL_USERS_QUERY = '%'

export async function getInitialExploreData(): Promise<ExploreSearchResult> {
  const [proyectos, usuarios] = await Promise.all([
    listProyectos(24),
    searchUsers(INITIAL_USERS_QUERY, 24),
  ])

  return hydrateExploreData(proyectos, usuarios)
}

export async function getExploreSearchResults(query: string): Promise<ExploreSearchResult> {
  const safeQuery = query.trim()

  if (!safeQuery) {
    return getInitialExploreData()
  }

  const [proyectos, usuarios] = await Promise.all([
    searchProyectos(safeQuery, 24),
    searchUsers(safeQuery, 24),
  ])

  return hydrateExploreData(proyectos, usuarios)
}

async function hydrateExploreData(
  proyectos: Proyecto[],
  usuarios: ToonUser[],
): Promise<ExploreSearchResult> {
  const [proyectosMapeados, usuariosMapeados] = await Promise.all([
    hydrateProyectos(proyectos),
    hydrateUsuarios(usuarios),
  ])

  return {
    proyectos: proyectosMapeados,
    usuarios: usuariosMapeados,
  }
}

async function hydrateProyectos(proyectos: Proyecto[]): Promise<ExploreProyecto[]> {
  const creadorIds = Array.from(new Set(proyectos.map((proyecto) => proyecto.creador_id)))
  const creadores = await Promise.all(creadorIds.map((creadorId) => getUserById(creadorId)))
  const creadorPorId = new Map(creadorIds.map((creadorId, index) => [creadorId, creadores[index] ?? null]))

  return proyectos.map((proyecto) => {
    const creador = creadorPorId.get(proyecto.creador_id) ?? null

    return {
      id: proyecto.id,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion?.trim() || DEFAULT_PROJECT_DESCRIPTION,
      estado: proyecto.estado,
      portada_url: proyecto.portada_url,
      creador: getUserDisplayName(creador, `Creador ${proyecto.creador_id.slice(0, 8)}`),
      creador_avatar_url: creador?.avatar_url ?? null,
      created_at: proyecto.created_at.toISOString(),
    }
  })
}

async function hydrateUsuarios(usuarios: ToonUser[]): Promise<ExploreUser[]> {
  const ramasPorUsuarioEntries = await Promise.all(
    usuarios.map(async (usuario) => {
      const ramas = await getUserRamas(usuario.id)

      return [usuario.id, ramas] as const
    }),
  )
  const ramasPorUsuario = new Map<string, UserRama[]>(ramasPorUsuarioEntries)

  return usuarios.map((usuario) => ({
    id: usuario.id,
    name: getUserDisplayName(usuario, 'Artista Toonimatics'),
    username: usuario.username,
    avatar_url: usuario.avatar_url,
    bio: usuario.bio,
    location: usuario.location,
    artistic_role: usuario.artistic_role,
    verified: usuario.verified,
    followers_count: usuario.followers_count,
    rol: toRolJerarquia(usuario.role),
    ramas: getExploreUserRamas(ramasPorUsuario.get(usuario.id) ?? [], usuario.artistic_role),
  }))
}

function getUserDisplayName(user: ToonUser | null, fallback: string): string {
  const name = user?.name?.trim()
  const username = user?.username?.trim()

  return name || username || fallback
}

function getExploreUserRamas(ramas: UserRama[], artisticRole: string | null): ExploreUserRama[] {
  if (ramas.length > 0) {
    return ramas.map((rama) => ({
      rama_id: rama.rama_id,
      subtitulo: rama.subtitulo,
    }))
  }

  const inferredRama = inferRamaFromArtisticRole(artisticRole)

  if (!inferredRama || !artisticRole?.trim()) {
    return []
  }

  return [
    {
      rama_id: inferredRama,
      subtitulo: artisticRole.trim(),
    },
  ]
}

function inferRamaFromArtisticRole(artisticRole: string | null): RamaId | null {
  const normalizedRole = normalizeText(artisticRole)

  if (!normalizedRole) {
    return null
  }

  const matchingRama = RAMAS_ARTISTICAS.find((rama) =>
    rama.subtitulos.some((subtitulo) => normalizeText(subtitulo).includes(normalizedRole)),
  )

  return matchingRama?.id ?? null
}

function normalizeText(value: string | null): string {
  return value
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim() ?? ''
}

function toRolJerarquia(role: string): RolJerarquia {
  const normalizedRole = role.toLowerCase()

  if (['admin', 'studio', 'creator', 'creador'].includes(normalizedRole)) {
    return 'creador'
  }

  if (['artist', 'worker', 'trabajador', 'collaborator', 'colaborador'].includes(normalizedRole)) {
    return 'trabajador'
  }

  return 'espectador'
}
