import type { RamaId, RolJerarquia } from '@/lib/ramas'

export interface ExploreProyecto {
  id: string
  nombre: string
  descripcion: string
  estado: 'en_proceso' | 'terminado'
  portada_url: string | null
  creador: string
  creador_avatar_url: string | null
  created_at: string
}

export interface ExploreUserRama {
  rama_id: RamaId
  subtitulo: string
}

export interface ExploreUser {
  id: string
  name: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  artistic_role: string | null
  verified: boolean
  followers_count: number
  rol: RolJerarquia
  ramas: ExploreUserRama[]
}

export interface ExploreSearchResult {
  proyectos: ExploreProyecto[]
  usuarios: ExploreUser[]
}
