import { auth } from '@/lib/auth'
import { getUserById, type ToonUser } from '@/lib/queries'

export async function getCurrentUser(): Promise<ToonUser | null> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return null
  }

  return getUserById(userId)
}
