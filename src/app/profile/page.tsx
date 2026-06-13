import ProfileClient, {
  type PerfilRama,
  type PerfilUsuario,
  type ProyectoPerfil,
} from '@/components/profile/ProfileClient'
import type { ExperienciaItem } from '@/components/profile/ExperienciaCard'
import type { PortfolioItem } from '@/components/profile/PortfolioGrid'
import {
  getContenidoByUser,
  getProyectoMiembros,
  getPuntosByUser,
  getUserById,
  getUserByUsername,
  getUserRamas,
  listProyectos,
  listProyectosByCreador,
  type Contenido,
  type Proyecto,
  type ProyectoMiembro,
  type ToonUser,
  type UserRama,
} from '@/lib/queries'
import { RAMAS_ARTISTICAS, type RamaId, type RolJerarquia } from '@/lib/ramas'

export const dynamic = 'force-dynamic'

interface ProfilePageProps {
  searchParams?: {
    u?: string | string[]
  }
}

const DEFAULT_AVATAR = '/hf/artist.webp'
const DEFAULT_COVER = '/hf/cinematic.webp'
const DEFAULT_RAMA: RamaId = 'animacion'

export default async function ProfilePage({ searchParams }: ProfilePageProps): Promise<JSX.Element> {
  const user = await resolveProfileUser(searchParams)

  if (!user) {
    return <ProfileClient perfil={null} />
  }

  const [ramas, contenido, puntos, proyectos] = await Promise.all([
    getUserRamas(user.id),
    getContenidoByUser(user.id),
    getPuntosByUser(user.id),
    listProyectosByCreador(user.id, 6),
  ])
  const miembrosPorProyecto = await Promise.all(
    proyectos.map((proyecto) => getProyectoMiembros(proyecto.id)),
  )
  const perfil = toPerfilUsuario({
    user,
    ramas,
    contenido,
    puntos: puntos.puntos,
    proyectos,
    miembrosPorProyecto,
  })

  return <ProfileClient perfil={perfil} />
}

async function resolveProfileUser(searchParams?: ProfilePageProps['searchParams']): Promise<ToonUser | null> {
  const username = getRequestedUsername(searchParams)

  if (username) {
    const userByUsername = await getUserByUsername(username)

    if (userByUsername) {
      return userByUsername
    }
  }

  const proyectos = await listProyectos(1)
  const demoCreatorId = proyectos[0]?.creador_id

  return demoCreatorId ? getUserById(demoCreatorId) : null
}

function getRequestedUsername(searchParams?: ProfilePageProps['searchParams']): string | null {
  const rawUsername = searchParams?.u
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername
  const cleanUsername = username?.trim().replace(/^@+/, '')

  return cleanUsername || null
}

function toPerfilUsuario({
  user,
  ramas,
  contenido,
  puntos,
  proyectos,
  miembrosPorProyecto,
}: {
  user: ToonUser
  ramas: UserRama[]
  contenido: Contenido[]
  puntos: number
  proyectos: Proyecto[]
  miembrosPorProyecto: ProyectoMiembro[][]
}): PerfilUsuario {
  const perfilRamas = getPerfilRamas(user, ramas)
  const ramaPrincipal = perfilRamas[0]?.ramaId ?? DEFAULT_RAMA
  const subtituloPrincipal =
    perfilRamas[0]?.titulos[0] ??
    user.artistic_role?.trim() ??
    'Artista Toonimatics'

  return {
    id: user.id,
    nombre: getDisplayName(user),
    username: getUsername(user),
    apodo: subtituloPrincipal,
    descripcion: user.bio?.trim() || 'Artista de la comunidad Toonimatics.',
    avatarUrl: getMediaUrl(user.avatar_url, DEFAULT_AVATAR),
    coverUrl: getMediaUrl(user.cover_url, DEFAULT_COVER),
    ubicacion: user.location?.trim() || 'Latinoamerica',
    rol: getRolJerarquia(user.role),
    seguidores: user.followers_count,
    siguiendo: user.following_count,
    publicaciones: contenido.length,
    puntos,
    verificado: user.verified,
    ramas: perfilRamas,
    experiencia: getExperiencia(user, ramas, perfilRamas, puntos),
    contenido: contenido.map((item) => toPortfolioItem(item, ramaPrincipal)),
    proyectos: proyectos.map((proyecto, index) =>
      toProyectoPerfil(proyecto, miembrosPorProyecto[index] ?? [], ramaPrincipal),
    ),
  }
}

function getPerfilRamas(user: ToonUser, ramas: UserRama[]): PerfilRama[] {
  const groupedRamas = new Map<RamaId, string[]>()

  ramas.forEach((rama) => {
    const subtitulo = rama.subtitulo.trim()

    if (!subtitulo) {
      return
    }

    const titulos = groupedRamas.get(rama.rama_id) ?? []

    if (!titulos.includes(subtitulo)) {
      groupedRamas.set(rama.rama_id, [...titulos, subtitulo])
    }
  })

  const perfilRamas = Array.from(groupedRamas.entries()).map(([ramaId, titulos]) => ({
    ramaId,
    titulos,
  }))

  if (perfilRamas.length > 0) {
    return perfilRamas
  }

  return [getFallbackRama(user.artistic_role)]
}

function getFallbackRama(artisticRole: string | null): PerfilRama {
  const role = artisticRole?.trim()

  if (!role) {
    return {
      ramaId: DEFAULT_RAMA,
      titulos: ['Artista Toonimatics'],
    }
  }

  const ramaId = getRamaId(role)

  if (ramaId) {
    const rama = RAMAS_ARTISTICAS.find((item) => item.id === ramaId)

    return {
      ramaId,
      titulos: [rama?.subtitulos[0] ?? rama?.nombre ?? role],
    }
  }

  const ramaBySubtitle = RAMAS_ARTISTICAS.find((rama) =>
    rama.subtitulos.some((subtitulo) => normalize(subtitulo) === normalize(role)),
  )

  return {
    ramaId: ramaBySubtitle?.id ?? DEFAULT_RAMA,
    titulos: [role],
  }
}

function getExperiencia(
  user: ToonUser,
  ramas: UserRama[],
  perfilRamas: PerfilRama[],
  puntos: number,
): ExperienciaItem[] {
  const rows = ramas.length > 0
    ? ramas
    : perfilRamas.flatMap((rama) =>
        rama.titulos.map((titulo) => ({
          user_id: user.id,
          rama_id: rama.ramaId,
          subtitulo: titulo,
          experiencia_texto: null,
        })),
      )

  return rows.slice(0, 4).map((rama, index) => ({
    id: `${rama.rama_id}-${index}`,
    titulo: rama.subtitulo,
    estudio: 'Toonimatics',
    periodo: `Desde ${formatMonthYear(user.created_at)}`,
    ubicacion: user.location?.trim() || 'LATAM',
    ramaId: rama.rama_id,
    resumen:
      rama.experiencia_texto?.trim() ||
      `${rama.subtitulo} dentro de la comunidad artistica latinoamericana.`,
    logros: puntos > 0 ? [`${puntos} puntos`] : [],
  }))
}

function toPortfolioItem(item: Contenido, fallbackRama: RamaId): PortfolioItem {
  const mediaUrl = item.url.trim()

  return {
    id: item.id,
    tipo: item.tipo,
    titulo: item.titulo,
    descripcion: getContenidoDescripcion(item.tipo),
    thumbnailUrl: item.tipo === 'audio' ? undefined : mediaUrl,
    audioUrl: item.tipo === 'audio' ? mediaUrl : undefined,
    likes: item.likes,
    comentarios: 0,
    ramaId: fallbackRama,
    publicado: formatRelativeDate(item.created_at),
  }
}

function toProyectoPerfil(
  proyecto: Proyecto,
  miembros: ProyectoMiembro[],
  fallbackRama: RamaId,
): ProyectoPerfil {
  const colaboradores = new Set<string>([proyecto.creador_id])

  miembros.forEach((miembro) => {
    if (miembro.estado === 'activo') {
      colaboradores.add(miembro.user_id)
    }
  })

  return {
    id: proyecto.id,
    nombre: proyecto.nombre,
    estado: proyecto.estado,
    descripcion: proyecto.descripcion?.trim() || 'Proyecto colaborativo de la comunidad Toonimatics.',
    colaboradores: colaboradores.size,
    ramaId: fallbackRama,
  }
}

function getDisplayName(user: ToonUser): string {
  return user.name?.trim() || user.username?.trim() || user.email.split('@')[0] || `Usuario ${user.id.slice(0, 8)}`
}

function getUsername(user: ToonUser): string {
  return user.username?.trim() || user.email.split('@')[0] || user.id.slice(0, 8)
}

function getMediaUrl(value: string | null, fallback: string): string {
  return value?.trim() || fallback
}

function getRolJerarquia(role: string): RolJerarquia {
  if (role === 'creador' || role === 'trabajador' || role === 'espectador') {
    return role
  }

  return 'espectador'
}

function getRamaId(value: string): RamaId | null {
  return RAMAS_ARTISTICAS.find((rama) => rama.id === value)?.id ?? null
}

function getContenidoDescripcion(tipo: Contenido['tipo']): string {
  if (tipo === 'audio') {
    return 'Pieza sonora publicada en Toonimatics.'
  }

  if (tipo === 'animacion') {
    return 'Animacion publicada en el portfolio de Toonimatics.'
  }

  return 'Imagen publicada en el portfolio de Toonimatics.'
}

function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('es', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatRelativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.max(0, Math.floor(diffMs / 86_400_000))

  if (diffDays === 0) {
    return 'Hoy'
  }

  if (diffDays === 1) {
    return 'Hace 1 dia'
  }

  if (diffDays < 30) {
    return `Hace ${diffDays} dias`
  }

  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('es')
}
