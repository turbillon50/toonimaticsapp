import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'
import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { getNotificaciones, type Notificacion } from '@/lib/queries'
import MessagesClient from './MessagesClient'
import type { MessageNotification } from './types'

export const dynamic = 'force-dynamic'

interface CurrentUserRow {
  id: string
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function MessagesPage() {
  const userId = await resolveCurrentUserId()
  const notificaciones = userId ? await getNotificaciones(userId) : []

  return (
    <div className="app-shell">
      <TopBar title="Mensajes" />
      <main className="page-content">
        <MessagesClient
          initialNotifications={notificaciones.map(toMessageNotification)}
          isAuthenticated={Boolean(userId)}
        />
      </main>
      <BottomNav />
    </div>
  )
}

async function resolveCurrentUserId(): Promise<string | null> {
  const session = await auth()
  const sessionUserId = session?.user?.id

  if (typeof sessionUserId === 'string' && UUID_PATTERN.test(sessionUserId)) {
    return sessionUserId
  }

  const email = session?.user?.email?.trim().toLowerCase()

  if (!email) {
    return null
  }

  const users = await sql<CurrentUserRow[]>`
    SELECT id
    FROM toon.users
    WHERE lower(email) = ${email}
    LIMIT 1
  `

  return users[0]?.id ?? null
}

function toMessageNotification(notificacion: Notificacion): MessageNotification {
  return {
    id: notificacion.id,
    user_id: notificacion.user_id,
    tipo: notificacion.tipo,
    mensaje: notificacion.mensaje,
    leida: notificacion.leida,
    created_at: notificacion.created_at.toISOString(),
  }
}
