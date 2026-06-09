import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'

const handler = NextAuth({
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM || 'noreply@toonimatics.com',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    async session({ session, token }) {
      return session
    },
  },
})

export { handler as GET, handler as POST }
