import NextAuth from 'next-auth'
import type { DefaultSession, Session } from 'next-auth'
import Resend from 'next-auth/providers/resend'

import sql from '@/lib/db'

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      id?: string
      needsOnboarding: boolean
    }
  }
}

interface AuthUserRow {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

function getTokenString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

async function getAuthUserByEmail(email: string): Promise<AuthUserRow | null> {
  const safeEmail = email.trim().toLowerCase()

  if (!safeEmail) {
    return null
  }

  const users = await sql<AuthUserRow[]>`
    SELECT
      id,
      email,
      name,
      avatar_url
    FROM toon.users
    WHERE lower(email) = ${safeEmail}
    LIMIT 1
  `

  return users[0] ?? null
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM || 'noreply@toonimatics.com',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      const email = user?.email ?? token.email

      if (!email) {
        token.toonUserId = undefined
        token.needsOnboarding = true
        return token
      }

      const toonUser = await getAuthUserByEmail(email)

      token.email = toonUser?.email ?? email
      token.name = toonUser?.name ?? user?.name ?? token.name
      token.picture = toonUser?.avatar_url ?? token.picture
      token.toonUserId = toonUser?.id
      token.needsOnboarding = toonUser === null

      return token
    },
    async session({ session, token }) {
      const email = token.email ?? session.user?.email ?? null
      const toonUserId = getTokenString(token.toonUserId)
      const user: NonNullable<Session['user']> = {
        name: token.name ?? session.user?.name ?? null,
        email,
        image: token.picture ?? session.user?.image ?? null,
        needsOnboarding: token.needsOnboarding === true,
        ...(toonUserId ? { id: toonUserId } : {}),
      }

      return {
        ...session,
        user,
      }
    },
  },
})
