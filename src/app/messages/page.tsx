import BottomNav from '@/components/layout/BottomNav'
import sql from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import MessagesClient from './MessagesClient'
import type { MessageChat, MessageChatKind } from './types'

export const dynamic = 'force-dynamic'

interface ChatRow {
  id: string
  kind: MessageChatKind
  name: string
  avatar_url: string | null
  last_message: string
  last_message_at: Date
  unread_count: number
  member_count: number
}

export default async function MessagesPage() {
  const currentUser = await getCurrentUser()
  const chats = currentUser ? await listChatsByUser(currentUser.id) : []

  return (
    <div className="app-shell">
      <main className="page-content bg-[var(--c-bg)]">
        <MessagesClient initialChats={chats} isAuthenticated={Boolean(currentUser)} />
      </main>
      <BottomNav />
    </div>
  )
}

async function listChatsByUser(userId: string): Promise<MessageChat[]> {
  const rows = await sql<ChatRow[]>`
    WITH participating_projects AS (
      SELECT DISTINCT
        p.id,
        p.creador_id,
        p.nombre,
        p.descripcion,
        p.portada_url,
        p.created_at
      FROM toon.proyectos p
      LEFT JOIN toon.proyecto_miembros current_member
        ON current_member.proyecto_id = p.id
       AND current_member.user_id = ${userId}
       AND current_member.estado = 'activo'
      WHERE p.creador_id = ${userId}
         OR current_member.user_id IS NOT NULL
    ),
    project_activity AS (
      SELECT
        pp.id AS proyecto_id,
        MAX(ts.created_at) AS latest_task_at,
        (ARRAY_AGG(ts.titulo ORDER BY ts.created_at DESC) FILTER (WHERE ts.id IS NOT NULL))[1] AS latest_task_title
      FROM participating_projects pp
      LEFT JOIN toon.tareas_studio ts ON ts.proyecto_id = pp.id
      GROUP BY pp.id
    ),
    project_unread AS (
      SELECT
        pp.id AS proyecto_id,
        COUNT(n.id)::int AS unread_count
      FROM participating_projects pp
      LEFT JOIN toon.notificaciones n
        ON n.user_id = ${userId}
       AND n.leida = false
       AND lower(n.tipo) IN ('mensaje', 'proyecto', 'tarea')
       AND n.mensaje ILIKE '%' || pp.nombre || '%'
      GROUP BY pp.id
    ),
    project_member_people AS (
      SELECT
        pp.id AS proyecto_id,
        pp.nombre AS proyecto_nombre,
        pp.creador_id AS user_id,
        pp.created_at AS activity_at
      FROM participating_projects pp

      UNION ALL

      SELECT
        pp.id AS proyecto_id,
        pp.nombre AS proyecto_nombre,
        pm.user_id,
        COALESCE(pm.created_at, pp.created_at) AS activity_at
      FROM participating_projects pp
      INNER JOIN toon.proyecto_miembros pm
        ON pm.proyecto_id = pp.id
       AND pm.estado = 'activo'
    ),
    project_members AS (
      SELECT
        proyecto_id,
        COUNT(DISTINCT user_id)::int AS member_count
      FROM project_member_people
      GROUP BY proyecto_id
    ),
    project_chats AS (
      SELECT
        pp.id::text AS id,
        'group'::text AS kind,
        pp.nombre AS name,
        pp.portada_url AS avatar_url,
        COALESCE(
          CASE
            WHEN pa.latest_task_title IS NOT NULL THEN 'Tarea: ' || pa.latest_task_title
            ELSE NULL
          END,
          NULLIF(pp.descripcion, ''),
          'Grupo del proyecto listo para avances'
        ) AS last_message,
        COALESCE(pa.latest_task_at, pp.created_at) AS last_message_at,
        COALESCE(pu.unread_count, 0)::int AS unread_count,
        COALESCE(pm.member_count, 1)::int AS member_count
      FROM participating_projects pp
      LEFT JOIN project_activity pa ON pa.proyecto_id = pp.id
      LEFT JOIN project_unread pu ON pu.proyecto_id = pp.id
      LEFT JOIN project_members pm ON pm.proyecto_id = pp.id
    ),
    collaborators AS (
      SELECT
        u.id::text AS id,
        COALESCE(NULLIF(u.name, ''), NULLIF(u.username, ''), 'Artista Toon') AS name,
        u.avatar_url,
        MAX(pmp.activity_at) AS last_message_at,
        COUNT(DISTINCT pmp.proyecto_id)::int AS project_count,
        (ARRAY_AGG(pmp.proyecto_nombre ORDER BY pmp.activity_at DESC))[1] AS latest_project
      FROM project_member_people pmp
      INNER JOIN toon.users u ON u.id = pmp.user_id
      WHERE pmp.user_id <> ${userId}
      GROUP BY u.id, u.name, u.username, u.avatar_url
    ),
    direct_chats AS (
      SELECT
        collaborators.id,
        'direct'::text AS kind,
        collaborators.name,
        collaborators.avatar_url,
        CASE
          WHEN collaborators.project_count = 1 THEN 'Colaboracion activa en ' || collaborators.latest_project
          ELSE collaborators.project_count::text || ' colaboraciones activas'
        END AS last_message,
        collaborators.last_message_at,
        0::int AS unread_count,
        2::int AS member_count
      FROM collaborators
    )
    SELECT
      id,
      kind,
      name,
      avatar_url,
      last_message,
      last_message_at,
      unread_count,
      member_count
    FROM (
      SELECT * FROM project_chats
      UNION ALL
      SELECT * FROM direct_chats
    ) chats
    ORDER BY last_message_at DESC, name ASC
    LIMIT 50
  `

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    avatarUrl: row.avatar_url,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at.toISOString(),
    unreadCount: row.unread_count,
    memberCount: row.member_count,
  }))
}
