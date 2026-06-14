import BottomNav from '@/components/layout/BottomNav'
import sql from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import CreateClient, { type CreateCollaboration } from './CreateClient'

export const dynamic = 'force-dynamic'

interface CollaborationRow {
  proyecto_id: string
  subtitulo: string
  estado: string
  created_at: Date
  proyecto_nombre: string
  proyecto_descripcion: string | null
  proyecto_estado: string
  portada_url: string | null
  creador_name: string | null
  creador_username: string | null
}

export default async function CreatePage() {
  const currentUser = await getCurrentUser().catch((error) => {
    console.error('Error resolving current user for create page', error)

    return null
  })
  const collaborations = currentUser ? await listUserCollaborations(currentUser.id) : []

  return (
    <div className="app-shell bg-[var(--c-bg)]">
      <CreateClient collaborations={collaborations} isAuthenticated={Boolean(currentUser)} />
      <BottomNav />
    </div>
  )
}

async function listUserCollaborations(userId: string): Promise<CreateCollaboration[]> {
  try {
    const rows = await sql<CollaborationRow[]>`
      SELECT
        pm.proyecto_id,
        pm.subtitulo,
        pm.estado::text AS estado,
        pm.created_at,
        p.nombre AS proyecto_nombre,
        p.descripcion AS proyecto_descripcion,
        p.estado::text AS proyecto_estado,
        p.portada_url,
        u.name AS creador_name,
        u.username AS creador_username
      FROM toon.proyecto_miembros pm
      INNER JOIN toon.proyectos p ON p.id = pm.proyecto_id
      LEFT JOIN toon.users u ON u.id = p.creador_id
      WHERE pm.user_id = ${userId}
      ORDER BY
        CASE pm.estado
          WHEN 'activo' THEN 0
          WHEN 'solicitud' THEN 1
          ELSE 2
        END,
        pm.created_at DESC
      LIMIT 40
    `

    return rows.map((row) => ({
      proyectoId: row.proyecto_id,
      proyectoNombre: row.proyecto_nombre,
      proyectoDescripcion: row.proyecto_descripcion,
      proyectoEstado: row.proyecto_estado,
      portadaUrl: row.portada_url,
      subtitulo: row.subtitulo,
      estado: row.estado,
      creadorNombre: getDisplayName(row.creador_name, row.creador_username),
      createdAt: row.created_at.toISOString(),
    }))
  } catch (error) {
    console.error('Error listing create collaborations', error)

    return []
  }
}

function getDisplayName(name: string | null, username: string | null): string {
  const trimmedName = name?.trim()

  if (trimmedName) {
    return trimmedName
  }

  const trimmedUsername = username?.trim()

  return trimmedUsername ? `@${trimmedUsername}` : 'Creador Toonimatics'
}
